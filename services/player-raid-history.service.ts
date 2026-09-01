/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player-raid-history.service.ts
 *
 * Responsabilidade:
 * Construir o histórico individual de participação de um
 * jogador nos Raid Weekends persistidos pelo Command Center.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 31/08/2026
 *
 * Versão:
 * 0.9.4
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type PlayerRaidHistoryRow = {
  raid_weekend_id: number;

  clan_tag: string;

  state: string;

  start_time: string;

  end_time: string;

  player_tag: string;

  player_name: string;

  attacks: number;

  attack_limit: number;

  bonus_attack_limit: number;

  capital_resources_looted: number;
};

export type PlayerRaidParticipation = {
  raidWeekendId: number;

  clanTag: string;

  state: string;

  startTime: string;

  endTime: string;

  playerTag: string;

  playerName: string;

  attacks: number;

  attackLimit: number;

  bonusAttackLimit: number;

  attacksAvailable: number;

  attacksMissed: number;

  attackUsageRate: number;

  capitalResourcesLooted: number;

  capitalResourcesPerAttack: number;
};

export type PlayerRaidHistory = {
  playerTag: string;

  totalParticipations: number;

  totalAttacks: number;

  totalAttacksAvailable: number;

  totalAttacksMissed: number;

  attackUsageRate: number;

  totalCapitalResourcesLooted: number;

  averageCapitalResourcesLooted: number;

  averageCapitalResourcesPerAttack: number;

  bestCapitalResourcesLooted: number;

  latestParticipation: PlayerRaidParticipation | null;

  participations: PlayerRaidParticipation[];
};

/**
 * ==========================================================
 * NORMALIZAÇÃO
 * ==========================================================
 */

function normalizePlayerTag(playerTag: string): string {
  const normalized = playerTag.trim().toUpperCase();

  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

/**
 * ==========================================================
 * MAPEAMENTO
 * ==========================================================
 */

function mapParticipation(row: PlayerRaidHistoryRow): PlayerRaidParticipation {
  const attacksAvailable = row.attack_limit + row.bonus_attack_limit;

  const attacksMissed = Math.max(attacksAvailable - row.attacks, 0);

  const attackUsageRate =
    attacksAvailable > 0 ? (row.attacks / attacksAvailable) * 100 : 0;

  const capitalResourcesPerAttack =
    row.attacks > 0 ? row.capital_resources_looted / row.attacks : 0;

  return {
    raidWeekendId: row.raid_weekend_id,

    clanTag: row.clan_tag,

    state: row.state,

    startTime: row.start_time,

    endTime: row.end_time,

    playerTag: row.player_tag,

    playerName: row.player_name,

    attacks: row.attacks,

    attackLimit: row.attack_limit,

    bonusAttackLimit: row.bonus_attack_limit,

    attacksAvailable,

    attacksMissed,

    attackUsageRate,

    capitalResourcesLooted: row.capital_resources_looted,

    capitalResourcesPerAttack,
  };
}

/**
 * ==========================================================
 * HISTÓRICO INDIVIDUAL
 * ==========================================================
 */

export function getPlayerRaidHistory(playerTag: string): PlayerRaidHistory {
  const normalizedPlayerTag = normalizePlayerTag(playerTag);

  const rows = database
    .prepare(
      `
        SELECT
          rw.id AS raid_weekend_id,

          rw.clan_tag,
          rw.state,
          rw.start_time,
          rw.end_time,

          rm.player_tag,
          rm.player_name,

          rm.attacks,
          rm.attack_limit,
          rm.bonus_attack_limit,

          rm.capital_resources_looted

        FROM raid_weekend_members rm

        INNER JOIN raid_weekends rw
          ON rw.id = rm.raid_weekend_id

        WHERE rm.player_tag = ?

        ORDER BY rw.start_time DESC
      `,
    )
    .all(normalizedPlayerTag) as PlayerRaidHistoryRow[];

  const participations = rows.map(mapParticipation);

  const totalAttacks = participations.reduce(
    (sum, participation) => sum + participation.attacks,
    0,
  );

  const totalAttacksAvailable = participations.reduce(
    (sum, participation) => sum + participation.attacksAvailable,
    0,
  );

  const totalAttacksMissed = participations.reduce(
    (sum, participation) => sum + participation.attacksMissed,
    0,
  );

  const attackUsageRate =
    totalAttacksAvailable > 0
      ? (totalAttacks / totalAttacksAvailable) * 100
      : 0;

  const totalCapitalResourcesLooted = participations.reduce(
    (sum, participation) => sum + participation.capitalResourcesLooted,
    0,
  );

  const averageCapitalResourcesLooted =
    participations.length > 0
      ? Math.round(totalCapitalResourcesLooted / participations.length)
      : 0;

  const averageCapitalResourcesPerAttack =
    totalAttacks > 0
      ? Math.round(totalCapitalResourcesLooted / totalAttacks)
      : 0;

  const bestCapitalResourcesLooted = participations.reduce(
    (best, participation) =>
      Math.max(best, participation.capitalResourcesLooted),
    0,
  );

  return {
    playerTag: normalizedPlayerTag,

    totalParticipations: participations.length,

    totalAttacks,

    totalAttacksAvailable,

    totalAttacksMissed,

    attackUsageRate,

    totalCapitalResourcesLooted,

    averageCapitalResourcesLooted,

    averageCapitalResourcesPerAttack,

    bestCapitalResourcesLooted,

    latestParticipation: participations[0] ?? null,

    participations,
  };
}
