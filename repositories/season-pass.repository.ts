/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/season-pass.repository.ts
 *
 * Responsabilidade:
 * Centralizar as operações de persistência relacionadas
 * aos eventos do Passe de Temporada da CWL.
 *
 * Funcionalidades:
 *
 * - consultar evento por clã e temporada;
 * - consultar o último evento persistido de um clã;
 * - criar evento agendado;
 * - congelar jogadores elegíveis;
 * - consultar jogadores elegíveis;
 * - registrar vencedor;
 * - marcar resultado como revelado.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 12/08/2026
 *
 * Versão:
 * 0.8.6
 *
 * Status:
 * ✅ Correção pós-CWL
 * ==========================================================
 */

import { database } from "@/lib/db/database";

import type { SeasonPassEligiblePlayer } from "@/lib/cwl/calculate-season-pass-eligibility";

export type SeasonPassEventStatus = "scheduled" | "drawn" | "revealed";

export type SeasonPassEventRecord = {
  id: number;
  season: string;
  clanTag: string;
  status: SeasonPassEventStatus;
  scheduledAt: string;
  revealAt: string;
  winnerTag?: string;
  winnerName?: string;
  drawnAt?: string;
  revealedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SeasonPassEligiblePlayerRecord = SeasonPassEligiblePlayer & {
  id: number;
  eventId: number;
  createdAt: string;
};

type SeasonPassEventRow = {
  id: number;
  season: string;
  clan_tag: string;
  status: SeasonPassEventStatus;
  scheduled_at: string;
  reveal_at: string;
  winner_tag: string | null;
  winner_name: string | null;
  drawn_at: string | null;
  revealed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function findSeasonPassEvent({
  season,
  clanTag,
}: {
  season: string;
  clanTag: string;
}): SeasonPassEventRecord | null {
  const statement = database.prepare(`
    SELECT
      id,
      season,
      clan_tag,
      status,
      scheduled_at,
      reveal_at,
      winner_tag,
      winner_name,
      drawn_at,
      revealed_at,
      created_at,
      updated_at
    FROM season_pass_events
    WHERE season = ?
      AND clan_tag = ?
    LIMIT 1
  `);

  const row = statement.get(season, clanTag) as SeasonPassEventRow | undefined;

  if (!row) {
    return null;
  }

  return mapEventRow(row);
}

/**
 * Recupera o evento mais recente persistido para um clã.
 *
 * Isso permite continuar o ciclo do Passe mesmo depois que
 * a Clash API deixa de disponibilizar a CWL encerrada.
 */
export function findLatestSeasonPassEventByClan(
  clanTag: string,
): SeasonPassEventRecord | null {
  const statement = database.prepare(`
    SELECT
      id,
      season,
      clan_tag,
      status,
      scheduled_at,
      reveal_at,
      winner_tag,
      winner_name,
      drawn_at,
      revealed_at,
      created_at,
      updated_at
    FROM season_pass_events
    WHERE clan_tag = ?
    ORDER BY scheduled_at DESC, id DESC
    LIMIT 1
  `);

  const row = statement.get(clanTag) as SeasonPassEventRow | undefined;

  if (!row) {
    return null;
  }

  return mapEventRow(row);
}

export function createScheduledSeasonPassEvent({
  season,
  clanTag,
  scheduledAt,
  revealAt,
}: {
  season: string;
  clanTag: string;
  scheduledAt: string;
  revealAt: string;
}): SeasonPassEventRecord {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    INSERT INTO season_pass_events (
      season,
      clan_tag,
      status,
      scheduled_at,
      reveal_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'scheduled', ?, ?, ?, ?)
  `);

  const result = statement.run(
    season,
    clanTag,
    scheduledAt,
    revealAt,
    now,
    now,
  );

  const event = findSeasonPassEvent({ season, clanTag });

  if (!event) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar evento recém-criado. id=${result.lastInsertRowid}`,
    );
  }

  return event;
}

export function replaceSeasonPassEligiblePlayers({
  eventId,
  players,
}: {
  eventId: number;
  players: SeasonPassEligiblePlayer[];
}): void {
  database.exec("BEGIN IMMEDIATE TRANSACTION;");

  try {
    const deleteStatement = database.prepare(`
      DELETE FROM season_pass_eligible_players
      WHERE event_id = ?
    `);

    deleteStatement.run(eventId);

    const insertStatement = database.prepare(`
      INSERT INTO season_pass_eligible_players (
        event_id,
        player_tag,
        player_name,
        wars_played,
        attacks_used,
        attacks_available,
        stars,
        destruction,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    players.forEach((player) => {
      insertStatement.run(
        eventId,
        player.tag,
        player.name,
        player.warsPlayed,
        player.attacksUsed,
        player.attacksAvailable,
        player.stars,
        player.destruction,
        now,
      );
    });

    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
}

export function findSeasonPassEligiblePlayers(
  eventId: number,
): SeasonPassEligiblePlayerRecord[] {
  const statement = database.prepare(`
    SELECT
      id,
      event_id,
      player_tag,
      player_name,
      wars_played,
      attacks_used,
      attacks_available,
      stars,
      destruction,
      created_at
    FROM season_pass_eligible_players
    WHERE event_id = ?
    ORDER BY wars_played DESC, player_name ASC
  `);

  const rows = statement.all(eventId) as Array<{
    id: number;
    event_id: number;
    player_tag: string;
    player_name: string;
    wars_played: number;
    attacks_used: number;
    attacks_available: number;
    stars: number;
    destruction: number;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    eventId: row.event_id,
    tag: row.player_tag,
    name: row.player_name,
    warsPlayed: row.wars_played,
    attacksUsed: row.attacks_used,
    attacksAvailable: row.attacks_available,
    stars: row.stars,
    destruction: row.destruction,
    createdAt: row.created_at,
  }));
}

export function saveSeasonPassWinner({
  eventId,
  winnerTag,
  winnerName,
}: {
  eventId: number;
  winnerTag: string;
  winnerName: string;
}): boolean {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    UPDATE season_pass_events
    SET
      status = 'drawn',
      winner_tag = ?,
      winner_name = ?,
      drawn_at = ?,
      updated_at = ?
    WHERE id = ?
      AND status = 'scheduled'
  `);

  const result = statement.run(winnerTag, winnerName, now, now, eventId);

  return result.changes === 1;
}

export function markSeasonPassEventAsRevealed(eventId: number): boolean {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    UPDATE season_pass_events
    SET
      status = 'revealed',
      revealed_at = ?,
      updated_at = ?
    WHERE id = ?
      AND status = 'drawn'
  `);

  const result = statement.run(now, now, eventId);

  return result.changes === 1;
}

function mapEventRow(row: SeasonPassEventRow): SeasonPassEventRecord {
  return {
    id: row.id,
    season: row.season,
    clanTag: row.clan_tag,
    status: row.status,
    scheduledAt: row.scheduled_at,
    revealAt: row.reveal_at,
    winnerTag: row.winner_tag ?? undefined,
    winnerName: row.winner_name ?? undefined,
    drawnAt: row.drawn_at ?? undefined,
    revealedAt: row.revealed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
