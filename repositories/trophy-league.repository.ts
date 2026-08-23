/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/trophy-league.repository.ts
 *
 * Responsabilidade:
 * Persistir e consultar os snapshots históricos da
 * Liga de Troféus.
 *
 * O repository é responsável por:
 *
 * • salvar snapshots individuais;
 * • preservar o clã acompanhado no momento da captura;
 * • recuperar snapshots por ID;
 * • recuperar o último estado conhecido de um jogador;
 * • recuperar o histórico de uma temporada específica.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";

/**
 * ==========================================================
 * TIPOS DE ENTRADA
 * ==========================================================
 */

/**
 * Dados necessários para persistir um novo snapshot.
 */
export type TrophyLeagueSnapshotInput = {
  /**
   * Clã acompanhado no momento da captura.
   */
  trackedClanTag?: string;
  trackedClanName?: string;

  /**
   * Identificação do jogador.
   */
  playerTag: string;
  playerName: string;

  /**
   * Momento da captura.
   */
  capturedAt: string;

  /**
   * Liga atual.
   */
  leagueTierId?: number;
  leagueTierName?: string;

  /**
   * Grupo e temporada atuais.
   */
  leagueGroupTag?: string;
  leagueSeasonId?: number;

  /**
   * Grupo e temporada anteriores.
   */
  previousLeagueGroupTag?: string;
  previousLeagueSeasonId?: number;

  /**
   * Desempenho atual.
   */
  trophies: number;
  bestTrophies: number;

  /**
   * Interpretação atual do peso competitivo.
   */
  baseScore: number;
  estimatedClanContribution: number;
};

/**
 * ==========================================================
 * TIPO DE DOMÍNIO
 * ==========================================================
 */

/**
 * Representação utilizada pela aplicação após leitura
 * do SQLite.
 */
export type TrophyLeagueSnapshot = {
  id: number;

  /**
   * Clã acompanhado no momento da captura.
   */
  trackedClanTag: string | null;
  trackedClanName: string | null;

  /**
   * Identificação do jogador.
   */
  playerTag: string;
  playerName: string;

  /**
   * Momento da captura.
   */
  capturedAt: string;

  /**
   * Liga atual.
   */
  leagueTierId: number | null;
  leagueTierName: string | null;

  /**
   * Grupo e temporada atuais.
   */
  leagueGroupTag: string | null;
  leagueSeasonId: number | null;

  /**
   * Grupo e temporada anteriores.
   */
  previousLeagueGroupTag: string | null;
  previousLeagueSeasonId: number | null;

  /**
   * Desempenho.
   */
  trophies: number;
  bestTrophies: number;

  /**
   * Peso competitivo.
   */
  baseScore: number;
  estimatedClanContribution: number;
};

/**
 * ==========================================================
 * TIPO INTERNO DO SQLITE
 * ==========================================================
 */

/**
 * Estrutura bruta retornada pelo SQLite.
 */
type TrophyLeagueSnapshotRow = {
  id: number;

  tracked_clan_tag: string | null;
  tracked_clan_name: string | null;

  player_tag: string;
  player_name: string;

  captured_at: string;

  league_tier_id: number | null;
  league_tier_name: string | null;

  league_group_tag: string | null;
  league_season_id: number | null;

  previous_league_group_tag: string | null;
  previous_league_season_id: number | null;

  trophies: number;
  best_trophies: number;

  base_score: number;
  estimated_clan_contribution: number;
};

/**
 * ==========================================================
 * MAPEAMENTO
 * ==========================================================
 */

/**
 * Converte a estrutura bruta do SQLite para o formato
 * utilizado pela aplicação.
 */
function mapSnapshot(row: TrophyLeagueSnapshotRow): TrophyLeagueSnapshot {
  return {
    id: row.id,

    trackedClanTag: row.tracked_clan_tag,

    trackedClanName: row.tracked_clan_name,

    playerTag: row.player_tag,

    playerName: row.player_name,

    capturedAt: row.captured_at,

    leagueTierId: row.league_tier_id,

    leagueTierName: row.league_tier_name,

    leagueGroupTag: row.league_group_tag,

    leagueSeasonId: row.league_season_id,

    previousLeagueGroupTag: row.previous_league_group_tag,

    previousLeagueSeasonId: row.previous_league_season_id,

    trophies: row.trophies,

    bestTrophies: row.best_trophies,

    baseScore: row.base_score,

    estimatedClanContribution: row.estimated_clan_contribution,
  };
}

/**
 * ==========================================================
 * PERSISTÊNCIA
 * ==========================================================
 */

/**
 * Salva um novo snapshot da Liga de Troféus.
 *
 * O snapshot preserva tanto o estado competitivo do jogador
 * quanto o clã acompanhado no momento da captura.
 */
export function saveTrophyLeagueSnapshot(
  input: TrophyLeagueSnapshotInput,
): TrophyLeagueSnapshot {
  const statement = database.prepare(`
    INSERT INTO trophy_league_snapshots (
      tracked_clan_tag,
      tracked_clan_name,

      player_tag,
      player_name,

      captured_at,

      league_tier_id,
      league_tier_name,

      league_group_tag,
      league_season_id,

      previous_league_group_tag,
      previous_league_season_id,

      trophies,
      best_trophies,

      base_score,
      estimated_clan_contribution
    )
    VALUES (
      ?,
      ?,

      ?,
      ?,

      ?,

      ?,
      ?,

      ?,
      ?,

      ?,
      ?,

      ?,
      ?,

      ?,
      ?
    )
  `);

  const result = statement.run(
    /**
     * Clã acompanhado.
     */
    input.trackedClanTag ?? null,
    input.trackedClanName ?? null,

    /**
     * Jogador.
     */
    input.playerTag,
    input.playerName,

    /**
     * Captura.
     */
    input.capturedAt,

    /**
     * Liga atual.
     */
    input.leagueTierId ?? null,
    input.leagueTierName ?? null,

    /**
     * Temporada atual.
     */
    input.leagueGroupTag ?? null,
    input.leagueSeasonId ?? null,

    /**
     * Temporada anterior.
     */
    input.previousLeagueGroupTag ?? null,
    input.previousLeagueSeasonId ?? null,

    /**
     * Troféus.
     */
    input.trophies,
    input.bestTrophies,

    /**
     * Peso competitivo.
     */
    input.baseScore,
    input.estimatedClanContribution,
  );

  const snapshotId = Number(result.lastInsertRowid);

  const snapshot = getTrophyLeagueSnapshotById(snapshotId);

  if (!snapshot) {
    throw new Error(
      "Não foi possível recuperar o snapshot da Liga de Troféus após a gravação.",
    );
  }

  return snapshot;
}

/**
 * ==========================================================
 * CONSULTA POR ID
 * ==========================================================
 */

/**
 * Recupera um snapshot específico através do seu ID.
 */
export function getTrophyLeagueSnapshotById(
  id: number,
): TrophyLeagueSnapshot | null {
  const row = database
    .prepare(
      `
      SELECT *
      FROM trophy_league_snapshots
      WHERE id = ?
      LIMIT 1
    `,
    )
    .get(id) as TrophyLeagueSnapshotRow | undefined;

  return row ? mapSnapshot(row) : null;
}

/**
 * ==========================================================
 * ÚLTIMO SNAPSHOT
 * ==========================================================
 */

/**
 * Recupera o snapshot mais recente conhecido de um jogador.
 *
 * Essa consulta é utilizada pela camada de serviço para
 * evitar persistência de registros duplicados.
 */
export function getLatestTrophyLeagueSnapshot(
  playerTag: string,
): TrophyLeagueSnapshot | null {
  const row = database
    .prepare(
      `
      SELECT *
      FROM trophy_league_snapshots
      WHERE player_tag = ?
      ORDER BY captured_at DESC, id DESC
      LIMIT 1
    `,
    )
    .get(playerTag) as TrophyLeagueSnapshotRow | undefined;

  return row ? mapSnapshot(row) : null;
}

/**
 * ==========================================================
 * HISTÓRICO DA TEMPORADA
 * ==========================================================
 */

/**
 * Recupera todos os snapshots conhecidos de um jogador
 * dentro de uma temporada específica.
 *
 * A ordenação cronológica permite posteriormente calcular:
 *
 * • evolução de troféus;
 * • mudanças de liga;
 * • progressão semanal;
 * • mudanças de clã;
 * • períodos de atividade e inatividade.
 */
export function getTrophyLeagueSeasonHistory(
  playerTag: string,
  leagueSeasonId: number,
): TrophyLeagueSnapshot[] {
  const rows = database
    .prepare(
      `
      SELECT *
      FROM trophy_league_snapshots
      WHERE player_tag = ?
        AND league_season_id = ?
      ORDER BY captured_at ASC, id ASC
    `,
    )
    .all(playerTag, leagueSeasonId) as TrophyLeagueSnapshotRow[];

  return rows.map(mapSnapshot);
}

/**
 * ==========================================================
 * LINHA DO TEMPO DO JOGADOR
 * ==========================================================
 */

/**
 * Recupera todos os snapshots conhecidos de um jogador
 * em ordem cronológica.
 *
 * Essa consulta serve como base para:
 *
 * • evolução observada de troféus;
 * • identificação de mudanças de liga;
 * • comparação entre temporadas;
 * • cálculo de deltas entre capturas consecutivas.
 */
export function getTrophyLeaguePlayerTimeline(
  playerTag: string,
): TrophyLeagueSnapshot[] {
  const rows = database
    .prepare(
      `
      SELECT *
      FROM trophy_league_snapshots
      WHERE player_tag = ?
      ORDER BY captured_at ASC, id ASC
    `,
    )
    .all(playerTag) as TrophyLeagueSnapshotRow[];

  return rows.map(mapSnapshot);
}
