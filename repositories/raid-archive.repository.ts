/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/raid-archive.repository.ts
 *
 * Responsabilidade:
 * Centralizar as operações de persistência relacionadas
 * ao arquivo histórico dos Raid Weekends.
 *
 * Funcionalidades:
 *
 * - criar ou atualizar Raid Weekends;
 * - criar ou atualizar participantes;
 * - preservar payloads brutos;
 * - permitir múltiplos snapshots sem duplicação;
 * - disponibilizar uma fundação persistente para rankings
 *   e futura inteligência individual de Raid Weekend.
 *
 * Estratégia:
 *
 * - cada Raid Weekend é identificado por clã + startTime;
 * - cada jogador possui um único registro por evento;
 * - novos snapshots atualizam os registros existentes;
 * - nenhuma informação histórica é removida.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 24/08/2026
 *
 * Versão:
 * 0.9.1
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
 * Snapshot geral de um Raid Weekend.
 */
export type RaidWeekendArchiveInput = {
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

  rawJson?: string;
};

/**
 * Participação individual de um jogador.
 */
export type RaidWeekendMemberArchiveInput = {
  raidWeekendId: number;

  playerTag: string;
  playerName: string;

  attacks: number;
  attackLimit: number;
  bonusAttackLimit: number;

  capitalResourcesLooted: number;

  rawJson?: string;
};

/**
 * ==========================================================
 * RAID WEEKEND
 * ==========================================================
 */

/**
 * Cria ou atualiza um Raid Weekend.
 *
 * A combinação:
 *
 * clan_tag + start_time
 *
 * funciona como identificador único do evento dentro
 * do Command Center.
 *
 * Retorna o ID interno persistido.
 */
export function upsertRaidWeekend(input: RaidWeekendArchiveInput): number {
  const now = new Date().toISOString();

  database
    .prepare(
      `
        INSERT INTO raid_weekends (
          clan_tag,
          state,
          start_time,
          end_time,
          capital_total_loot,
          raids_completed,
          total_attacks,
          enemy_districts_destroyed,
          offensive_reward,
          defensive_reward,
          raw_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON CONFLICT (
          clan_tag,
          start_time
        )
        DO UPDATE SET
          state = excluded.state,
          end_time = excluded.end_time,
          capital_total_loot = excluded.capital_total_loot,
          raids_completed = excluded.raids_completed,
          total_attacks = excluded.total_attacks,
          enemy_districts_destroyed =
            excluded.enemy_districts_destroyed,
          offensive_reward = excluded.offensive_reward,
          defensive_reward = excluded.defensive_reward,
          raw_json = excluded.raw_json,
          updated_at = excluded.updated_at
      `,
    )
    .run(
      input.clanTag,
      input.state,
      input.startTime,
      input.endTime,
      input.capitalTotalLoot,
      input.raidsCompleted,
      input.totalAttacks,
      input.enemyDistrictsDestroyed,
      input.offensiveReward,
      input.defensiveReward,
      input.rawJson ?? null,
      now,
      now,
    );

  /**
   * Recupera o ID do registro após INSERT ou UPDATE.
   */
  const row = database
    .prepare(
      `
        SELECT
          id
        FROM raid_weekends
        WHERE clan_tag = ?
          AND start_time = ?
        LIMIT 1
      `,
    )
    .get(input.clanTag, input.startTime) as {
    id: number;
  };

  return row.id;
}

/**
 * ==========================================================
 * PARTICIPANTES
 * ==========================================================
 */

/**
 * Cria ou atualiza a participação de um jogador
 * em determinado Raid Weekend.
 *
 * Durante o evento, ataques e ouro saqueado podem aumentar.
 * O UPSERT permite atualizar essas informações sem criar
 * duplicações.
 *
 * Os valores cumulativos utilizam MAX para impedir que uma
 * resposta posterior e incompleta da API reduza informações
 * que já haviam sido preservadas.
 */
export function upsertRaidWeekendMember(
  input: RaidWeekendMemberArchiveInput,
): void {
  const now = new Date().toISOString();

  database
    .prepare(
      `
        INSERT INTO raid_weekend_members (
          raid_weekend_id,
          player_tag,
          player_name,
          attacks,
          attack_limit,
          bonus_attack_limit,
          capital_resources_looted,
          raw_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON CONFLICT (
          raid_weekend_id,
          player_tag
        )
        DO UPDATE SET
          player_name = excluded.player_name,

          attacks = MAX(
            raid_weekend_members.attacks,
            excluded.attacks
          ),

          attack_limit = MAX(
            raid_weekend_members.attack_limit,
            excluded.attack_limit
          ),

          bonus_attack_limit = MAX(
            raid_weekend_members.bonus_attack_limit,
            excluded.bonus_attack_limit
          ),

          capital_resources_looted = MAX(
            raid_weekend_members.capital_resources_looted,
            excluded.capital_resources_looted
          ),

          raw_json = excluded.raw_json,
          updated_at = excluded.updated_at
      `,
    )
    .run(
      input.raidWeekendId,
      input.playerTag,
      input.playerName,
      input.attacks,
      input.attackLimit,
      input.bonusAttackLimit,
      input.capitalResourcesLooted,
      input.rawJson ?? null,
      now,
      now,
    );
}
