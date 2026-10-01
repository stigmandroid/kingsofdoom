/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/tracked-clash-account-reason.service.ts
 *
 * Responsabilidade:
 * Gerenciar o ciclo de vida das razões que justificam o
 * acompanhamento de contas Clash pela KODA.
 *
 * Funcionalidades:
 * - cria e confirma razões de acompanhamento;
 * - reativa razões anteriormente encerradas;
 * - encerra razões conforme sua política de retenção;
 * - mantém políticas de lifecycle separadas por tipo;
 * - determina se uma razão ainda justifica coleta;
 * - não altera diretamente o estado operacional da conta.
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
  createTrackedClashAccountReason,
  findTrackedClashAccountReason,
  listActiveTrackedClashAccountReasons,
  listTrackedClashAccountReasons,
  updateTrackedClashAccountReasonLifecycle,
  type TrackedClashAccountReason,
  type TrackedClashAccountReasonType,
} from "@/repositories/tracked-clash-account-reason.repository";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * Acompanhamento organizacional:
 *
 * - permanece coletando por 90 dias após a última confirmação;
 * - depois entra em retenção sem polling;
 * - aos 180 dias pode expirar.
 *
 * Os prazos pertencem à política organizacional e não são
 * aplicados automaticamente aos demais tipos de razão.
 */
const ORGANIZATION_COLLECTION_DAYS = 90;
const ORGANIZATION_RETENTION_DAYS = 180;

export type EnsureTrackedClashAccountReasonInput = {
  trackedAccountId: number;

  reasonType: TrackedClashAccountReasonType;
  reasonKey: string;

  confirmedAt?: string;
  metadataJson?: string | null;
};

export type EndTrackedClashAccountReasonInput = {
  trackedAccountId: number;

  reasonType: TrackedClashAccountReasonType;
  reasonKey: string;

  endedAt?: string;
};

export type ReconcileTrackedClashAccountReasonsResult = {
  changed: boolean;
  reasons: TrackedClashAccountReason[];
};

/**
 * Soma dias a um instante sem alterar o objeto Date original.
 */
function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Data inválida para lifecycle de tracking: ${isoDate}`);
  }

  return new Date(date.getTime() + days * DAY_IN_MILLISECONDS).toISOString();
}

/**
 * Garante que uma razão exista e esteja ativa.
 *
 * Uma nova confirmação:
 * - cria a razão quando inexistente;
 * - atualiza lastConfirmedAt quando já ativa;
 * - reativa razões em retention/expired;
 * - limpa endedAt/retainUntil de ciclos anteriores.
 */
export function ensureTrackedClashAccountReason(
  input: EnsureTrackedClashAccountReasonInput,
): TrackedClashAccountReason {
  const confirmedAt = input.confirmedAt ?? new Date().toISOString();

  const existing = findTrackedClashAccountReason(
    input.trackedAccountId,
    input.reasonType,
    input.reasonKey,
  );

  if (!existing) {
    return createTrackedClashAccountReason({
      trackedAccountId: input.trackedAccountId,
      reasonType: input.reasonType,
      reasonKey: input.reasonKey,
      startedAt: confirmedAt,
      lastConfirmedAt: confirmedAt,
      metadataJson: input.metadataJson ?? null,
    });
  }

  const updated = updateTrackedClashAccountReasonLifecycle(
    input.trackedAccountId,
    input.reasonType,
    input.reasonKey,
    {
      reasonStatus: "active",
      lastConfirmedAt: confirmedAt,
      endedAt: null,
      retainUntil: null,
      metadataJson:
        input.metadataJson !== undefined
          ? input.metadataJson
          : existing.metadataJson,
    },
  );

  if (!updated) {
    throw new Error(
      "A razão de acompanhamento existe, mas não pôde ser confirmada.",
    );
  }

  return updated;
}

/**
 * Encerra explicitamente uma razão.
 *
 * Neste momento somente a política organizacional possui
 * janelas formais de 90/180 dias.
 *
 * Para organização:
 * - a razão continua active durante a janela de coleta;
 * - endedAt registra quando o vínculo deixou de ser confirmado;
 * - retainUntil representa o limite final de retenção.
 *
 * Outros tipos são colocados em retention imediatamente até
 * que suas políticas específicas sejam definidas.
 */
export function endTrackedClashAccountReason(
  input: EndTrackedClashAccountReasonInput,
): TrackedClashAccountReason | null {
  const existing = findTrackedClashAccountReason(
    input.trackedAccountId,
    input.reasonType,
    input.reasonKey,
  );

  if (!existing) {
    return null;
  }

  const endedAt = input.endedAt ?? new Date().toISOString();

  if (input.reasonType === "organization") {
    return updateTrackedClashAccountReasonLifecycle(
      input.trackedAccountId,
      input.reasonType,
      input.reasonKey,
      {
        reasonStatus: "active",
        endedAt,
        retainUntil: addDays(endedAt, ORGANIZATION_RETENTION_DAYS),
      },
    );
  }

  return updateTrackedClashAccountReasonLifecycle(
    input.trackedAccountId,
    input.reasonType,
    input.reasonKey,
    {
      reasonStatus: "retention",
      endedAt,
      retainUntil: null,
    },
  );
}

/**
 * Reavalia razões com lifecycle baseado no tempo.
 *
 * Política organizacional:
 *
 * 0–90 dias após endedAt:
 *   active
 *   ainda justifica polling.
 *
 * 90–180 dias:
 *   retention
 *   histórico preservado, sem polling por essa razão.
 *
 * 180+ dias:
 *   expired.
 */
export function reconcileTrackedClashAccountReasons(
  trackedAccountId: number,
  now = new Date().toISOString(),
): ReconcileTrackedClashAccountReasonsResult {
  const nowTimestamp = new Date(now).getTime();

  if (Number.isNaN(nowTimestamp)) {
    throw new Error(`Data inválida para reconciliação de tracking: ${now}`);
  }

  const reasons = listTrackedClashAccountReasons(trackedAccountId);

  let changed = false;

  for (const reason of reasons) {
    if (
      reason.reasonType !== "organization" ||
      !reason.endedAt ||
      reason.reasonStatus === "expired"
    ) {
      continue;
    }

    const collectionUntil = new Date(
      addDays(reason.endedAt, ORGANIZATION_COLLECTION_DAYS),
    ).getTime();

    const retentionUntil = new Date(
      reason.retainUntil ??
        addDays(reason.endedAt, ORGANIZATION_RETENTION_DAYS),
    ).getTime();

    let nextStatus: TrackedClashAccountReason["reasonStatus"] =
      reason.reasonStatus;

    if (nowTimestamp >= retentionUntil) {
      nextStatus = "expired";
    } else if (nowTimestamp >= collectionUntil) {
      nextStatus = "retention";
    } else {
      nextStatus = "active";
    }

    if (nextStatus === reason.reasonStatus) {
      continue;
    }

    updateTrackedClashAccountReasonLifecycle(
      trackedAccountId,
      reason.reasonType,
      reason.reasonKey,
      {
        reasonStatus: nextStatus,
      },
    );

    changed = true;
  }

  return {
    changed,
    reasons: listTrackedClashAccountReasons(trackedAccountId),
  };
}

/**
 * Retorna se existe pelo menos uma razão que atualmente
 * justifique polling da conta.
 *
 * Antes da decisão, reconcilia razões temporais para evitar
 * que uma razão organizacional vencida mantenha coleta.
 */
export function shouldCollectTrackedClashAccount(
  trackedAccountId: number,
  now = new Date().toISOString(),
): boolean {
  reconcileTrackedClashAccountReasons(trackedAccountId, now);

  return listActiveTrackedClashAccountReasons(trackedAccountId).length > 0;
}
