/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player-clan-games-history.service.ts
 *
 * Responsabilidade:
 * Construir o histórico individual de participações de um
 * jogador nos Jogos do Clã.
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

import {
  listPlayerClanGamesHistory,
  type PlayerClanGamesHistoryRecord,
} from "@/repositories/clan-games.repository";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type PlayerClanGamesParticipation = {
  eventId: number;
  clanTag: string;
  season: string;
  state: string;
  clanTotalPoints: number;
  endedAt: string | null;

  playerTag: string;
  playerName: string;
  points: number;
  finalRank: number | null;
};

export type PlayerClanGamesHistory = {
  playerTag: string;

  totalParticipations: number;
  completedParticipations: number;

  totalPoints: number;
  averagePoints: number;

  bestPoints: number;
  bestRank: number | null;

  latestParticipation: PlayerClanGamesParticipation | null;

  participations: PlayerClanGamesParticipation[];
};

/**
 * ==========================================================
 * MAPEAMENTO
 * ==========================================================
 */

function mapParticipation(
  record: PlayerClanGamesHistoryRecord,
): PlayerClanGamesParticipation {
  return {
    eventId: record.event_id,
    clanTag: record.clan_tag,
    season: record.season,
    state: record.state,
    clanTotalPoints: record.total_points,
    endedAt: record.ended_at,

    playerTag: record.player_tag,
    playerName: record.player_name,
    points: record.points,
    finalRank: record.final_rank,
  };
}

/**
 * ==========================================================
 * HISTÓRICO INDIVIDUAL
 * ==========================================================
 */

export function getPlayerClanGamesHistory(
  playerTag: string,
): PlayerClanGamesHistory {
  const records = listPlayerClanGamesHistory(playerTag);

  const participations = records.map(mapParticipation);

  const completedParticipations = participations.filter(
    (participation) => participation.state === "completed",
  );

  const totalPoints = participations.reduce(
    (sum, participation) => sum + participation.points,
    0,
  );

  const averagePoints =
    participations.length > 0
      ? Math.round(totalPoints / participations.length)
      : 0;

  const bestPoints = participations.reduce(
    (best, participation) => Math.max(best, participation.points),
    0,
  );

  const rankedParticipations = participations.filter(
    (participation) => participation.finalRank !== null,
  );

  const bestRank =
    rankedParticipations.length > 0
      ? Math.min(
          ...rankedParticipations.map(
            (participation) => participation.finalRank as number,
          ),
        )
      : null;

  return {
    playerTag,

    totalParticipations: participations.length,
    completedParticipations: completedParticipations.length,

    totalPoints,
    averagePoints,

    bestPoints,
    bestRank,

    latestParticipation: participations[0] ?? null,

    participations,
  };
}
