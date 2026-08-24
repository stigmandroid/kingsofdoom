/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/raid-archive.service.ts
 *
 * Responsabilidade:
 * Orquestrar o arquivamento de um Raid Weekend e de seus
 * participantes no banco persistente do Command Center.
 *
 * Funcionalidades:
 *
 * - arquivar o snapshot geral do Raid Weekend;
 * - arquivar participantes individualmente;
 * - atualizar snapshots existentes;
 * - preservar payloads brutos;
 * - preparar dados para rankings e Player Intelligence.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import {
  upsertRaidWeekend,
  upsertRaidWeekendMember,
} from "@/repositories/raid-archive.repository";

import type { RaidWeekend } from "@/services/raid.service";

/**
 * Resultado resumido do arquivamento.
 */
export type RaidArchiveResult = {
  clanTag: string;

  startTime: string;

  members: number;
};

/**
 * Arquiva um Raid Weekend completo.
 *
 * A função pode ser executada diversas vezes durante
 * o mesmo evento.
 *
 * O repository utiliza UPSERT, portanto:
 *
 * - os totais do clã são atualizados;
 * - os jogadores são atualizados;
 * - novos participantes são adicionados;
 * - registros não são duplicados.
 */
export function archiveRaidWeekend({
  clanTag,
  raid,
}: {
  clanTag: string;

  raid: RaidWeekend;
}): RaidArchiveResult {
  /**
   * ========================================================
   * 1. RAID WEEKEND
   * ========================================================
   */

  const raidWeekendId = upsertRaidWeekend({
    clanTag,

    state: raid.state,

    startTime: raid.startTime,

    endTime: raid.endTime,

    capitalTotalLoot: raid.capitalTotalLoot,

    raidsCompleted: raid.raidsCompleted,

    totalAttacks: raid.totalAttacks,

    enemyDistrictsDestroyed: raid.enemyDistrictsDestroyed,

    offensiveReward: raid.offensiveReward,

    defensiveReward: raid.defensiveReward,

    rawJson: serializeJson(raid),
  });

  /**
   * ========================================================
   * 2. PARTICIPANTES
   * ========================================================
   */

  const members = raid.members ?? [];

  for (const member of members) {
    upsertRaidWeekendMember({
      raidWeekendId,

      playerTag: member.tag,

      playerName: member.name,

      attacks: member.attacks,

      attackLimit: member.attackLimit,

      bonusAttackLimit: member.bonusAttackLimit,

      capitalResourcesLooted: member.capitalResourcesLooted,

      rawJson: serializeJson(member),
    });
  }

  return {
    clanTag,

    startTime: raid.startTime,

    members: members.length,
  };
}

/**
 * Serializa payloads de forma segura.
 */
function serializeJson(value: unknown): string {
  return JSON.stringify(value);
}
