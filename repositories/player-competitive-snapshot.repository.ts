/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/player-competitive-snapshot.repository.ts
 *
 * Responsabilidade:
 * Persistir e consultar snapshots competitivos históricos
 * das contas Clash acompanhadas pela KODA.
 *
 * Funcionalidades:
 * - garante o schema necessário;
 * - persiste snapshots competitivos;
 * - recupera o snapshot mais recente de uma conta;
 * - mantém o histórico vinculado à TAG do jogador;
 * - preserva o payload bruto para reprocessamento futuro.
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
import { ensurePlayerCompetitiveSnapshotSchema } from "@/lib/db/player-competitive-snapshot-schema";

export type PlayerCompetitiveSnapshot = {
  id: number;

  playerTag: string;
  playerName: string;

  capturedAt: string;

  clanTag: string | null;
  clanName: string | null;

  townHallLevel: number | null;
  townHallWeaponLevel: number | null;

  heroesJson: string;
  heroEquipmentJson: string;
  troopsJson: string;
  spellsJson: string;

  rawPlayerJson: string;

  captureReason: string;

  eventType: string | null;
  eventId: string | null;

  schemaVersion: number;

  createdAt: string;
};

export type SavePlayerCompetitiveSnapshotInput = {
  playerTag: string;
  playerName: string;

  capturedAt: string;

  clanTag?: string | null;
  clanName?: string | null;

  townHallLevel?: number | null;
  townHallWeaponLevel?: number | null;

  heroesJson: string;
  heroEquipmentJson: string;
  troopsJson: string;
  spellsJson: string;

  rawPlayerJson: string;

  captureReason: string;

  eventType?: string | null;
  eventId?: string | null;

  schemaVersion?: number;
};

type PlayerCompetitiveSnapshotRow = {
  id: number;

  player_tag: string;
  player_name: string;

  captured_at: string;

  clan_tag: string | null;
  clan_name: string | null;

  town_hall_level: number | null;
  town_hall_weapon_level: number | null;

  heroes_json: string;
  hero_equipment_json: string;
  troops_json: string;
  spells_json: string;

  raw_player_json: string;

  capture_reason: string;

  event_type: string | null;
  event_id: string | null;

  schema_version: number;

  created_at: string;
};

function mapRow(row: PlayerCompetitiveSnapshotRow): PlayerCompetitiveSnapshot {
  return {
    id: row.id,

    playerTag: row.player_tag,
    playerName: row.player_name,

    capturedAt: row.captured_at,

    clanTag: row.clan_tag,
    clanName: row.clan_name,

    townHallLevel: row.town_hall_level,
    townHallWeaponLevel: row.town_hall_weapon_level,

    heroesJson: row.heroes_json,
    heroEquipmentJson: row.hero_equipment_json,
    troopsJson: row.troops_json,
    spellsJson: row.spells_json,

    rawPlayerJson: row.raw_player_json,

    captureReason: row.capture_reason,

    eventType: row.event_type,
    eventId: row.event_id,

    schemaVersion: row.schema_version,

    createdAt: row.created_at,
  };
}

function getRepositoryDatabase() {
  ensurePlayerCompetitiveSnapshotSchema(database);

  return database;
}

export function getLatestPlayerCompetitiveSnapshot(
  playerTag: string,
): PlayerCompetitiveSnapshot | null {
  const db = getRepositoryDatabase();

  const row = db
    .prepare(
      `
      SELECT
        id,
        player_tag,
        player_name,
        captured_at,
        clan_tag,
        clan_name,
        town_hall_level,
        town_hall_weapon_level,
        heroes_json,
        hero_equipment_json,
        troops_json,
        spells_json,
        raw_player_json,
        capture_reason,
        event_type,
        event_id,
        schema_version,
        created_at
      FROM player_competitive_snapshots
      WHERE player_tag = ?
      ORDER BY captured_at DESC, id DESC
      LIMIT 1
    `,
    )
    .get(playerTag) as PlayerCompetitiveSnapshotRow | undefined;

  return row ? mapRow(row) : null;
}

export function savePlayerCompetitiveSnapshot(
  input: SavePlayerCompetitiveSnapshotInput,
): PlayerCompetitiveSnapshot {
  const db = getRepositoryDatabase();

  const createdAt = new Date().toISOString();

  const result = db
    .prepare(
      `
      INSERT INTO player_competitive_snapshots (
        player_tag,
        player_name,
        captured_at,
        clan_tag,
        clan_name,
        town_hall_level,
        town_hall_weapon_level,
        heroes_json,
        hero_equipment_json,
        troops_json,
        spells_json,
        raw_player_json,
        capture_reason,
        event_type,
        event_id,
        schema_version,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    )
    .run(
      input.playerTag,
      input.playerName,
      input.capturedAt,
      input.clanTag ?? null,
      input.clanName ?? null,
      input.townHallLevel ?? null,
      input.townHallWeaponLevel ?? null,
      input.heroesJson,
      input.heroEquipmentJson,
      input.troopsJson,
      input.spellsJson,
      input.rawPlayerJson,
      input.captureReason,
      input.eventType ?? null,
      input.eventId ?? null,
      input.schemaVersion ?? 1,
      createdAt,
    );

  const row = db
    .prepare(
      `
      SELECT
        id,
        player_tag,
        player_name,
        captured_at,
        clan_tag,
        clan_name,
        town_hall_level,
        town_hall_weapon_level,
        heroes_json,
        hero_equipment_json,
        troops_json,
        spells_json,
        raw_player_json,
        capture_reason,
        event_type,
        event_id,
        schema_version,
        created_at
      FROM player_competitive_snapshots
      WHERE id = ?
    `,
    )
    .get(Number(result.lastInsertRowid)) as
    | PlayerCompetitiveSnapshotRow
    | undefined;

  if (!row) {
    throw new Error(
      "O snapshot competitivo foi inserido, mas não pôde ser recuperado.",
    );
  }

  return mapRow(row);
}
