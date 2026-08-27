/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/raid-history.service.ts
 *
 * Responsabilidade:
 * Reconstruir o histórico persistido dos Raid Weekends
 * para utilização pelo Event Intelligence.
 *
 * Este serviço consulta exclusivamente o Raid Archive,
 * sem depender de uma nova consulta à Clash API durante
 * a renderização das páginas.
 *
 * A camada fornece:
 *
 * • visão global do Raid Weekend;
 * • métricas ofensivas do clã;
 * • ranking dos participantes;
 * • histórico dos eventos arquivados;
 * • base para integração futura com o perfil individual.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/08/2026
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
 * ==========================================================
 * TIPOS PÚBLICOS
 * ==========================================================
 */

export type RaidHistoryMember = {
  playerTag: string;

  playerName: string;

  attacks: number;

  attackLimit: number;

  bonusAttackLimit: number;

  capitalResourcesLooted: number;
};

export type RaidHistoryWeekend = {
  id: number;

  clanTag: string;

  state: string;

  startTime: string;

  endTime: string;

  capitalTotalLoot: number;

  raidsCompleted: number;

  totalAttacks: number;

  enemyDistrictsDestroyed: number;

  offensiveReward: number;

  defensiveReward: number;

  membersCount: number;

  members: RaidHistoryMember[];
};

/**
 * ==========================================================
 * TIPOS INTERNOS DO SQLITE
 * ==========================================================
 */

type RaidWeekendRow = {
  id: number;

  clan_tag: string;

  state: string;

  start_time: string;

  end_time: string;

  capital_total_loot: number;

  raids_completed: number;

  total_attacks: number;

  enemy_districts_destroyed: number;

  offensive_reward: number;

  defensive_reward: number;
};

type RaidWeekendMemberRow = {
  player_tag: string;

  player_name: string;

  attacks: number;

  attack_limit: number;

  bonus_attack_limit: number;

  capital_resources_looted: number;
};

/**
 * ==========================================================
 * NORMALIZAÇÃO
 * ==========================================================
 */

/**
 * Converte uma linha persistida de participante para o
 * formato utilizado pelas camadas superiores da aplicação.
 */
function mapRaidMember(row: RaidWeekendMemberRow): RaidHistoryMember {
  return {
    playerTag: row.player_tag,

    playerName: row.player_name,

    attacks: row.attacks,

    attackLimit: row.attack_limit,

    bonusAttackLimit: row.bonus_attack_limit,

    capitalResourcesLooted: row.capital_resources_looted,
  };
}

/**
 * ==========================================================
 * PARTICIPANTES
 * ==========================================================
 */

/**
 * Recupera os participantes persistidos de um Raid Weekend.
 *
 * O ranking é ordenado primeiro pelo saque total e depois
 * pelo nome do jogador para garantir ordenação determinística.
 */
function getRaidWeekendMembers(raidWeekendId: number): RaidHistoryMember[] {
  const rows = database
    .prepare(
      `
        SELECT
          player_tag,
          player_name,
          attacks,
          attack_limit,
          bonus_attack_limit,
          capital_resources_looted

        FROM raid_weekend_members

        WHERE raid_weekend_id = ?

        ORDER BY
          capital_resources_looted DESC,
          player_name COLLATE NOCASE ASC
      `,
    )
    .all(raidWeekendId) as RaidWeekendMemberRow[];

  return rows.map(mapRaidMember);
}

/**
 * ==========================================================
 * CONSTRUÇÃO DO EVENTO
 * ==========================================================
 */

/**
 * Converte um Raid Weekend persistido para o modelo público
 * utilizado pelo Event Intelligence.
 */
function buildRaidWeekend(row: RaidWeekendRow): RaidHistoryWeekend {
  const members = getRaidWeekendMembers(row.id);

  return {
    id: row.id,

    clanTag: row.clan_tag,

    state: row.state,

    startTime: row.start_time,

    endTime: row.end_time,

    capitalTotalLoot: row.capital_total_loot,

    raidsCompleted: row.raids_completed,

    totalAttacks: row.total_attacks,

    enemyDistrictsDestroyed: row.enemy_districts_destroyed,

    offensiveReward: row.offensive_reward,

    defensiveReward: row.defensive_reward,

    membersCount: members.length,

    members,
  };
}

/**
 * ==========================================================
 * RAID WEEKEND MAIS RECENTE
 * ==========================================================
 */

/**
 * Retorna o Raid Weekend mais recente arquivado para um clã.
 *
 * O resultado vem integralmente do banco persistente.
 */
export function getLatestRaidWeekend(
  clanTag: string,
): RaidHistoryWeekend | null {
  const row = database
    .prepare(
      `
        SELECT
          id,
          clan_tag,
          state,
          start_time,
          end_time,
          capital_total_loot,
          raids_completed,
          total_attacks,
          enemy_districts_destroyed,
          offensive_reward,
          defensive_reward

        FROM raid_weekends

        WHERE clan_tag = ?

        ORDER BY start_time DESC

        LIMIT 1
      `,
    )
    .get(clanTag) as RaidWeekendRow | undefined;

  if (!row) {
    return null;
  }

  return buildRaidWeekend(row);
}

/**
 * ==========================================================
 * HISTÓRICO DE RAID WEEKENDS
 * ==========================================================
 */

/**
 * Retorna os Raid Weekends arquivados de determinado clã.
 *
 * O limite evita leituras desnecessárias quando a interface
 * precisa apenas dos eventos mais recentes.
 */
export function getRaidWeekendHistory(
  clanTag: string,
  limit = 10,
): RaidHistoryWeekend[] {
  const safeLimit = Math.max(1, Math.min(Math.trunc(limit), 50));

  const rows = database
    .prepare(
      `
        SELECT
          id,
          clan_tag,
          state,
          start_time,
          end_time,
          capital_total_loot,
          raids_completed,
          total_attacks,
          enemy_districts_destroyed,
          offensive_reward,
          defensive_reward

        FROM raid_weekends

        WHERE clan_tag = ?

        ORDER BY start_time DESC

        LIMIT ?
      `,
    )
    .all(clanTag, safeLimit) as RaidWeekendRow[];

  return rows.map(buildRaidWeekend);
}
