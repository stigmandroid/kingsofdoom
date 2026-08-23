import type { DatabaseSync } from "node:sqlite";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/trophy-league-schema.ts
 *
 * Responsabilidade:
 * Criar e manter a estrutura persistente utilizada pelo
 * histórico da Liga de Troféus.
 *
 * O schema armazena snapshots periódicos dos jogadores para
 * permitir acompanhar:
 *
 * • clã ao qual o jogador pertencia no momento da captura;
 * • liga atual;
 * • temporada atual;
 * • grupo atual da liga;
 * • troféus da temporada;
 * • melhor marca;
 * • contribuição-base;
 * • peso estimado no Clan Score;
 * • evolução histórica entre snapshots.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

type TableInfoRow = {
  name: string;
};

/**
 * Verifica se determinada coluna já existe na tabela.
 *
 * Isso permite evoluir bancos SQLite já existentes sem
 * apagar os snapshots históricos previamente coletados.
 */
function hasColumn(
  database: DatabaseSync,
  tableName: string,
  columnName: string,
): boolean {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as TableInfoRow[];

  return columns.some((column) => column.name === columnName);
}

/**
 * Inicializa as estruturas responsáveis pelo histórico
 * persistente da Liga de Troféus.
 */
export function initializeTrophyLeagueSchema(database: DatabaseSync): void {
  /**
   * ========================================================
   * TABELA PRINCIPAL
   * ========================================================
   */

  database.exec(`
    CREATE TABLE IF NOT EXISTS trophy_league_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      tracked_clan_tag TEXT,
      tracked_clan_name TEXT,

      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,

      captured_at TEXT NOT NULL,

      league_tier_id INTEGER,
      league_tier_name TEXT,

      league_group_tag TEXT,
      league_season_id INTEGER,

      previous_league_group_tag TEXT,
      previous_league_season_id INTEGER,

      trophies INTEGER NOT NULL DEFAULT 0,
      best_trophies INTEGER NOT NULL DEFAULT 0,

      base_score INTEGER NOT NULL DEFAULT 0,
      estimated_clan_contribution INTEGER NOT NULL DEFAULT 0
    );
  `);

  /**
   * ========================================================
   * MIGRAÇÕES
   * ========================================================
   *
   * Bancos criados antes desta versão ainda não possuem
   * tracked_clan_tag e tracked_clan_name.
   *
   * ALTER TABLE preserva todos os snapshots já existentes.
   */

  if (!hasColumn(database, "trophy_league_snapshots", "tracked_clan_tag")) {
    database.exec(`
      ALTER TABLE trophy_league_snapshots
      ADD COLUMN tracked_clan_tag TEXT;
    `);
  }

  if (!hasColumn(database, "trophy_league_snapshots", "tracked_clan_name")) {
    database.exec(`
      ALTER TABLE trophy_league_snapshots
      ADD COLUMN tracked_clan_name TEXT;
    `);
  }

  /**
   * ========================================================
   * ÍNDICES
   * ========================================================
   */

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_trophy_league_snapshots_clan
      ON trophy_league_snapshots (
        tracked_clan_tag
      );

    CREATE INDEX IF NOT EXISTS idx_trophy_league_snapshots_clan_season
      ON trophy_league_snapshots (
        tracked_clan_tag,
        league_season_id
      );

    CREATE INDEX IF NOT EXISTS idx_trophy_league_snapshots_player
      ON trophy_league_snapshots (
        player_tag
      );

    CREATE INDEX IF NOT EXISTS idx_trophy_league_snapshots_season
      ON trophy_league_snapshots (
        league_season_id
      );

    CREATE INDEX IF NOT EXISTS idx_trophy_league_snapshots_player_season
      ON trophy_league_snapshots (
        player_tag,
        league_season_id
      );

    CREATE INDEX IF NOT EXISTS idx_trophy_league_snapshots_captured
      ON trophy_league_snapshots (
        captured_at
      );
  `);
}
