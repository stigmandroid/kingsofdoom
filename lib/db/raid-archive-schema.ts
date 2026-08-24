/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/raid-archive-schema.ts
 *
 * Responsabilidade:
 * Definir o schema persistente responsável pelo histórico
 * dos Raid Weekends monitorados pelo Command Center.
 *
 * Estrutura:
 *
 * raid_weekends
 *      ↓
 * raid_weekend_members
 *
 * Objetivo:
 *
 * - preservar permanentemente cada Raid Weekend;
 * - armazenar os totais observados do clã;
 * - preservar a participação individual dos jogadores;
 * - permitir múltiplos snapshots sem duplicar registros;
 * - preparar a futura camada de Player Intelligence;
 * - permitir rankings e histórico individual posteriormente.
 *
 * Estratégia:
 *
 * - um Raid Weekend é identificado por clã + start_time;
 * - cada jogador possui apenas um registro por Raid Weekend;
 * - UPSERTs posteriores atualizam o snapshot existente;
 * - payloads brutos são preservados para futuras análises.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { DatabaseSync } from "node:sqlite";

/**
 * Inicializa as estruturas persistentes de Raid Weekend.
 *
 * CREATE TABLE IF NOT EXISTS permite executar esta função
 * diversas vezes sem destruir dados já armazenados.
 */
export function initializeRaidArchiveSchema(database: DatabaseSync): void {
  database.exec(`
    /**
     * ======================================================
     * RAID WEEKENDS
     * ======================================================
     */

    CREATE TABLE IF NOT EXISTS raid_weekends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      /**
       * Clã acompanhado pelo Command Center.
       */
      clan_tag TEXT NOT NULL,

      /**
       * Estado conhecido do Raid Weekend.
       *
       * Exemplos:
       * ongoing
       * ended
       */
      state TEXT NOT NULL,

      /**
       * Janela oficial do evento.
       */
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,

      /**
       * Métricas agregadas do clã.
       */
      capital_total_loot INTEGER NOT NULL DEFAULT 0,

      raids_completed INTEGER NOT NULL DEFAULT 0,

      total_attacks INTEGER NOT NULL DEFAULT 0,

      enemy_districts_destroyed INTEGER NOT NULL DEFAULT 0,

      offensive_reward INTEGER NOT NULL DEFAULT 0,

      defensive_reward INTEGER NOT NULL DEFAULT 0,

      /**
       * Payload completo retornado pela Clash API.
       */
      raw_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      /**
       * Um mesmo clã só pode possuir um registro
       * para determinado Raid Weekend.
       */
      UNIQUE (
        clan_tag,
        start_time
      )
    );

    /**
     * ======================================================
     * MEMBROS DO RAID WEEKEND
     * ======================================================
     */

    CREATE TABLE IF NOT EXISTS raid_weekend_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      raid_weekend_id INTEGER NOT NULL,

      player_tag TEXT NOT NULL,
      player_name TEXT NOT NULL,

      /**
       * Quantidade de ataques já utilizados.
       */
      attacks INTEGER NOT NULL DEFAULT 0,

      /**
       * Limite padrão de ataques.
       */
      attack_limit INTEGER NOT NULL DEFAULT 0,

      /**
       * Ataque extra obtido durante o Raid Weekend.
       */
      bonus_attack_limit INTEGER NOT NULL DEFAULT 0,

      /**
       * Ouro da Capital saqueado pelo jogador.
       */
      capital_resources_looted INTEGER NOT NULL DEFAULT 0,

      /**
       * Payload bruto do jogador naquele evento.
       */
      raw_json TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      UNIQUE (
        raid_weekend_id,
        player_tag
      ),

      FOREIGN KEY (raid_weekend_id)
        REFERENCES raid_weekends(id)
        ON DELETE CASCADE
    );

    /**
     * ======================================================
     * ÍNDICES
     * ======================================================
     */

    CREATE INDEX IF NOT EXISTS
      idx_raid_weekends_clan
    ON raid_weekends (
      clan_tag,
      start_time
    );

    CREATE INDEX IF NOT EXISTS
      idx_raid_weekend_members_player
    ON raid_weekend_members (
      player_tag
    );

    CREATE INDEX IF NOT EXISTS
      idx_raid_weekend_members_weekend
    ON raid_weekend_members (
      raid_weekend_id
    );
  `);
}
