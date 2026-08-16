/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/war-history.repository.ts
 *
 * Responsabilidade:
 * Centralizar consultas de leitura do histórico persistente
 * das guerras normais.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 15/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";

/**
 * Estrutura interna retornada pelo SQLite.
 */
type WarHistoryRow = {
  war_key: string;
  tracked_clan_tag: string;
  state: string;
  result: "preparation" | "ongoing" | "win" | "loss" | "draw";
  team_size: number | null;
  preparation_start_time: string | null;
  start_time: string | null;
  end_time: string | null;
  clan_tag: string;
  clan_name: string;
  clan_stars: number;
  clan_destruction: number;
  clan_attacks: number;
  opponent_tag: string;
  opponent_name: string;
  opponent_stars: number;
  opponent_destruction: number;
  opponent_attacks: number;
  raw_json: string;
  created_at: string;
  updated_at: string;
};

/**
 * Contrato utilizado pelas camadas superiores da aplicação.
 */
export type WarHistoryRecord = {
  warKey: string;
  trackedClanTag: string;
  state: string;
  result: "preparation" | "ongoing" | "win" | "loss" | "draw";
  teamSize?: number;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  clanTag: string;
  clanName: string;
  clanStars: number;
  clanDestruction: number;
  clanAttacks: number;
  opponentTag: string;
  opponentName: string;
  opponentStars: number;
  opponentDestruction: number;
  opponentAttacks: number;
  rawJson: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Lista as guerras mais recentes do clã monitorado.
 *
 * A consulta permanece isolada pela tracked_clan_tag para
 * impedir mistura de histórico entre K.O.D. e K.O.D.rec.
 */
export function findRecentWarHistory({
  trackedClanTag,
  limit = 20,
}: {
  trackedClanTag: string;
  limit?: number;
}): WarHistoryRecord[] {
  const rows = database
    .prepare(
      `
        SELECT
          war_key,
          tracked_clan_tag,
          state,
          result,
          team_size,
          preparation_start_time,
          start_time,
          end_time,
          clan_tag,
          clan_name,
          clan_stars,
          clan_destruction,
          clan_attacks,
          opponent_tag,
          opponent_name,
          opponent_stars,
          opponent_destruction,
          opponent_attacks,
          raw_json,
          created_at,
          updated_at
        FROM war_history
        WHERE tracked_clan_tag = ?
          AND result IN ('win', 'loss', 'draw')
        ORDER BY
          COALESCE(
            preparation_start_time,
            start_time,
            created_at
          ) DESC,
          id DESC
        LIMIT ?
      `,
    )
    .all(trackedClanTag, limit) as WarHistoryRow[];

  return rows.map(mapWarHistoryRow);
}

/**
 * Recupera uma guerra específica pela chave determinística.
 *
 * trackedClanTag também é obrigatória no filtro para que uma
 * rota do K.O.D. nunca consiga abrir acidentalmente uma guerra
 * pertencente ao histórico da K.O.D.rec.
 */
export function findWarHistoryByKey({
  trackedClanTag,
  warKey,
}: {
  trackedClanTag: string;
  warKey: string;
}): WarHistoryRecord | null {
  const row = database
    .prepare(
      `
        SELECT
          war_key,
          tracked_clan_tag,
          state,
          result,
          team_size,
          preparation_start_time,
          start_time,
          end_time,
          clan_tag,
          clan_name,
          clan_stars,
          clan_destruction,
          clan_attacks,
          opponent_tag,
          opponent_name,
          opponent_stars,
          opponent_destruction,
          opponent_attacks,
          raw_json,
          created_at,
          updated_at
        FROM war_history
        WHERE tracked_clan_tag = ?
          AND war_key = ?
        LIMIT 1
      `,
    )
    .get(trackedClanTag, warKey) as WarHistoryRow | undefined;

  return row ? mapWarHistoryRow(row) : null;
}

/**
 * Converte snake_case do SQLite para o padrão utilizado
 * pelo TypeScript da aplicação.
 */
function mapWarHistoryRow(row: WarHistoryRow): WarHistoryRecord {
  return {
    warKey: row.war_key,
    trackedClanTag: row.tracked_clan_tag,
    state: row.state,
    result: row.result,
    teamSize: row.team_size ?? undefined,
    preparationStartTime: row.preparation_start_time ?? undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    clanTag: row.clan_tag,
    clanName: row.clan_name,
    clanStars: row.clan_stars,
    clanDestruction: row.clan_destruction,
    clanAttacks: row.clan_attacks,
    opponentTag: row.opponent_tag,
    opponentName: row.opponent_name,
    opponentStars: row.opponent_stars,
    opponentDestruction: row.opponent_destruction,
    opponentAttacks: row.opponent_attacks,
    rawJson: row.raw_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
