import { database } from "@/lib/db/database";

export type WarArchiveResultType =
  | "preparation"
  | "ongoing"
  | "win"
  | "loss"
  | "draw";

export function upsertWarHistory(input: {
  warKey: string;
  trackedClanTag: string;
  state: string;
  result: WarArchiveResultType;
  teamSize?: number;
  attacksPerMember?: number;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  clanTag: string;
  clanName: string;
  clanLevel?: number;
  clanStars: number;
  clanDestruction: number;
  clanAttacks: number;
  clanBadgeUrlsJson?: string;
  opponentTag: string;
  opponentName: string;
  opponentLevel?: number;
  opponentStars: number;
  opponentDestruction: number;
  opponentAttacks: number;
  opponentBadgeUrlsJson?: string;
  rawJson: string;
}): number {
  const now = new Date().toISOString();

  database
    .prepare(
      `
    INSERT INTO war_history (
      war_key, tracked_clan_tag, state, result,
      team_size, attacks_per_member,
      preparation_start_time, start_time, end_time,
      clan_tag, clan_name, clan_level, clan_stars,
      clan_destruction, clan_attacks, clan_badge_urls_json,
      opponent_tag, opponent_name, opponent_level, opponent_stars,
      opponent_destruction, opponent_attacks, opponent_badge_urls_json,
      raw_json, created_at, updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
    ON CONFLICT(war_key) DO UPDATE SET
      state = excluded.state,
      result = excluded.result,
      team_size = excluded.team_size,
      attacks_per_member = excluded.attacks_per_member,
      preparation_start_time = excluded.preparation_start_time,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      clan_tag = excluded.clan_tag,
      clan_name = excluded.clan_name,
      clan_level = excluded.clan_level,
      clan_stars = excluded.clan_stars,
      clan_destruction = excluded.clan_destruction,
      clan_attacks = excluded.clan_attacks,
      clan_badge_urls_json = excluded.clan_badge_urls_json,
      opponent_tag = excluded.opponent_tag,
      opponent_name = excluded.opponent_name,
      opponent_level = excluded.opponent_level,
      opponent_stars = excluded.opponent_stars,
      opponent_destruction = excluded.opponent_destruction,
      opponent_attacks = excluded.opponent_attacks,
      opponent_badge_urls_json = excluded.opponent_badge_urls_json,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `,
    )
    .run(
      input.warKey,
      input.trackedClanTag,
      input.state,
      input.result,
      input.teamSize ?? null,
      input.attacksPerMember ?? null,
      input.preparationStartTime ?? null,
      input.startTime ?? null,
      input.endTime ?? null,
      input.clanTag,
      input.clanName,
      input.clanLevel ?? null,
      input.clanStars,
      input.clanDestruction,
      input.clanAttacks,
      input.clanBadgeUrlsJson ?? null,
      input.opponentTag,
      input.opponentName,
      input.opponentLevel ?? null,
      input.opponentStars,
      input.opponentDestruction,
      input.opponentAttacks,
      input.opponentBadgeUrlsJson ?? null,
      input.rawJson,
      now,
      now,
    );

  const row = database
    .prepare(
      `
    SELECT id FROM war_history WHERE war_key = ? LIMIT 1
  `,
    )
    .get(input.warKey) as { id: number } | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar guerra arquivada. warKey=${input.warKey}`,
    );
  }

  return row.id;
}

export function upsertWarHistoryMember(input: {
  warId: number;
  side: "clan" | "opponent";
  clanTag: string;
  playerTag: string;
  playerName: string;
  townHallLevel?: number;
  mapPosition?: number;
  opponentAttacks?: number;
  bestOpponentAttackJson?: string;
  rawJson?: string;
}): void {
  const now = new Date().toISOString();

  database
    .prepare(
      `
    INSERT INTO war_history_members (
      war_id, side, clan_tag, player_tag, player_name,
      town_hall_level, map_position, opponent_attacks,
      best_opponent_attack_json, raw_json, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(war_id, player_tag) DO UPDATE SET
      side = excluded.side,
      clan_tag = excluded.clan_tag,
      player_name = excluded.player_name,
      town_hall_level = excluded.town_hall_level,
      map_position = excluded.map_position,
      opponent_attacks = excluded.opponent_attacks,
      best_opponent_attack_json = excluded.best_opponent_attack_json,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `,
    )
    .run(
      input.warId,
      input.side,
      input.clanTag,
      input.playerTag,
      input.playerName,
      input.townHallLevel ?? null,
      input.mapPosition ?? null,
      input.opponentAttacks ?? null,
      input.bestOpponentAttackJson ?? null,
      input.rawJson ?? null,
      now,
      now,
    );
}

export function upsertWarHistoryAttack(input: {
  warId: number;
  attackerTag: string;
  defenderTag: string;
  attackerTownHall?: number;
  defenderTownHall?: number;
  stars: number;
  destruction: number;
  attackOrder: number;
  duration?: number;
  townHallDifference?: number;
  resultType: "triple" | "two_star" | "one_star" | "zero_star";
  rawJson?: string;
}): void {
  const now = new Date().toISOString();

  database
    .prepare(
      `
    INSERT INTO war_history_attacks (
      war_id, attacker_tag, defender_tag,
      attacker_town_hall, defender_town_hall,
      stars, destruction, attack_order, duration,
      town_hall_difference, result_type, raw_json,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(war_id, attack_order) DO UPDATE SET
      attacker_tag = excluded.attacker_tag,
      defender_tag = excluded.defender_tag,
      attacker_town_hall = excluded.attacker_town_hall,
      defender_town_hall = excluded.defender_town_hall,
      stars = excluded.stars,
      destruction = excluded.destruction,
      duration = excluded.duration,
      town_hall_difference = excluded.town_hall_difference,
      result_type = excluded.result_type,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `,
    )
    .run(
      input.warId,
      input.attackerTag,
      input.defenderTag,
      input.attackerTownHall ?? null,
      input.defenderTownHall ?? null,
      input.stars,
      input.destruction,
      input.attackOrder,
      input.duration ?? null,
      input.townHallDifference ?? null,
      input.resultType,
      input.rawJson ?? null,
      now,
      now,
    );
}

export function getWarArchiveSummary(trackedClanTag: string) {
  const wars = (
    database
      .prepare(
        `
    SELECT COUNT(*) AS total FROM war_history WHERE tracked_clan_tag = ?
  `,
      )
      .get(trackedClanTag) as { total: number }
  ).total;

  const members = (
    database
      .prepare(
        `
    SELECT COUNT(*) AS total
    FROM war_history_members
    WHERE war_id IN (
      SELECT id FROM war_history WHERE tracked_clan_tag = ?
    )
  `,
      )
      .get(trackedClanTag) as { total: number }
  ).total;

  const attacks = (
    database
      .prepare(
        `
    SELECT COUNT(*) AS total
    FROM war_history_attacks
    WHERE war_id IN (
      SELECT id FROM war_history WHERE tracked_clan_tag = ?
    )
  `,
      )
      .get(trackedClanTag) as { total: number }
  ).total;

  return { wars, members, attacks };
}
