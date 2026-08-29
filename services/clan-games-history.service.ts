/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/clan-games-history.service.ts
 *
 * Responsabilidade:
 * Preparar os dados históricos dos Jogos do Clã para
 * consumo pelas páginas de Event Intelligence.
 *
 * Estratégia:
 * - localizar automaticamente a edição mais recente;
 * - carregar participantes persistidos no evento;
 * - preservar jogadores que já deixaram o clã;
 * - calcular métricas derivadas para apresentação;
 * - não realizar nenhuma escrita no banco de dados.
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

import {
  findLatestClanGamesEvent,
  listClanGamesMembers,
} from "@/repositories/clan-games.repository";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export interface ClanGamesHistoryMember {
  playerTag: string;
  playerName: string;
  baselinePoints: number;
  currentPoints: number;
  finalRank: number | null;
  gamesChampionBaseline: number | null;
  gamesChampionCurrent: number | null;
  baselineCapturedAt: string | null;
  lastCollectedAt: string | null;
}

export interface ClanGamesHistoryEvent {
  id: number;

  clanTag: string;
  season: string;
  state: string;

  totalPoints: number;
  participantsCount: number;
  positiveParticipantsCount: number;

  averagePointsPerParticipant: number;
  maxPoints: number;

  baselineCapturedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;

  members: ClanGamesHistoryMember[];
}

/**
 * ==========================================================
 * EVENTO MAIS RECENTE
 * ==========================================================
 */

/**
 * Retorna a edição mais recente dos Jogos do Clã
 * persistida para determinado clã.
 *
 * Importante:
 * a lista de participantes vem da própria edição histórica,
 * e não do roster atual do clã.
 */
export function getLatestClanGames(
  clanTag: string,
): ClanGamesHistoryEvent | null {
  const event = findLatestClanGamesEvent(clanTag);

  if (!event) {
    return null;
  }

  const persistedMembers = listClanGamesMembers(event.id);

  const members = persistedMembers.map((member) => ({
    playerTag: member.player_tag,
    playerName: member.player_name,
    baselinePoints: member.baseline_points,
    currentPoints: member.current_points,
    finalRank: member.final_rank,
    gamesChampionBaseline: member.games_champion_baseline,
    gamesChampionCurrent: member.games_champion_current,
    baselineCapturedAt: member.baseline_captured_at,
    lastCollectedAt: member.last_collected_at,
  }));

  const positiveMembers = members.filter((member) => member.currentPoints > 0);

  const maxPoints =
    positiveMembers.length > 0
      ? Math.max(...positiveMembers.map((member) => member.currentPoints))
      : 0;

  const averagePointsPerParticipant =
    positiveMembers.length > 0
      ? event.total_points / positiveMembers.length
      : 0;

  return {
    id: event.id,

    clanTag: event.clan_tag,
    season: event.season,
    state: event.state,

    totalPoints: event.total_points,

    participantsCount: members.length,
    positiveParticipantsCount: positiveMembers.length,

    averagePointsPerParticipant,
    maxPoints,

    baselineCapturedAt: event.baseline_captured_at,
    startedAt: event.started_at,
    endedAt: event.ended_at,

    members,
  };
}
