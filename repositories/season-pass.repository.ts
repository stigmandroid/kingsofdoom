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
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";

import type { SeasonPassEligiblePlayer } from "@/lib/cwl/calculate-season-pass-eligibility";

/**
 * Estados persistidos do evento.
 */
export type SeasonPassEventStatus = "scheduled" | "drawn" | "revealed";

/**
 * Representa um evento persistido.
 */
export type SeasonPassEventRecord = {
  id: number;
  season: string;
  clanTag: string;
  status: SeasonPassEventStatus;

  /**
   * Momento oficial em que o sorteio deve acontecer.
   */
  scheduledAt: string;

  /**
   * Momento em que o resultado poderá ser revelado
   * publicamente após a animação.
   */
  revealAt: string;

  /**
   * Vencedor oficial.
   *
   * Permanece indefinido enquanto o sorteio
   * ainda não tiver ocorrido.
   */
  winnerTag?: string;
  winnerName?: string;

  /**
   * Momento em que o vencedor foi efetivamente sorteado.
   */
  drawnAt?: string;

  /**
   * Momento em que o resultado foi revelado.
   */
  revealedAt?: string;

  createdAt: string;
  updatedAt: string;
};

/**
 * Jogador elegível persistido.
 */
export type SeasonPassEligiblePlayerRecord = SeasonPassEligiblePlayer & {
  id: number;
  eventId: number;
  createdAt: string;
};

/**
 * Estrutura interna retornada pelo SQLite
 * para um evento do Passe.
 */
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

/**
 * Consulta um evento por temporada e clã.
 */
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
 * Cria um novo evento agendado.
 *
 * O evento nasce no estado "scheduled" e já possui:
 *
 * - horário oficial do sorteio;
 * - horário em que o resultado poderá ser revelado.
 */
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

  const event = findSeasonPassEvent({
    season,
    clanTag,
  });

  if (!event) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar evento recém-criado. id=${result.lastInsertRowid}`,
    );
  }

  return event;
}

/**
 * Persiste a fotografia definitiva dos jogadores
 * elegíveis ao sorteio.
 *
 * A operação é executada dentro de transação para evitar
 * salvar apenas parte da lista.
 */
export function replaceSeasonPassEligiblePlayers({
  eventId,
  players,
}: {
  eventId: number;
  players: SeasonPassEligiblePlayer[];
}): void {
  database.exec("BEGIN IMMEDIATE TRANSACTION;");

  try {
    /**
     * Remove a fotografia anterior do evento.
     */
    const deleteStatement = database.prepare(`
      DELETE FROM season_pass_eligible_players
      WHERE event_id = ?
    `);

    deleteStatement.run(eventId);

    /**
     * Prepara a inserção dos jogadores elegíveis.
     */
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

/**
 * Consulta os jogadores congelados de determinado evento.
 */
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

/**
 * Registra oficialmente o vencedor do evento.
 *
 * A atualização só acontece enquanto o evento
 * ainda estiver agendado.
 *
 * Isso impede que um segundo sorteio sobrescreva
 * um vencedor já definido.
 */
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

/**
 * Marca o resultado como oficialmente revelado.
 *
 * A operação só é permitida quando o evento
 * já possui um vencedor persistido.
 */
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

/**
 * Converte a estrutura interna do SQLite para o
 * contrato utilizado pela aplicação.
 */
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
