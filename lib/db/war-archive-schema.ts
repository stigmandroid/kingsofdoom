import type { DatabaseSync } from "node:sqlite";

export function initializeWarArchiveSchema(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS war_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      war_key TEXT NOT NULL UNIQUE,
      tracked_clan_tag TEXT NOT NULL,
      state TEXT NOT NULL,
      result TEXT NOT NULL CHECK (result IN ('preparation','ongoing','win','loss','draw')),
      team_size INTEGER,
      attacks_per_member INTEGER,
      preparation_start_time TEXT,
      start_time TEXT,
      end_time TEXT,
      clan_tag TEXT NOT NULL,
      clan_name TEXT NOT NULL,
      clan_level INTEGER,
      clan_stars INTEGER NOT NULL DEFAULT 0,
      clan_destruction REAL NOT NULL DEFAULT 0,
      clan_attacks INTEGER NOT NULL DEFAULT 0,
      clan_badge_urls_json TEXT,
      opponent_tag TEXT NOT NULL,
      opponent_name TEXT NOT NULL,
      opponent_level INTEGER,
      opponent_stars INTEGER NOT NULL DEFAULT 0,
      opponent_destruction REAL NOT NULL DEFAULT 0,
      opponent_attacks INTEGER NOT NULL DEFAULT 0,
      opponent_badge_urls_json TEXT,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS war_history_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      war_id INTEGER NOT NULL,
      side TEXT NOT NULL CHECK (side IN ('clan','opponent')),
      clan_tag TEXT NOT NULL,
      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,
      town_hall_level INTEGER,
      map_position INTEGER,
      opponent_attacks INTEGER,
      best_opponent_attack_json TEXT,
      raw_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (war_id, player_tag),
      FOREIGN KEY (war_id) REFERENCES war_history(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS war_history_attacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      war_id INTEGER NOT NULL,
      attacker_tag TEXT NOT NULL,
      defender_tag TEXT NOT NULL,
      attacker_town_hall INTEGER,
      defender_town_hall INTEGER,
      stars INTEGER NOT NULL,
      destruction REAL NOT NULL,
      attack_order INTEGER,
      duration INTEGER,
      town_hall_difference INTEGER,
      result_type TEXT CHECK (result_type IN ('triple','two_star','one_star','zero_star')),
      raw_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (war_id, attack_order),
      FOREIGN KEY (war_id) REFERENCES war_history(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_war_history_tracked_clan
      ON war_history (tracked_clan_tag, preparation_start_time);

    CREATE INDEX IF NOT EXISTS idx_war_history_opponent
      ON war_history (opponent_tag);

    CREATE INDEX IF NOT EXISTS idx_war_history_members_player
      ON war_history_members (player_tag);

    CREATE INDEX IF NOT EXISTS idx_war_history_attacks_attacker
      ON war_history_attacks (attacker_tag);

    CREATE INDEX IF NOT EXISTS idx_war_history_attacks_result
      ON war_history_attacks (stars, result_type);
  `);
}
