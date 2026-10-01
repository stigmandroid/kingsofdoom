/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/tracked-clash-account.repository.ts
 *
 * Responsabilidade:
 * Persistir e consultar as contas Clash monitoradas
 * permanentemente pela KODA.
 *
 * Funcionalidades:
 * - cadastra contas para acompanhamento;
 * - consulta uma conta pela TAG;
 * - lista contas com monitoramento ativo;
 * - pausa e reativa o acompanhamento;
 * - registra a última consulta bem-sucedida;
 * - mantém o tracking independente do clã atual.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";
import { ensureTrackedClashAccountSchema } from "@/lib/db/tracked-clash-account-schema";
import { ensureTrackedClashAccountReasonSchema } from "@/lib/db/tracked-clash-account-reason-schema";

export type TrackedClashAccountStatus = "active" | "paused";

export type TrackedClashAccount = {
  id: number;

  playerTag: string;
  playerName: string | null;

  trackingStatus: TrackedClashAccountStatus;
  trackingSource: string;

  firstTrackedAt: string;
  lastCheckedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateTrackedClashAccountInput = {
  playerTag: string;
  playerName?: string | null;
  trackingSource: string;
};

type TrackedClashAccountRow = {
  id: number;

  player_tag: string;
  player_name: string | null;

  tracking_status: TrackedClashAccountStatus;
  tracking_source: string;

  first_tracked_at: string;
  last_checked_at: string | null;

  created_at: string;
  updated_at: string;
};

function getRepositoryDatabase() {
  ensureTrackedClashAccountSchema(database);
  ensureTrackedClashAccountReasonSchema(database);

  return database;
}

function mapRow(row: TrackedClashAccountRow): TrackedClashAccount {
  return {
    id: row.id,

    playerTag: row.player_tag,
    playerName: row.player_name,

    trackingStatus: row.tracking_status,
    trackingSource: row.tracking_source,

    firstTrackedAt: row.first_tracked_at,
    lastCheckedAt: row.last_checked_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function findTrackedClashAccountByTag(
  playerTag: string,
): TrackedClashAccount | null {
  const db = getRepositoryDatabase();

  const row = db
    .prepare(
      `
      SELECT
        id,
        player_tag,
        player_name,
        tracking_status,
        tracking_source,
        first_tracked_at,
        last_checked_at,
        created_at,
        updated_at
      FROM tracked_clash_accounts
      WHERE player_tag = ?
      LIMIT 1
    `,
    )
    .get(playerTag) as TrackedClashAccountRow | undefined;

  return row ? mapRow(row) : null;
}

/**
 * Localiza uma conta Clash pelo identificador interno
 * utilizado pelos relacionamentos persistidos pela KODA.
 */
export function findTrackedClashAccountById(
  trackedAccountId: number,
): TrackedClashAccount | null {
  const db = getRepositoryDatabase();

  const row = db
    .prepare(
      `
      SELECT
        id,
        player_tag,
        player_name,
        tracking_status,
        tracking_source,
        first_tracked_at,
        last_checked_at,
        created_at,
        updated_at
      FROM tracked_clash_accounts
      WHERE id = ?
      LIMIT 1
    `,
    )
    .get(trackedAccountId) as TrackedClashAccountRow | undefined;

  return row ? mapRow(row) : null;
}

/**
 * Lista todas as contas Clash conhecidas pelo tracking,
 * independentemente do estado operacional atual.
 *
 * Usada pela reconciliação global para que contas pausadas
 * também tenham suas razões reavaliadas antes da seleção
 * das contas que devem receber polling.
 */
export function listTrackedClashAccounts(): TrackedClashAccount[] {
  const db = getRepositoryDatabase();

  const rows = db
    .prepare(
      `
      SELECT
        id,
        player_tag,
        player_name,
        tracking_status,
        tracking_source,
        first_tracked_at,
        last_checked_at,
        created_at,
        updated_at
      FROM tracked_clash_accounts
      ORDER BY first_tracked_at ASC, id ASC
    `,
    )
    .all() as unknown as TrackedClashAccountRow[];

  return rows.map(mapRow);
}

export function listActiveTrackedClashAccounts(): TrackedClashAccount[] {
  const db = getRepositoryDatabase();

  const rows = db
    .prepare(
      `
      SELECT
        id,
        player_tag,
        player_name,
        tracking_status,
        tracking_source,
        first_tracked_at,
        last_checked_at,
        created_at,
        updated_at
      FROM tracked_clash_accounts
      WHERE tracking_status = 'active'
      ORDER BY first_tracked_at ASC, id ASC
    `,
    )
    .all() as unknown as TrackedClashAccountRow[];

  return rows.map(mapRow);
}

export function createTrackedClashAccount(
  input: CreateTrackedClashAccountInput,
): TrackedClashAccount {
  const db = getRepositoryDatabase();

  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO tracked_clash_accounts (
      player_tag,
      player_name,
      tracking_status,
      tracking_source,
      first_tracked_at,
      last_checked_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'active', ?, ?, NULL, ?, ?)
  `,
  ).run(
    input.playerTag,
    input.playerName ?? null,
    input.trackingSource,
    now,
    now,
    now,
  );

  const account = findTrackedClashAccountByTag(input.playerTag);

  if (!account) {
    throw new Error(
      "A conta Clash foi cadastrada para acompanhamento, mas não pôde ser recuperada.",
    );
  }

  return account;
}

export function setTrackedClashAccountStatus(
  playerTag: string,
  status: TrackedClashAccountStatus,
): TrackedClashAccount | null {
  const db = getRepositoryDatabase();

  const updatedAt = new Date().toISOString();

  const result = db
    .prepare(
      `
      UPDATE tracked_clash_accounts
      SET
        tracking_status = ?,
        updated_at = ?
      WHERE player_tag = ?
    `,
    )
    .run(status, updatedAt, playerTag);

  if (Number(result.changes) === 0) {
    return null;
  }

  return findTrackedClashAccountByTag(playerTag);
}

/**
 * Sincroniza o estado operacional da conta com a existência
 * de razões ativas de acompanhamento.
 *
 * A conta fica ativa quando pelo menos uma razão justifica
 * polling. Caso contrário, permanece pausada.
 */
export function syncTrackedClashAccountStatusFromReasons(
  playerTag: string,
): TrackedClashAccount | null {
  const db = getRepositoryDatabase();

  const updatedAt = new Date().toISOString();

  const result = db
    .prepare(
      `
      UPDATE tracked_clash_accounts
      SET
        tracking_status = CASE
          WHEN EXISTS (
            SELECT 1
            FROM tracked_clash_account_reasons
            WHERE tracked_account_id = tracked_clash_accounts.id
              AND reason_status = 'active'
          )
          THEN 'active'
          ELSE 'paused'
        END,
        updated_at = ?
      WHERE player_tag = ?
    `,
    )
    .run(updatedAt, playerTag);

  if (Number(result.changes) === 0) {
    return null;
  }

  return findTrackedClashAccountByTag(playerTag);
}

export function updateTrackedClashAccountAfterCheck(
  playerTag: string,
  playerName: string,
  checkedAt: string,
): TrackedClashAccount | null {
  const db = getRepositoryDatabase();

  const result = db
    .prepare(
      `
      UPDATE tracked_clash_accounts
      SET
        player_name = ?,
        last_checked_at = ?,
        updated_at = ?
      WHERE player_tag = ?
    `,
    )
    .run(playerName, checkedAt, checkedAt, playerTag);

  if (Number(result.changes) === 0) {
    return null;
  }

  return findTrackedClashAccountByTag(playerTag);
}
