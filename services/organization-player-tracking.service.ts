/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/organization-player-tracking.service.ts
 *
 * Responsabilidade:
 * Sincronizar os membros atuais dos clãs da organização
 * Kings of Doom com o ciclo de tracking de contas da KODA.
 *
 * Funcionalidades:
 * - consulta o roster atual de cada clã configurado;
 * - ativa ou confirma razões organization dos membros atuais;
 * - reativa jogadores que retornaram ao clã;
 * - detecta jogadores que deixaram o roster;
 * - encerra a razão organization após uma saída;
 * - preserva outras razões independentes de tracking.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 24/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { clans } from "@/config/clans";
import { listActiveTrackedClashAccountReasonsByKey } from "@/repositories/tracked-clash-account-reason.repository";
import {
  findTrackedClashAccountById,
  findTrackedClashAccountByTag,
} from "@/repositories/tracked-clash-account.repository";
import { getClan } from "@/services/clan.service";
import {
  endClashAccountTrackingReason,
  trackClashAccount,
} from "@/services/tracked-clash-account.service";

export type OrganizationPlayerTrackingClanResult = {
  clanTag: string;
  clanName: string;

  membersFound: number;
  membersConfirmed: number;
  membersCreated: number;
  membersReactivated: number;
  membersEnded: number;
};

export type OrganizationPlayerTrackingResult = {
  synchronizedAt: string;
  clansProcessed: number;
  membersFound: number;
  membersConfirmed: number;
  membersCreated: number;
  membersReactivated: number;
  membersEnded: number;
  clans: OrganizationPlayerTrackingClanResult[];
};

/**
 * Sincroniza os rosters atuais da organização com as razões
 * de tracking persistidas pela KODA.
 *
 * O roster retornado pela Clash API é tratado como a fonte
 * atual de pertencimento ao clã.
 *
 * Uma ausência no roster encerra somente a razão daquele clã.
 * Outras razões da mesma conta permanecem independentes.
 */
export async function synchronizeOrganizationPlayerTracking(): Promise<OrganizationPlayerTrackingResult> {
  const synchronizedAt = new Date().toISOString();

  const results: OrganizationPlayerTrackingClanResult[] = [];

  for (const clanConfig of Object.values(clans)) {
    const clan = await getClan(clanConfig.tag);

    const currentMemberTags = new Set(
      clan.memberList.map((member) => member.tag),
    );

    const activeOrganizationReasons = listActiveTrackedClashAccountReasonsByKey(
      "organization",
      clanConfig.tag,
    );

    const activeTrackedAccountIds = new Set(
      activeOrganizationReasons.map((reason) => reason.trackedAccountId),
    );

    let membersConfirmed = 0;
    let membersCreated = 0;
    let membersReactivated = 0;
    let membersEnded = 0;

    for (const member of clan.memberList) {
      const existingAccount = findTrackedClashAccountByTag(member.tag);

      const hadActiveOrganizationReason =
        existingAccount !== null &&
        activeTrackedAccountIds.has(existingAccount.id);

      const trackingResult = trackClashAccount({
        playerTag: member.tag,
        playerName: member.name,
        reasonType: "organization",
        reasonKey: clanConfig.tag,
        confirmedAt: synchronizedAt,
      });

      if (trackingResult.created) {
        membersCreated += 1;
      } else if (trackingResult.reactivated) {
        membersReactivated += 1;
      } else if (hadActiveOrganizationReason) {
        membersConfirmed += 1;
      }
    }

    for (const reason of activeOrganizationReasons) {
      const trackedAccount = findTrackedClashAccountById(
        reason.trackedAccountId,
      );

      if (!trackedAccount) {
        continue;
      }

      if (currentMemberTags.has(trackedAccount.playerTag)) {
        continue;
      }

      endClashAccountTrackingReason({
        playerTag: trackedAccount.playerTag,
        reasonType: "organization",
        reasonKey: clanConfig.tag,
        endedAt: synchronizedAt,
      });

      membersEnded += 1;
    }

    results.push({
      clanTag: clanConfig.tag,
      clanName: clanConfig.name,
      membersFound: clan.memberList.length,
      membersConfirmed,
      membersCreated,
      membersReactivated,
      membersEnded,
    });
  }

  return {
    synchronizedAt,
    clansProcessed: results.length,
    membersFound: results.reduce(
      (total, result) => total + result.membersFound,
      0,
    ),
    membersConfirmed: results.reduce(
      (total, result) => total + result.membersConfirmed,
      0,
    ),
    membersCreated: results.reduce(
      (total, result) => total + result.membersCreated,
      0,
    ),
    membersReactivated: results.reduce(
      (total, result) => total + result.membersReactivated,
      0,
    ),
    membersEnded: results.reduce(
      (total, result) => total + result.membersEnded,
      0,
    ),
    clans: results,
  };
}
