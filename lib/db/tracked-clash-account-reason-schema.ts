/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/tracked-clash-account-reason-schema.ts
 *
 * Responsabilidade:
 * Garantir a estrutura de persistência das razões que
 * justificam o acompanhamento de uma conta Clash pela KODA.
 *
 * Funcionalidades:
 * - permite múltiplas razões para a mesma conta;
 * - separa identidade da conta da origem do acompanhamento;
 * - preserva o ciclo de vida independente de cada razão;
 * - suporta acompanhamento organizacional, de usuário
 *   e de eventos competitivos;
 * - prepara políticas distintas de retenção por origem.
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

export function ensureTrackedClashAccountReasonSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracked_clash_account_reasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      tracked_account_id INTEGER NOT NULL,

      reason_type TEXT NOT NULL
        CHECK (
          reason_type IN (
            'organization',
            'user',
            'competitive_event',
            'legacy'
          )
        ),

      reason_key TEXT NOT NULL,

      reason_status TEXT NOT NULL DEFAULT 'active'
        CHECK (
          reason_status IN (
            'active',
            'retention',
            'expired'
          )
        ),

      started_at TEXT NOT NULL,
      last_confirmed_at TEXT,

      ended_at TEXT,
      retain_until TEXT,

      metadata_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (tracked_account_id)
        REFERENCES tracked_clash_accounts(id)
        ON DELETE CASCADE,

      UNIQUE (
        tracked_account_id,
        reason_type,
        reason_key
      )
    );

    CREATE INDEX IF NOT EXISTS idx_tracked_clash_account_reasons_account
      ON tracked_clash_account_reasons(tracked_account_id);

    CREATE INDEX IF NOT EXISTS idx_tracked_clash_account_reasons_status
      ON tracked_clash_account_reasons(reason_status);

    CREATE INDEX IF NOT EXISTS idx_tracked_clash_account_reasons_type
      ON tracked_clash_account_reasons(reason_type);

    CREATE INDEX IF NOT EXISTS idx_tracked_clash_account_reasons_lookup
      ON tracked_clash_account_reasons(
        reason_type,
        reason_key,
        reason_status
      );
  `);
}
