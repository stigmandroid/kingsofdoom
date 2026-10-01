/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/player-competitive-snapshot-schema.ts
 *
 * Responsabilidade:
 * Garantir a estrutura de persistência dos snapshots
 * competitivos históricos das contas Clash acompanhadas
 * pela KODA.
 *
 * Funcionalidades:
 * - preserva o estado competitivo bruto do jogador;
 * - mantém histórico independente do clã atual;
 * - permite reconstrução futura de modelos de força;
 * - registra contexto e motivo da captura;
 * - evita acoplar os dados históricos a um algoritmo
 *   específico de classificação.
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

export function ensurePlayerCompetitiveSnapshotSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_competitive_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,

      captured_at TEXT NOT NULL,

      clan_tag TEXT,
      clan_name TEXT,

      town_hall_level INTEGER,
      town_hall_weapon_level INTEGER,

      heroes_json TEXT NOT NULL DEFAULT '[]',
      hero_equipment_json TEXT NOT NULL DEFAULT '[]',
      troops_json TEXT NOT NULL DEFAULT '[]',
      spells_json TEXT NOT NULL DEFAULT '[]',

      raw_player_json TEXT NOT NULL,

      capture_reason TEXT NOT NULL,

      event_type TEXT,
      event_id TEXT,

      schema_version INTEGER NOT NULL DEFAULT 1,

      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_player_competitive_snapshots_player
      ON player_competitive_snapshots(player_tag, captured_at DESC);

    CREATE INDEX IF NOT EXISTS idx_player_competitive_snapshots_event
      ON player_competitive_snapshots(event_type, event_id);

    CREATE INDEX IF NOT EXISTS idx_player_competitive_snapshots_clan
      ON player_competitive_snapshots(clan_tag, captured_at DESC);
  `);
}
