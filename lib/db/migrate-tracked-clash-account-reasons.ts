/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/migrate-tracked-clash-account-reasons.ts
 *
 * Responsabilidade:
 * Migrar origens legadas de acompanhamento para o modelo
 * de múltiplas razões de tracking da KODA.
 *
 * Funcionalidades:
 * - preserva contas já monitoradas;
 * - converte tracking_source em razão legacy;
 * - preserva o estado operacional anterior;
 * - evita duplicação em execuções repetidas;
 * - não remove dados ou colunas legadas.
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

import type { DatabaseSync } from "node:sqlite";

import { ensureTrackedClashAccountSchema } from "@/lib/db/tracked-clash-account-schema";
import { ensureTrackedClashAccountReasonSchema } from "@/lib/db/tracked-clash-account-reason-schema";

type LegacyTrackedClashAccountRow = {
  id: number;
  tracking_status: "active" | "paused";
  tracking_source: string;
  first_tracked_at: string;
  updated_at: string;
};

export function migrateTrackedClashAccountReasons(db: DatabaseSync): void {
  ensureTrackedClashAccountSchema(db);
  ensureTrackedClashAccountReasonSchema(db);

  const accounts = db
    .prepare(
      `
      SELECT
        id,
        tracking_status,
        tracking_source,
        first_tracked_at,
        updated_at
      FROM tracked_clash_accounts
      WHERE tracking_source IS NOT NULL
        AND TRIM(tracking_source) <> ''
    `,
    )
    .all() as unknown as LegacyTrackedClashAccountRow[];

  const insertReason = db.prepare(`
    INSERT OR IGNORE INTO tracked_clash_account_reasons (
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
    VALUES (?, 'legacy', ?, ?, ?, ?, ?, NULL, ?, ?, ?)
  `);

  for (const account of accounts) {
    const isActive = account.tracking_status === "active";

    const metadataJson = JSON.stringify({
      migratedFrom: "tracked_clash_accounts.tracking_source",
      legacyTrackingSource: account.tracking_source,
    });

    insertReason.run(
      account.id,
      account.tracking_source,
      isActive ? "active" : "retention",
      account.first_tracked_at,
      account.first_tracked_at,
      isActive ? null : account.updated_at,
      metadataJson,
      account.first_tracked_at,
      account.updated_at,
    );
  }
}
