/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/tracked-clash-account-reason.repository.ts
 *
 * Responsabilidade:
 * Persistir e consultar as razões que justificam o
 * acompanhamento de contas Clash pela KODA.
 *
 * Funcionalidades:
 * - cria razões de acompanhamento;
 * - consulta razões por conta;
 * - localiza uma razão específica;
 * - lista razões atualmente ativas;
 * - atualiza o ciclo de vida de uma razão;
 * - mantém múltiplas razões independentes por conta.
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

import { database } from "@/lib/db/database";
import { ensureTrackedClashAccountSchema } from "@/lib/db/tracked-clash-account-schema";
import { ensureTrackedClashAccountReasonSchema } from "@/lib/db/tracked-clash-account-reason-schema";

export type TrackedClashAccountReasonType =
  | "organization"
  | "user"
  | "competitive_event"
  | "legacy";

export type TrackedClashAccountReasonStatus =
  | "active"
  | "retention"
  | "expired";

export type TrackedClashAccountReason = {
  id: number;

  trackedAccountId: number;

  reasonType: TrackedClashAccountReasonType;
  reasonKey: string;
  reasonStatus: TrackedClashAccountReasonStatus;

  startedAt: string;
  lastConfirmedAt: string | null;

  endedAt: string | null;
  retainUntil: string | null;

  metadataJson: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateTrackedClashAccountReasonInput = {
  trackedAccountId: number;

  reasonType: TrackedClashAccountReasonType;
  reasonKey: string;

  startedAt?: string;
  lastConfirmedAt?: string | null;

  metadataJson?: string | null;
};

export type UpdateTrackedClashAccountReasonLifecycleInput = {
  reasonStatus: TrackedClashAccountReasonStatus;

  lastConfirmedAt?: string | null;
  endedAt?: string | null;
  retainUntil?: string | null;

  metadataJson?: string | null;
};

type TrackedClashAccountReasonRow = {
  id: number;

  tracked_account_id: number;

  reason_type: TrackedClashAccountReasonType;
  reason_key: string;
  reason_status: TrackedClashAccountReasonStatus;

  started_at: string;
  last_confirmed_at: string | null;

  ended_at: string | null;
  retain_until: string | null;

  metadata_json: string | null;

  created_at: string;
  updated_at: string;
};

function getRepositoryDatabase() {
  /**
   * A tabela de razões possui FK para tracked_clash_accounts.
   * Garantimos primeiro a existência da tabela principal.
   */
  ensureTrackedClashAccountSchema(database);
  ensureTrackedClashAccountReasonSchema(database);

  return database;
}

function mapRow(row: TrackedClashAccountReasonRow): TrackedClashAccountReason {
  return {
    id: row.id,

    trackedAccountId: row.tracked_account_id,

    reasonType: row.reason_type,
    reasonKey: row.reason_key,
    reasonStatus: row.reason_status,

    startedAt: row.started_at,
    lastConfirmedAt: row.last_confirmed_at,

    endedAt: row.ended_at,
    retainUntil: row.retain_until,

    metadataJson: row.metadata_json,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function findTrackedClashAccountReason(
  trackedAccountId: number,
  reasonType: TrackedClashAccountReasonType,
  reasonKey: string,
): TrackedClashAccountReason | null {
  const db = getRepositoryDatabase();

  const row = db
    .prepare(
      `
      SELECT
        id,
        tracked_account_id,
        reason_type,
        reason_key,
        reason_status,
        started_at,
        last_confirmed_at,
        ended_at,
        retain_until,
        metadata_json,
        created_at,
        updated_at
      FROM tracked_clash_account_reasons
      WHERE tracked_account_id = ?
        AND reason_type = ?
        AND reason_key = ?
      LIMIT 1
    `,
    )
    .get(trackedAccountId, reasonType, reasonKey) as
    | TrackedClashAccountReasonRow
    | undefined;

  return row ? mapRow(row) : null;
}

export function listTrackedClashAccountReasons(
  trackedAccountId: number,
): TrackedClashAccountReason[] {
  const db = getRepositoryDatabase();

  const rows = db
    .prepare(
      `
      SELECT
        id,
        tracked_account_id,
        reason_type,
        reason_key,
        reason_status,
        started_at,
        last_confirmed_at,
        ended_at,
        retain_until,
        metadata_json,
        created_at,
        updated_at
      FROM tracked_clash_account_reasons
      WHERE tracked_account_id = ?
      ORDER BY started_at ASC, id ASC
    `,
    )
    .all(trackedAccountId) as unknown as TrackedClashAccountReasonRow[];

  return rows.map(mapRow);
}

export function listActiveTrackedClashAccountReasons(
  trackedAccountId: number,
): TrackedClashAccountReason[] {
  const db = getRepositoryDatabase();

  const rows = db
    .prepare(
      `
      SELECT
        id,
        tracked_account_id,
        reason_type,
        reason_key,
        reason_status,
        started_at,
        last_confirmed_at,
        ended_at,
        retain_until,
        metadata_json,
        created_at,
        updated_at
      FROM tracked_clash_account_reasons
      WHERE tracked_account_id = ?
        AND reason_status = 'active'
      ORDER BY started_at ASC, id ASC
    `,
    )
    .all(trackedAccountId) as unknown as TrackedClashAccountReasonRow[];

  return rows.map(mapRow);
}

/**
 * Lista as razões ativas de um mesmo tipo e chave.
 *
 * Permite que serviços de domínio descubram quais contas
 * continuam associadas a uma determinada origem de tracking.
 *
 * Exemplo:
 * organization + #TAG_DO_CLA
 *
 * A comparação com o roster atual permanece responsabilidade
 * do serviço de sincronização da organização.
 */
export function listActiveTrackedClashAccountReasonsByKey(
  reasonType: TrackedClashAccountReasonType,
  reasonKey: string,
): TrackedClashAccountReason[] {
  const db = getRepositoryDatabase();

  const rows = db
    .prepare(
      `
      SELECT
        id,
        tracked_account_id,
        reason_type,
        reason_key,
        reason_status,
        started_at,
        last_confirmed_at,
        ended_at,
        retain_until,
        metadata_json,
        created_at,
        updated_at
      FROM tracked_clash_account_reasons
      WHERE reason_type = ?
        AND reason_key = ?
        AND reason_status = 'active'
      ORDER BY started_at ASC, id ASC
    `,
    )
    .all(reasonType, reasonKey) as unknown as TrackedClashAccountReasonRow[];

  return rows.map(mapRow);
}

export function createTrackedClashAccountReason(
  input: CreateTrackedClashAccountReasonInput,
): TrackedClashAccountReason {
  const db = getRepositoryDatabase();

  const now = new Date().toISOString();
  const startedAt = input.startedAt ?? now;

  db.prepare(
    `
    INSERT INTO tracked_clash_account_reasons (
      tracked_account_id,
      reason_type,
      reason_key,
      reason_status,
      started_at,
      last_confirmed_at,
      ended_at,
      retain_until,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 'active', ?, ?, NULL, NULL, ?, ?, ?)
  `,
  ).run(
    input.trackedAccountId,
    input.reasonType,
    input.reasonKey,
    startedAt,
    input.lastConfirmedAt ?? startedAt,
    input.metadataJson ?? null,
    now,
    now,
  );

  const reason = findTrackedClashAccountReason(
    input.trackedAccountId,
    input.reasonType,
    input.reasonKey,
  );

  if (!reason) {
    throw new Error(
      "A razão de acompanhamento foi cadastrada, mas não pôde ser recuperada.",
    );
  }

  return reason;
}

export function updateTrackedClashAccountReasonLifecycle(
  trackedAccountId: number,
  reasonType: TrackedClashAccountReasonType,
  reasonKey: string,
  input: UpdateTrackedClashAccountReasonLifecycleInput,
): TrackedClashAccountReason | null {
  const db = getRepositoryDatabase();

  const existing = findTrackedClashAccountReason(
    trackedAccountId,
    reasonType,
    reasonKey,
  );

  if (!existing) {
    return null;
  }

  const updatedAt = new Date().toISOString();

  db.prepare(
    `
    UPDATE tracked_clash_account_reasons
    SET
      reason_status = ?,
      last_confirmed_at = ?,
      ended_at = ?,
      retain_until = ?,
      metadata_json = ?,
      updated_at = ?
    WHERE tracked_account_id = ?
      AND reason_type = ?
      AND reason_key = ?
  `,
  ).run(
    input.reasonStatus,
    input.lastConfirmedAt !== undefined
      ? input.lastConfirmedAt
      : existing.lastConfirmedAt,
    input.endedAt !== undefined ? input.endedAt : existing.endedAt,
    input.retainUntil !== undefined ? input.retainUntil : existing.retainUntil,
    input.metadataJson !== undefined
      ? input.metadataJson
      : existing.metadataJson,
    updatedAt,
    trackedAccountId,
    reasonType,
    reasonKey,
  );

  return findTrackedClashAccountReason(trackedAccountId, reasonType, reasonKey);
}
