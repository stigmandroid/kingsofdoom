/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/clan-games.repository.ts
 *
 * Responsabilidade:
 * Centralizar o acesso ao banco de dados relacionado aos
 * Jogos do Clã.
 *
 * Estratégia:
 * - criar ou localizar uma edição por clã e temporada;
 * - registrar baselines individuais;
 * - atualizar snapshots do achievement "Games Champion";
 * - calcular e persistir a pontuação corrente;
 * - permitir consultas para rankings e histórico.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 28/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";

export type ClanGamesEventRecord = {
  id: number;
  clan_tag: string;
  season: string;
  state: string;
  total_points: number;
  baseline_captured_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClanGamesMemberRecord = {
  id: number;
  clan_games_event_id: number;
  player_tag: string;
  player_name: string;
  baseline_points: number;
  current_points: number;
  final_rank: number | null;
  games_champion_baseline: number | null;
  games_champion_current: number | null;
  baseline_captured_at: string | null;
  last_collected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertClanGamesMemberInput = {
  eventId: number;
  playerTag: string;
  playerName: string;
  baselinePoints: number;
  gamesChampionBaseline: number | null;
  capturedAt: string;
};

/**
 * Localiza uma edição específica dos Jogos do Clã.
 */
export function findClanGamesEvent(
  clanTag: string,
  season: string,
): ClanGamesEventRecord | null {
  const statement = database.prepare(`
    SELECT *
    FROM clan_games_events
    WHERE clan_tag = ?
      AND season = ?
    LIMIT 1
  `);

  const row = statement.get(clanTag, season) as
    | ClanGamesEventRecord
    | undefined;

  return row ?? null;
}

/**
 * Cria a edição dos Jogos do Clã caso ainda não exista.
 *
 * Se ela já existir, apenas devolve o registro existente.
 */
export function ensureClanGamesEvent(
  clanTag: string,
  season: string,
  capturedAt: string,
): ClanGamesEventRecord {
  database
    .prepare(
      `
      INSERT INTO clan_games_events (
        clan_tag,
        season,
        state,
        total_points,
        baseline_captured_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, 'active', 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(clan_tag, season) DO UPDATE SET
        baseline_captured_at = COALESCE(
          clan_games_events.baseline_captured_at,
          excluded.baseline_captured_at
        ),
        updated_at = CURRENT_TIMESTAMP
    `,
    )
    .run(clanTag, season, capturedAt);

  const event = findClanGamesEvent(clanTag, season);

  if (!event) {
    throw new Error(
      `Não foi possível criar ou localizar os Jogos do Clã ${season} para ${clanTag}.`,
    );
  }

  return event;
}

/**
 * Registra o baseline individual de um membro.
 *
 * O baseline manual nunca deve ser sobrescrito
 * automaticamente depois de definido.
 */
export function upsertClanGamesMemberBaseline(
  input: UpsertClanGamesMemberInput,
): void {
  database
    .prepare(
      `
      INSERT INTO clan_games_members (
        clan_games_event_id,
        player_tag,
        player_name,
        baseline_points,
        current_points,
        games_champion_baseline,
        games_champion_current,
        baseline_captured_at,
        last_collected_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

      ON CONFLICT(clan_games_event_id, player_tag) DO UPDATE SET
        player_name = excluded.player_name,

        baseline_points =
          clan_games_members.baseline_points,

        games_champion_baseline =
          COALESCE(
            clan_games_members.games_champion_baseline,
            excluded.games_champion_baseline
          ),

        games_champion_current =
          COALESCE(
            excluded.games_champion_current,
            clan_games_members.games_champion_current
          ),

        baseline_captured_at =
          COALESCE(
            clan_games_members.baseline_captured_at,
            excluded.baseline_captured_at
          ),

        last_collected_at = excluded.last_collected_at,

        updated_at = CURRENT_TIMESTAMP
    `,
    )
    .run(
      input.eventId,
      input.playerTag,
      input.playerName,
      input.baselinePoints,
      input.baselinePoints,
      input.gamesChampionBaseline,
      input.gamesChampionBaseline,
      input.capturedAt,
      input.capturedAt,
    );
}

/**
 * Atualiza o snapshot acumulado de Games Champion
 * e recalcula a pontuação atual da edição.
 */
export function updateClanGamesMemberSnapshot(
  eventId: number,
  playerTag: string,
  gamesChampionCurrent: number,
  collectedAt: string,
): void {
  const member = database
    .prepare(
      `
      SELECT *
      FROM clan_games_members
      WHERE clan_games_event_id = ?
        AND player_tag = ?
      LIMIT 1
    `,
    )
    .get(eventId, playerTag) as ClanGamesMemberRecord | undefined;

  if (!member) {
    return;
  }

  const baselineAchievement =
    member.games_champion_baseline ?? gamesChampionCurrent;

  const delta = Math.max(0, gamesChampionCurrent - baselineAchievement);

  const currentPoints = member.baseline_points + delta;

  database
    .prepare(
      `
      UPDATE clan_games_members
      SET
        games_champion_current = ?,
        current_points = ?,
        last_collected_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE clan_games_event_id = ?
        AND player_tag = ?
    `,
    )
    .run(gamesChampionCurrent, currentPoints, collectedAt, eventId, playerTag);
}

/**
 * Recalcula a pontuação total do clã a partir
 * da soma das pontuações individuais persistidas.
 */
export function refreshClanGamesEventTotal(eventId: number): number {
  const result = database
    .prepare(
      `
      SELECT
        COALESCE(SUM(current_points), 0) AS total
      FROM clan_games_members
      WHERE clan_games_event_id = ?
    `,
    )
    .get(eventId) as { total: number };

  const total = Number(result.total ?? 0);

  database
    .prepare(
      `
      UPDATE clan_games_events
      SET
        total_points = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
    .run(total, eventId);

  return total;
}

/**
 * Lista todos os membros de uma edição,
 * ordenados pela pontuação atual.
 */
export function listClanGamesMembers(eventId: number): ClanGamesMemberRecord[] {
  return database
    .prepare(
      `
      SELECT *
      FROM clan_games_members
      WHERE clan_games_event_id = ?
      ORDER BY
        CASE
          WHEN final_rank IS NOT NULL THEN 0
          ELSE 1
        END ASC,
        final_rank ASC,
        current_points DESC,
        player_name COLLATE NOCASE ASC
    `,
    )
    .all(eventId) as ClanGamesMemberRecord[];
}

/**
 * Corrige a pontuação manual de baseline de um membro já persistido.
 *
 * Não altera o snapshot do achievement Games Champion.
 */
export function updateClanGamesBaselinePoints(
  eventId: number,
  playerTag: string,
  baselinePoints: number,
) {
  const db = database;

  db.prepare(
    `
    UPDATE clan_games_members
    SET
      baseline_points = ?,
      current_points = ? + MAX(
        0,
        COALESCE(
          games_champion_current,
          games_champion_baseline,
          0
        )
        -
        COALESCE(
          games_champion_baseline,
          games_champion_current,
          0
        )
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE clan_games_event_id = ?
      AND player_tag = ?
  `,
  ).run(baselinePoints, baselinePoints, eventId, playerTag);
}

/**
 * Localiza a edição mais recente dos Jogos do Clã
 * para um determinado clã.
 *
 * Utilizado pelas páginas de Event Intelligence
 * para exibir automaticamente o evento mais recente,
 * sem depender de uma temporada fixa no frontend.
 */
export function findLatestClanGamesEvent(
  clanTag: string,
): ClanGamesEventRecord | null {
  const statement = database.prepare(`
    SELECT *
    FROM clan_games_events
    WHERE clan_tag = ?
    ORDER BY
      season DESC,
      id DESC
    LIMIT 1
  `);

  const row = statement.get(clanTag) as ClanGamesEventRecord | undefined;

  return row ?? null;
}
