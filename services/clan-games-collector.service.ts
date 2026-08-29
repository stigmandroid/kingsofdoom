/**
 * ============================================================================
 * Kings of Doom Command Center
 * Clan Games Collector Service
 * ============================================================================
 *
 * Responsabilidade:
 * Atualizar automaticamente todos os eventos ativos dos Jogos do Clã
 * registrados no banco de dados.
 *
 * Estratégia:
 * - descobrir eventos ativos diretamente no banco;
 * - não depender de clanTag ou season hardcoded;
 * - usar os membros persistidos no evento;
 * - preservar jogadores que eventualmente saírem do clã;
 * - consultar o achievement cumulativo "Games Champion";
 * - atualizar snapshots individuais;
 * - recalcular o total de cada evento;
 * - isolar falhas entre jogadores e eventos.
 *
 * Fórmula atual:
 *
 * currentPoints =
 *   baselinePoints +
 *   max(0, gamesChampionCurrent - gamesChampionBaseline)
 *
 * Observação:
 * Para agosto/2026, o baseline manual foi necessário porque a funcionalidade
 * começou a ser implementada com os Jogos do Clã já em andamento.
 *
 * Para as próximas edições, o baseline de Games Champion deverá ser capturado
 * automaticamente antes do início do evento.
 *
 * @author stigmandroid
 * @version 0.9.3
 * ============================================================================
 */

import { getPlayer } from "@/services/player.service";

import {
  listActiveClanGamesEvents,
  listClanGamesMembers,
  refreshClanGamesEventTotal,
  updateClanGamesMemberSnapshot,
  type ClanGamesEventRecord,
} from "@/repositories/clan-games.repository";

/**
 * ============================================================================
 * TIPOS
 * ============================================================================
 */

export interface ClanGamesPlayerError {
  playerTag: string;
  playerName: string;
  error: string;
}

export interface ClanGamesCollectorEventResult {
  eventId: number;
  clanTag: string;
  season: string;
  collectedAt: string;

  totalMembers: number;
  processed: number;
  updated: number;
  errors: number;

  totalPoints: number;

  playerErrors: ClanGamesPlayerError[];
}

export interface ClanGamesCollectorEventError {
  eventId: number;
  clanTag: string;
  season: string;
  error: string;
}

export interface ClanGamesCollectorResult {
  success: boolean;
  collectedAt: string;

  eventsFound: number;
  eventsUpdated: number;
  eventsWithErrors: number;

  events: ClanGamesCollectorEventResult[];

  eventErrors: ClanGamesCollectorEventError[];
}

/**
 * ============================================================================
 * COLETA DE UM EVENTO
 * ============================================================================
 */

export async function collectClanGamesEvent(
  event: ClanGamesEventRecord,
  collectedAt: string,
): Promise<ClanGamesCollectorEventResult> {
  const members = listClanGamesMembers(event.id);

  let processed = 0;
  let updated = 0;

  const playerErrors: ClanGamesPlayerError[] = [];

  /**
   * Processamos sequencialmente para evitar uma explosão simultânea
   * de requisições à Clash API.
   */
  for (const member of members) {
    processed += 1;

    try {
      const player = await getPlayer(member.player_tag);

      const gamesChampion = player.achievements?.find(
        (achievement) => achievement.name === "Games Champion",
      );

      if (!gamesChampion) {
        throw new Error('Achievement "Games Champion" não encontrado.');
      }

      updateClanGamesMemberSnapshot(
        event.id,
        member.player_tag,
        gamesChampion.value,
        collectedAt,
      );

      updated += 1;
    } catch (error) {
      playerErrors.push({
        playerTag: member.player_tag,
        playerName: member.player_name,

        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  const totalPoints = refreshClanGamesEventTotal(event.id);

  return {
    eventId: event.id,
    clanTag: event.clan_tag,
    season: event.season,
    collectedAt,

    totalMembers: members.length,
    processed,
    updated,
    errors: playerErrors.length,

    totalPoints,

    playerErrors,
  };
}

/**
 * ============================================================================
 * COLETA MULTI-EVENTO
 * ============================================================================
 */

/**
 * Atualiza todos os eventos ativos encontrados no banco.
 *
 * O collector não precisa conhecer previamente:
 * - quais clãs existem;
 * - qual é a temporada atual;
 * - quantos eventos estão ativos.
 *
 * Basta existir um registro com state = "active".
 */
export async function collectClanGames(): Promise<ClanGamesCollectorResult> {
  const collectedAt = new Date().toISOString();

  const activeEvents = listActiveClanGamesEvents();

  const events: ClanGamesCollectorEventResult[] = [];

  const eventErrors: ClanGamesCollectorEventError[] = [];

  for (const event of activeEvents) {
    try {
      const result = await collectClanGamesEvent(event, collectedAt);

      events.push(result);
    } catch (error) {
      eventErrors.push({
        eventId: event.id,
        clanTag: event.clan_tag,
        season: event.season,

        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return {
    success: eventErrors.length === 0,
    collectedAt,

    eventsFound: activeEvents.length,
    eventsUpdated: events.length,
    eventsWithErrors: eventErrors.length,

    events,
    eventErrors,
  };
}
