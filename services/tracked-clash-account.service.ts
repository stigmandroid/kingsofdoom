/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/tracked-clash-account.service.ts
 *
 * Responsabilidade:
 * Gerenciar o acompanhamento operacional das contas Clash
 * monitoradas pela KODA a partir de múltiplas razões.
 *
 * Funcionalidades:
 * - normaliza TAGs antes da persistência;
 * - garante uma identidade única por conta Clash;
 * - associa múltiplas razões de acompanhamento;
 * - confirma e reativa razões existentes;
 * - encerra razões sem pausar indevidamente a conta;
 * - reconcilia o lifecycle das razões;
 * - deriva o estado operacional da conta;
 * - lista somente contas que atualmente exigem coleta.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import {
  createTrackedClashAccount,
  findTrackedClashAccountByTag,
  listTrackedClashAccounts,
  syncTrackedClashAccountStatusFromReasons,
  type TrackedClashAccount,
} from "@/repositories/tracked-clash-account.repository";

import type { TrackedClashAccountReasonType } from "@/repositories/tracked-clash-account-reason.repository";

import {
  endTrackedClashAccountReason,
  ensureTrackedClashAccountReason,
  reconcileTrackedClashAccountReasons,
} from "@/services/tracked-clash-account-reason.service";

export type TrackClashAccountInput = {
  playerTag: string;
  playerName?: string | null;

  reasonType: TrackedClashAccountReasonType;
  reasonKey: string;

  confirmedAt?: string;
  metadataJson?: string | null;
};

export type TrackClashAccountResult = {
  created: boolean;
  reactivated: boolean;
  account: TrackedClashAccount;
};

export type EndClashAccountTrackingReasonInput = {
  playerTag: string;

  reasonType: TrackedClashAccountReasonType;
  reasonKey: string;

  endedAt?: string;
};

/**
 * Normaliza uma TAG Clash para o formato utilizado
 * internamente pela KODA.
 */
function normalizePlayerTag(playerTag: string): string {
  const normalized = playerTag.trim().toUpperCase().replace(/\s+/g, "");

  if (!normalized) {
    throw new Error("A TAG do jogador é obrigatória.");
  }

  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

/**
 * Sincroniza o estado operacional da conta a partir das
 * razões atualmente ativas.
 */
function syncAccountFromReasons(playerTag: string): TrackedClashAccount {
  const account = findTrackedClashAccountByTag(playerTag);

  if (!account) {
    throw new Error("A conta Clash não foi encontrada para sincronização.");
  }

  reconcileTrackedClashAccountReasons(account.id);

  const synchronized = syncTrackedClashAccountStatusFromReasons(playerTag);

  if (!synchronized) {
    throw new Error(
      "A conta Clash existe, mas seu estado operacional não pôde ser sincronizado.",
    );
  }

  return synchronized;
}

/**
 * Registra ou confirma uma razão de acompanhamento.
 *
 * A identidade da conta é independente das razões que
 * justificam sua coleta.
 *
 * Uma conta já existente pode receber novas razões sem
 * duplicação da TAG.
 */
export function trackClashAccount(
  input: TrackClashAccountInput,
): TrackClashAccountResult {
  const playerTag = normalizePlayerTag(input.playerTag);

  let account = findTrackedClashAccountByTag(playerTag);
  const previousStatus = account?.trackingStatus ?? null;

  let created = false;

  if (!account) {
    /**
     * tracking_source permanece temporariamente obrigatório
     * durante a migração v0.1 -> v0.2.
     *
     * Novas contas recebem um marcador transitório.
     * A fonte real de tracking passa a existir na tabela
     * tracked_clash_account_reasons.
     */
    account = createTrackedClashAccount({
      playerTag,
      playerName: input.playerName ?? null,
      trackingSource: "reason_model_v0.2",
    });

    created = true;
  }

  ensureTrackedClashAccountReason({
    trackedAccountId: account.id,
    reasonType: input.reasonType,
    reasonKey: input.reasonKey,
    confirmedAt: input.confirmedAt,
    metadataJson: input.metadataJson,
  });

  const synchronized = syncAccountFromReasons(playerTag);

  return {
    created,
    reactivated:
      !created &&
      previousStatus === "paused" &&
      synchronized.trackingStatus === "active",
    account: synchronized,
  };
}

/**
 * Encerra uma razão específica de acompanhamento.
 *
 * A conta não é pausada diretamente. Após a alteração,
 * seu estado operacional é recalculado considerando todas
 * as razões existentes.
 */
export function endClashAccountTrackingReason(
  input: EndClashAccountTrackingReasonInput,
): TrackedClashAccount | null {
  const playerTag = normalizePlayerTag(input.playerTag);

  const account = findTrackedClashAccountByTag(playerTag);

  if (!account) {
    return null;
  }

  const reason = endTrackedClashAccountReason({
    trackedAccountId: account.id,
    reasonType: input.reasonType,
    reasonKey: input.reasonKey,
    endedAt: input.endedAt,
  });

  if (!reason) {
    return account;
  }

  return syncAccountFromReasons(playerTag);
}

/**
 * Reconcilia uma conta individual com o lifecycle atual
 * de suas razões.
 */
export function reconcileClashAccountTracking(
  playerTag: string,
): TrackedClashAccount | null {
  const normalizedPlayerTag = normalizePlayerTag(playerTag);

  const account = findTrackedClashAccountByTag(normalizedPlayerTag);

  if (!account) {
    return null;
  }

  return syncAccountFromReasons(normalizedPlayerTag);
}

/**
 * Reconcilia todas as contas cadastradas e devolve somente
 * aquelas que, após a avaliação atual de suas razões,
 * continuam justificando coleta.
 *
 * O tracking_status é tratado como estado operacional
 * derivado. Por isso, contas pausadas também participam
 * da reconciliação global antes da seleção para polling.
 */
export function getActiveTrackedClashAccounts(): TrackedClashAccount[] {
  const accounts = listTrackedClashAccounts();

  const activeAccounts: TrackedClashAccount[] = [];

  for (const account of accounts) {
    const synchronized = syncAccountFromReasons(account.playerTag);

    if (synchronized.trackingStatus === "active") {
      activeAccounts.push(synchronized);
    }
  }

  return activeAccounts;
}
