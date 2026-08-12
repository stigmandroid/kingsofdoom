/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/cwl-archive-schema.ts
 *
 * Responsabilidade:
 * Definir o schema histórico da Clash War League.
 *
 * Objetivo:
 * Preservar permanentemente os dados brutos e normalizados
 * de cada temporada da CWL para futuras análises,
 * estatísticas e mecanismos de inteligência.
 *
 * Estrutura:
 *
 * cwl_seasons
 *      ↓
 * cwl_season_clans
 *
 * cwl_seasons
 *      ↓
 * cwl_rounds
 *      ↓
 * cwl_wars
 *      ↓
 * cwl_war_members
 *      ↓
 * cwl_attacks
 *
 * Estratégia:
 *
 * - armazenar dados normalizados para consultas rápidas;
 * - preservar payloads JSON para análises futuras;
 * - utilizar UNIQUE e UPSERT futuramente para permitir
 *   múltiplos snapshots sem duplicar registros;
 * - manter histórico independente da disponibilidade
 *   posterior da Clash API.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 10/08/2026
 *
 * Versão:
 * 0.8.3
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { DatabaseSync } from "node:sqlite";

/**
 * Inicializa todas as estruturas responsáveis pelo
 * arquivo histórico da Clash War League.
 *
 * CREATE TABLE IF NOT EXISTS permite executar esta
 * inicialização repetidamente sem destruir os dados
 * já armazenados.
 */
export function initializeCwlArchiveSchema(database: DatabaseSync): void {
  database.exec(`
    /**
     * ======================================================
     * TEMPORADAS DA CWL
     * ======================================================
     *
     * Representa um grupo específico de CWL acompanhado
     * por um dos clãs do Kings of Doom Command Center.
     *
     * Exemplo:
     *
     * season: 2026-08-03
     * tracked_clan_tag: #2GQ2UC2PV
     */
    CREATE TABLE IF NOT EXISTS cwl_seasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      /**
       * Identificador retornado pela Clash API.
       */
      season TEXT NOT NULL,

      /**
       * Clã utilizado como referência para consultar
       * este grupo.
       *
       * Isso permite arquivar separadamente CWLs do
       * K.O.D. e K.O.D.rec.
       */
      tracked_clan_tag TEXT NOT NULL,

      /**
       * Estado conhecido mais recente da temporada.
       *
       * Exemplos:
       *
       * preparation
       * inWar
       * ended
       */
      state TEXT NOT NULL,

      /**
       * Quantidade de rodadas existente no grupo.
       *
       * Normalmente sete em grupos de oito clãs.
       */
      total_rounds INTEGER NOT NULL DEFAULT 0,

      /**
       * Payload bruto do endpoint de grupo da CWL.
       *
       * Este campo é propositalmente preservado para
       * futuras análises que utilizem informações ainda
       * não normalizadas pelo sistema atual.
       */
      raw_json TEXT,

      /**
       * Primeiro momento em que esta temporada foi
       * observada pelo Command Center.
       */
      created_at TEXT NOT NULL,

      /**
       * Última vez em que o snapshot foi atualizado.
       */
      updated_at TEXT NOT NULL,

      /**
       * Um mesmo clã só pode possuir um registro
       * para determinada temporada.
       */
      UNIQUE (
        season,
        tracked_clan_tag
      )
    );

    /**
     * ======================================================
     * CLÃS PARTICIPANTES DA TEMPORADA
     * ======================================================
     *
     * Fotografia dos clãs que formam o grupo da CWL.
     */
    CREATE TABLE IF NOT EXISTS cwl_season_clans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      season_id INTEGER NOT NULL,

      clan_tag TEXT NOT NULL,
      clan_name TEXT NOT NULL,

      /**
       * Nível do clã observado durante a temporada.
       */
      clan_level INTEGER,

      /**
       * URLs dos escudos preservadas em JSON.
       */
      badge_urls_json TEXT,

      /**
       * Quantidade de jogadores inscritos na
       * escalação da temporada.
       */
      roster_size INTEGER NOT NULL DEFAULT 0,

      /**
       * Payload bruto do clã dentro do grupo CWL.
       *
       * Inclui inclusive a lista de inscritos.
       */
      raw_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      UNIQUE (
        season_id,
        clan_tag
      ),

      FOREIGN KEY (season_id)
        REFERENCES cwl_seasons(id)
        ON DELETE CASCADE
    );

    /**
     * ======================================================
     * RODADAS
     * ======================================================
     *
     * Representa uma das rodadas pertencentes à temporada.
     */
    CREATE TABLE IF NOT EXISTS cwl_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      season_id INTEGER NOT NULL,

      /**
       * Índice interno:
       *
       * primeira rodada = 0
       *
       * Mantemos o índice original da API/aplicação
       * e calculamos a apresentação como index + 1.
       */
      round_index INTEGER NOT NULL,

      /**
       * Quantidade de tags de guerras conhecidas
       * naquela rodada.
       */
      war_count INTEGER NOT NULL DEFAULT 0,

      /**
       * Payload bruto da rodada.
       */
      raw_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      UNIQUE (
        season_id,
        round_index
      ),

      FOREIGN KEY (season_id)
        REFERENCES cwl_seasons(id)
        ON DELETE CASCADE
    );

    /**
     * ======================================================
     * GUERRAS DA CWL
     * ======================================================
     *
     * Cada guerra pertence a uma única rodada.
     *
     * Guardamos dados suficientes para reconstruir
     * completamente o confronto mesmo futuramente.
     */
    CREATE TABLE IF NOT EXISTS cwl_wars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      season_id INTEGER NOT NULL,
      round_id INTEGER NOT NULL,

      /**
       * Tag oficial da guerra utilizada pelo endpoint
       * de consulta individual da CWL.
       */
      war_tag TEXT NOT NULL,

      /**
       * Estado mais recente conhecido.
       *
       * preparation
       * inWar
       * warEnded
       */
      state TEXT NOT NULL,

      /**
       * Quantidade de jogadores por lado.
       *
       * Exemplos:
       * 15
       * 30
       */
      team_size INTEGER,

      /**
       * Ataques disponíveis por jogador.
       *
       * Na CWL normalmente é 1.
       */
      attacks_per_member INTEGER,

      preparation_start_time TEXT,
      start_time TEXT,
      end_time TEXT,

      /**
       * ====================================================
       * LADO CLAN
       * ====================================================
       */
      clan_tag TEXT NOT NULL,
      clan_name TEXT NOT NULL,

      clan_level INTEGER,

      clan_stars INTEGER NOT NULL DEFAULT 0,
      clan_destruction REAL NOT NULL DEFAULT 0,
      clan_attacks INTEGER NOT NULL DEFAULT 0,

      clan_badge_urls_json TEXT,

      /**
       * ====================================================
       * LADO OPPONENT
       * ====================================================
       */
      opponent_tag TEXT NOT NULL,
      opponent_name TEXT NOT NULL,

      opponent_level INTEGER,

      opponent_stars INTEGER NOT NULL DEFAULT 0,
      opponent_destruction REAL NOT NULL DEFAULT 0,
      opponent_attacks INTEGER NOT NULL DEFAULT 0,

      opponent_badge_urls_json TEXT,

      /**
       * Payload completo da guerra.
       *
       * Este é um dos campos mais importantes do
       * arquivo histórico.
       *
       * Mesmo que no futuro a aplicação passe a analisar
       * novas propriedades da Clash API, o snapshot
       * original continuará disponível.
       */
      raw_json TEXT NOT NULL,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      /**
       * A tag da guerra é globalmente única dentro
       * do histórico conhecido.
       */
      UNIQUE (war_tag),

      FOREIGN KEY (season_id)
        REFERENCES cwl_seasons(id)
        ON DELETE CASCADE,

      FOREIGN KEY (round_id)
        REFERENCES cwl_rounds(id)
        ON DELETE CASCADE
    );

    /**
     * ======================================================
     * MEMBROS DE CADA GUERRA
     * ======================================================
     *
     * Importante:
     *
     * esta tabela representa a escalação daquela guerra,
     * não apenas a inscrição geral da temporada.
     *
     * Isso permite descobrir futuramente:
     *
     * - quem realmente jogou cada rodada;
     * - posição no mapa;
     * - Centro de Vila;
     * - quem ficou de fora;
     * - ataques utilizados;
     * - desempenho por escalação.
     */
    CREATE TABLE IF NOT EXISTS cwl_war_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      war_id INTEGER NOT NULL,

      /**
       * Identifica em qual lado da resposta da API
       * o jogador estava.
       *
       * clan
       * opponent
       */
      side TEXT NOT NULL
        CHECK (
          side IN (
            'clan',
            'opponent'
          )
        ),

      clan_tag TEXT NOT NULL,

      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,

      /**
       * Centro de Vila durante aquela guerra.
       *
       * É importante armazená-lo por guerra, pois o
       * jogador pode evoluir entre temporadas.
       */
      town_hall_level INTEGER,

      /**
       * Posição do jogador na escalação.
       */
      map_position INTEGER,

      /**
       * Número de ataques recebidos pelo jogador,
       * quando disponibilizado pela API.
       */
      opponent_attacks INTEGER,

      /**
       * Melhor ataque recebido preservado em JSON.
       */
      best_opponent_attack_json TEXT,

      /**
       * Payload bruto do membro naquela guerra.
       */
      raw_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      UNIQUE (
        war_id,
        player_tag
      ),

      FOREIGN KEY (war_id)
        REFERENCES cwl_wars(id)
        ON DELETE CASCADE
    );

    /**
     * ======================================================
     * ATAQUES
     * ======================================================
     *
     * Esta é a tabela mais importante para futura
     * inteligência individual.
     *
     * Cada linha representa UM ataque real.
     *
     * A partir dela poderemos calcular futuramente:
     *
     * - taxa de 3 estrelas;
     * - falhas de ataque;
     * - 0★ / 1★ / 2★ / 3★;
     * - destruição média;
     * - performance por rodada;
     * - performance contra CV igual;
     * - performance contra CV superior/inferior;
     * - consistência;
     * - evolução histórica;
     * - aproveitamento em CWL.
     */
    CREATE TABLE IF NOT EXISTS cwl_attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      war_id INTEGER NOT NULL,

      /**
       * Jogador que realizou o ataque.
       */
      attacker_tag TEXT NOT NULL,

      /**
       * Jogador que recebeu o ataque.
       */
      defender_tag TEXT NOT NULL,

      /**
       * Centro de Vila do atacante no momento
       * daquela guerra.
       *
       * Será preenchido pelo archiver utilizando
       * a escalação da guerra.
       */
      attacker_town_hall INTEGER,

      /**
       * Centro de Vila do defensor.
       */
      defender_town_hall INTEGER,

      /**
       * Resultado do ataque.
       */
      stars INTEGER NOT NULL,

      destruction REAL NOT NULL,

      /**
       * Ordem global do ataque dentro da guerra,
       * quando disponibilizada pela Clash API.
       */
      attack_order INTEGER,

      /**
       * Duração do ataque em segundos,
       * caso disponibilizada pela API.
       */
      duration INTEGER,

      /**
       * Diferença de Centro de Vila.
       *
       * Exemplos:
       *
       *  0 = mesmo CV
       *  1 = atacante um CV acima
       * -1 = atacante um CV abaixo
       *
       * Será calculado durante o arquivamento.
       */
      town_hall_difference INTEGER,

      /**
       * Classificação derivada do ataque.
       *
       * Exemplos futuros:
       *
       * triple
       * two_star
       * one_star
       * zero_star
       *
       * Mantemos o campo para facilitar análises.
       */
      result_type TEXT,

      /**
       * Payload bruto do ataque.
       */
      raw_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      /**
       * A ordem de ataque dentro de uma guerra é o
       * identificador mais estável disponível.
       *
       * Quando attack_order existir, o repository
       * utilizará esta combinação para UPSERT.
       */
      UNIQUE (
        war_id,
        attack_order
      ),

      FOREIGN KEY (war_id)
        REFERENCES cwl_wars(id)
        ON DELETE CASCADE
    );

    /**
     * ======================================================
     * ÍNDICES
     * ======================================================
     *
     * Estes índices antecipam as consultas mais
     * importantes para a camada de inteligência.
     */

    CREATE INDEX IF NOT EXISTS
      idx_cwl_seasons_tracked_clan
    ON cwl_seasons (
      tracked_clan_tag,
      season
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_season_clans_tag
    ON cwl_season_clans (
      clan_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_rounds_season
    ON cwl_rounds (
      season_id,
      round_index
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_wars_season
    ON cwl_wars (
      season_id
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_wars_round
    ON cwl_wars (
      round_id
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_wars_clan
    ON cwl_wars (
      clan_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_wars_opponent
    ON cwl_wars (
      opponent_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_war_members_player
    ON cwl_war_members (
      player_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_war_members_war
    ON cwl_war_members (
      war_id
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_attacks_war
    ON cwl_attacks (
      war_id
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_attacks_attacker
    ON cwl_attacks (
      attacker_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_attacks_defender
    ON cwl_attacks (
      defender_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_attacks_result
    ON cwl_attacks (
      stars,
      result_type
    );

    CREATE INDEX IF NOT EXISTS
      idx_cwl_attacks_th_matchup
    ON cwl_attacks (
      attacker_town_hall,
      defender_town_hall
    );
  `);
}
