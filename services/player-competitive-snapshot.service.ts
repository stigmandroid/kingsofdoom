/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player-competitive-snapshot.service.ts
 *
 * Responsabilidade:
 * Capturar e persistir o estado competitivo histórico
 * de uma conta Clash acompanhada pela KODA.
 *
 * Funcionalidades:
 * - normaliza componentes competitivos do jogador;
 * - detecta mudanças reais de capacidade ofensiva;
 * - detecta mudanças de contexto relevantes;
 * - evita snapshots duplicados;
 * - preserva o payload bruto recebido da Player API;
 * - mantém o histórico independente do clã atual.
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

import {
  getLatestPlayerCompetitiveSnapshot,
  savePlayerCompetitiveSnapshot,
  type PlayerCompetitiveSnapshot,
} from "@/repositories/player-competitive-snapshot.repository";

import type { Player } from "@/types/player";

const PLAYER_COMPETITIVE_SNAPSHOT_SCHEMA_VERSION = 1;

export type PlayerCompetitiveSnapshotCaptureContext = {
  captureReason: string;

  eventType?: string | null;
  eventId?: string | null;
};

export type PlayerCompetitiveSnapshotCaptureResult = {
  saved: boolean;
  snapshot: PlayerCompetitiveSnapshot;
};

type NormalizedCompetitiveState = {
  playerTag: string;
  playerName: string;

  clanTag: string | null;
  clanName: string | null;

  townHallLevel: number | null;
  townHallWeaponLevel: number | null;

  heroesJson: string;
  heroEquipmentJson: string;
  troopsJson: string;
  spellsJson: string;
};

/**
 * Produz uma representação determinística de um array.
 *
 * Os elementos são ordenados antes da serialização para que
 * uma simples alteração na ordem devolvida pela API não seja
 * interpretada como mudança competitiva.
 */
function serializeNormalizedArray<T>(
  values: T[] | undefined,
  getKey: (value: T) => string,
): string {
  const normalized = [...(values ?? [])].sort((left, right) =>
    getKey(left).localeCompare(getKey(right)),
  );

  return JSON.stringify(normalized);
}

/**
 * Extrai somente o estado necessário para detectar mudanças
 * competitivas e de contexto.
 *
 * Nenhuma pontuação ou interpretação de força é calculada
 * nesta etapa.
 */
function normalizeCompetitiveState(player: Player): NormalizedCompetitiveState {
  return {
    playerTag: player.tag,
    playerName: player.name,

    clanTag: player.clan?.tag ?? null,
    clanName: player.clan?.name ?? null,

    townHallLevel: player.townHallLevel ?? null,
    townHallWeaponLevel: player.townHallWeaponLevel ?? null,

    heroesJson: serializeNormalizedArray(
      player.heroes,
      (hero) => `${hero.village}:${hero.name}`,
    ),

    heroEquipmentJson: serializeNormalizedArray(
      player.heroEquipment,
      (equipment) => `${equipment.village}:${equipment.name}`,
    ),

    troopsJson: serializeNormalizedArray(
      player.troops,
      (troop) => `${troop.village}:${troop.name}`,
    ),

    spellsJson: serializeNormalizedArray(
      player.spells,
      (spell) => `${spell.village}:${spell.name}`,
    ),
  };
}

/**
 * Determina se o estado atual difere do último snapshot.
 *
 * captureReason/eventType/eventId não participam desta
 * comparação porque descrevem a origem da captura, não a
 * capacidade competitiva do jogador.
 */
function hasRelevantCompetitiveChange(
  latest: PlayerCompetitiveSnapshot | null,
  current: NormalizedCompetitiveState,
): boolean {
  if (!latest) {
    return true;
  }

  return (
    latest.playerName !== current.playerName ||
    latest.clanTag !== current.clanTag ||
    latest.clanName !== current.clanName ||
    latest.townHallLevel !== current.townHallLevel ||
    latest.townHallWeaponLevel !== current.townHallWeaponLevel ||
    latest.heroesJson !== current.heroesJson ||
    latest.heroEquipmentJson !== current.heroEquipmentJson ||
    latest.troopsJson !== current.troopsJson ||
    latest.spellsJson !== current.spellsJson ||
    latest.schemaVersion !== PLAYER_COMPETITIVE_SNAPSHOT_SCHEMA_VERSION
  );
}

/**
 * Captura o estado competitivo atual de um jogador.
 *
 * O snapshot é criado somente quando:
 * - ainda não existe histórico;
 * - o jogador mudou de clã;
 * - houve mudança de CV;
 * - houve mudança na arma do CV;
 * - heróis mudaram;
 * - equipamentos mudaram;
 * - tropas/pets/máquinas mudaram;
 * - feitiços mudaram;
 * - ou a versão estrutural do snapshot mudou.
 */
export function capturePlayerCompetitiveSnapshot(
  player: Player,
  context: PlayerCompetitiveSnapshotCaptureContext,
): PlayerCompetitiveSnapshotCaptureResult {
  const current = normalizeCompetitiveState(player);

  const latest = getLatestPlayerCompetitiveSnapshot(player.tag);

  if (!hasRelevantCompetitiveChange(latest, current)) {
    return {
      saved: false,
      snapshot: latest!,
    };
  }

  const capturedAt = new Date().toISOString();

  const snapshot = savePlayerCompetitiveSnapshot({
    playerTag: current.playerTag,
    playerName: current.playerName,

    capturedAt,

    clanTag: current.clanTag,
    clanName: current.clanName,

    townHallLevel: current.townHallLevel,
    townHallWeaponLevel: current.townHallWeaponLevel,

    heroesJson: current.heroesJson,
    heroEquipmentJson: current.heroEquipmentJson,
    troopsJson: current.troopsJson,
    spellsJson: current.spellsJson,

    rawPlayerJson: JSON.stringify(player),

    captureReason: context.captureReason,

    eventType: context.eventType ?? null,
    eventId: context.eventId ?? null,

    schemaVersion: PLAYER_COMPETITIVE_SNAPSHOT_SCHEMA_VERSION,
  });

  return {
    saved: true,
    snapshot,
  };
}
