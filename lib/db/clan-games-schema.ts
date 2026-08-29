/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/clan-games-schema.ts
 *
 * Responsabilidade:
 * Criar e manter a estrutura de persistência utilizada pelo
 * módulo de Inteligência dos Jogos do Clã.
 *
 * Estratégia:
 * - registrar cada edição dos Jogos do Clã por clã;
 * - preservar um baseline manual quando necessário;
 * - armazenar snapshots do achievement "Games Champion";
 * - permitir cálculo incremental da pontuação individual;
 * - preservar a posição oficial após o encerramento;
 * - manter histórico mesmo após o encerramento do evento.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 29/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { DatabaseSync } from "node:sqlite";

/**
 * Inicializa as tabelas utilizadas pelo histórico
 * dos Jogos do Clã.
 */
export function initializeClanGamesSchema(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS clan_games_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      clan_tag TEXT NOT NULL,

      season TEXT NOT NULL,

      state TEXT NOT NULL DEFAULT 'active',

      total_points INTEGER NOT NULL DEFAULT 0,

      baseline_captured_at TEXT,

      started_at TEXT,

      ended_at TEXT,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (clan_tag, season)
    );
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS clan_games_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      clan_games_event_id INTEGER NOT NULL,

      player_tag TEXT NOT NULL,

      player_name TEXT NOT NULL,

      baseline_points INTEGER NOT NULL DEFAULT 0,

      current_points INTEGER NOT NULL DEFAULT 0,

      final_rank INTEGER,

      games_champion_baseline INTEGER,

      games_champion_current INTEGER,

      baseline_captured_at TEXT,

      last_collected_at TEXT,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (clan_games_event_id)
        REFERENCES clan_games_events(id)
        ON DELETE CASCADE,

      UNIQUE (clan_games_event_id, player_tag)
    );
  `);

  /**
   * ========================================================
   * MIGRAÇÕES
   * ========================================================
   *
   * CREATE TABLE IF NOT EXISTS não adiciona novas colunas
   * quando a tabela já existe.
   *
   * Portanto verificamos explicitamente se final_rank já
   * existe antes de executar ALTER TABLE.
   */

  const memberColumns = database
    .prepare(
      `
      PRAGMA table_info(clan_games_members)
    `,
    )
    .all() as Array<{
    name: string;
  }>;

  const hasFinalRank = memberColumns.some(
    (column) => column.name === "final_rank",
  );

  if (!hasFinalRank) {
    database.exec(`
      ALTER TABLE clan_games_members
      ADD COLUMN final_rank INTEGER;
    `);
  }

  /**
   * ========================================================
   * ÍNDICES
   * ========================================================
   */

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_clan_games_events_clan_tag
      ON clan_games_events(clan_tag);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_clan_games_events_season
      ON clan_games_events(season);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_clan_games_members_event
      ON clan_games_members(clan_games_event_id);
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_clan_games_members_player
      ON clan_games_members(player_tag);
  `);

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_clan_games_members_final_rank
      ON clan_games_members(
        clan_games_event_id,
        final_rank
      )
      WHERE final_rank IS NOT NULL;
  `);
}
