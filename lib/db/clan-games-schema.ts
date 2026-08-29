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
 * - manter histórico mesmo após o encerramento do evento;
 * - controlar tentativas de reconciliação da finalização;
 * - identificar quando o resultado final permanece estável;
 * - executar migrations de forma segura em builds concorrentes.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 29/08/2026
 *
 * Versão:
 * 0.9.3
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { DatabaseSync } from "node:sqlite";

/**
 * ==========================================================
 * MIGRATION HELPER
 * ==========================================================
 *
 * O Next.js pode inicializar o banco simultaneamente durante
 * o build através de múltiplos workers.
 *
 * Portanto, apenas verificar PRAGMA table_info não elimina
 * completamente uma condição de corrida:
 *
 * Worker A verifica → coluna não existe
 * Worker B verifica → coluna não existe
 * Worker A adiciona
 * Worker B tenta adicionar novamente
 *
 * Por isso também tratamos "duplicate column name" como uma
 * migration já concluída por outro worker.
 */
function addColumnIfMissing(
  database: DatabaseSync,
  tableName: string,
  columnName: string,
  columnDefinition: string,
): void {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as Array<{
    name: string;
  }>;

  const exists = columns.some((column) => column.name === columnName);

  if (exists) {
    return;
  }

  try {
    database.exec(`
      ALTER TABLE ${tableName}
      ADD COLUMN ${columnName} ${columnDefinition};
    `);
  } catch (error) {
    /**
     * Outro worker pode ter criado a coluna entre o PRAGMA
     * acima e o ALTER TABLE.
     */
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("duplicate column name")
    ) {
      return;
    }

    throw error;
  }
}

/**
 * Inicializa as tabelas utilizadas pelo histórico
 * dos Jogos do Clã.
 */
export function initializeClanGamesSchema(database: DatabaseSync): void {
  /**
   * ========================================================
   * EVENTOS
   * ========================================================
   */

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

      finalization_started_at TEXT,

      finalization_attempts INTEGER NOT NULL DEFAULT 0,

      finalization_last_total INTEGER,

      finalization_stable_count INTEGER NOT NULL DEFAULT 0,

      finalization_last_observed_at TEXT,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (clan_tag, season)
    );
  `);

  /**
   * ========================================================
   * MEMBROS
   * ========================================================
   */

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
   * MIGRAÇÕES — MEMBERS
   * ========================================================
   */

  addColumnIfMissing(database, "clan_games_members", "final_rank", "INTEGER");

  /**
   * ========================================================
   * MIGRAÇÕES — EVENTS
   * ========================================================
   */

  addColumnIfMissing(
    database,
    "clan_games_events",
    "finalization_started_at",
    "TEXT",
  );

  addColumnIfMissing(
    database,
    "clan_games_events",
    "finalization_attempts",
    "INTEGER NOT NULL DEFAULT 0",
  );

  addColumnIfMissing(
    database,
    "clan_games_events",
    "finalization_last_observed_at",
    "TEXT",
  );

  addColumnIfMissing(
    database,
    "clan_games_events",
    "finalization_last_total",
    "INTEGER",
  );

  addColumnIfMissing(
    database,
    "clan_games_events",
    "finalization_stable_count",
    "INTEGER NOT NULL DEFAULT 0",
  );

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
    CREATE INDEX IF NOT EXISTS idx_clan_games_events_state
      ON clan_games_events(state);
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
