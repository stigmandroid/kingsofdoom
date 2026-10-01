/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/tracked-clash-account-schema.ts
 *
 * Responsabilidade:
 * Garantir a estrutura de persistência das contas Clash
 * monitoradas permanentemente pela KODA.
 *
 * Funcionalidades:
 * - registra contas Clash independentemente do clã atual;
 * - utiliza a TAG como identidade estável da conta;
 * - permite ativar ou pausar o monitoramento;
 * - registra a origem do acompanhamento;
 * - mantém informações operacionais da coleta;
 * - não associa monitoramento à propriedade de um usuário.
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

import type { DatabaseSync } from "node:sqlite";

export function ensureTrackedClashAccountSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracked_clash_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      player_tag TEXT NOT NULL UNIQUE,
      player_name TEXT,

      tracking_status TEXT NOT NULL DEFAULT 'active'
        CHECK (tracking_status IN ('active', 'paused')),

      tracking_source TEXT NOT NULL,

      first_tracked_at TEXT NOT NULL,

      last_checked_at TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tracked_clash_accounts_status
      ON tracked_clash_accounts(tracking_status);
  `);
}
