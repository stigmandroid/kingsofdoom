/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/schema.ts
 *
 * Responsabilidade:
 * Inicializar o schema persistente utilizado pelo
 * Kings of Doom Command Center.
 *
 * Nesta primeira versão, o banco armazena:
 *
 * - eventos oficiais do sorteio do Passe de Temporada;
 * - jogadores elegíveis congelados ao fim da CWL;
 * - vencedor oficial de cada temporada.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { DatabaseSync } from "node:sqlite";

/**
 * Cria as estruturas necessárias no banco.
 *
 * CREATE TABLE IF NOT EXISTS torna a inicialização
 * idempotente: pode ser executada várias vezes sem
 * apagar ou recriar os dados existentes.
 */
export function initializeDatabaseSchema(database: DatabaseSync): void {
  database.exec(`
    /**
     * ======================================================
     * EVENTOS DO PASSE DE TEMPORADA
     * ======================================================
     *
     * Existe no máximo um evento por clã e temporada.
     */
    CREATE TABLE IF NOT EXISTS season_pass_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      season TEXT NOT NULL,
      clan_tag TEXT NOT NULL,

      status TEXT NOT NULL
        CHECK (
          status IN (
            'scheduled',
            'drawn',
            'revealed'
          )
        ),

      /**
       * Momento oficial do sorteio.
       *
       * Será armazenado em ISO 8601.
       */
      scheduled_at TEXT NOT NULL,

      /**
* Momento em que o resultado poderá ser revelado
 * publicamente após a animação do sorteio.
 */
reveal_at TEXT NOT NULL,

      /**
       * Vencedor.
       *
       * Permanece NULL enquanto o sorteio
       * ainda não tiver ocorrido.
       */
      winner_tag TEXT,
      winner_name TEXT,

      /**
       * Momento em que o vencedor foi sorteado.
       */
      drawn_at TEXT,

      /**
       * Momento em que o resultado foi revelado.
       */
      revealed_at TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      UNIQUE (season, clan_tag)
    );

    /**
     * ======================================================
     * JOGADORES ELEGÍVEIS
     * ======================================================
     *
     * Esta tabela representa a fotografia definitiva
     * dos participantes após o encerramento da CWL.
     *
     * Depois de congelada, essa lista não depende mais
     * de novas respostas da Clash API.
     */
    CREATE TABLE IF NOT EXISTS season_pass_eligible_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      event_id INTEGER NOT NULL,

      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,

      wars_played INTEGER NOT NULL,
      attacks_used INTEGER NOT NULL,
      attacks_available INTEGER NOT NULL,

      stars INTEGER NOT NULL,
      destruction REAL NOT NULL,

      created_at TEXT NOT NULL,

      /**
       * Um jogador só pode aparecer uma vez
       * dentro do mesmo sorteio.
       */
      UNIQUE (event_id, player_tag),

      FOREIGN KEY (event_id)
        REFERENCES season_pass_events(id)
        ON DELETE CASCADE
    );

    /**
     * Índices utilizados nas consultas mais frequentes.
     */
    CREATE INDEX IF NOT EXISTS
      idx_season_pass_events_clan_season
    ON season_pass_events (
      clan_tag,
      season
    );

    CREATE INDEX IF NOT EXISTS
      idx_season_pass_events_status
    ON season_pass_events (
      status
    );

    CREATE INDEX IF NOT EXISTS
      idx_season_pass_players_event
    ON season_pass_eligible_players (
      event_id
    );
  `);
}
