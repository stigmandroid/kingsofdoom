/**
 * ============================================================================
 * Kings of Doom Command Center
 * Clan Games Lifecycle Service
 * ============================================================================
 *
 * Responsabilidade:
 * Controlar as transições de estado de uma edição dos Jogos do Clã.
 *
 * Lifecycle:
 *
 * baseline
 *    ↓
 * active
 *    ↓
 * coleta
 *    ↓
 * completed
 *    ↓
 * histórico
 *
 * Este serviço não calcula pontuações.
 * A coleta continua sendo responsabilidade do Clan Games Collector.
 *
 * @author stigmandroid
 * @version 0.9.3
 * ============================================================================
 */

import {
  completeClanGamesEvent,
  findClanGamesEventById,
  refreshClanGamesEventTotal,
} from "@/repositories/clan-games.repository";

import { collectClanGamesEvent } from "@/services/clan-games-collector.service";

/**
 * ============================================================================
 * TIPOS
 * ============================================================================
 */

export interface CompleteClanGamesResult {
  success: boolean;

  eventId: number;
  clanTag: string;
  season: string;

  previousState: string;
  state: string;

  totalPoints: number;

  endedAt: string;
}

/**
 * ============================================================================
 * PRÉ-FINALIZAÇÃO
 * ============================================================================
 */

export interface PrepareClanGamesFinalizationResult {
  success: boolean;

  eventId: number;
  clanTag: string;
  season: string;

  state: string;

  collectedAt: string;

  totalMembers: number;
  updatedMembers: number;
  failedMembers: number;

  totalPoints: number;
}

/**
 * Executa uma coleta final candidata sem encerrar o evento.
 *
 * O objetivo é atualizar e consolidar os dados antes de qualquer
 * transição irreversível para "completed".
 *
 * O evento permanece ativo após esta operação.
 */
export async function prepareClanGamesFinalization(
  eventId: number,
): Promise<PrepareClanGamesFinalizationResult> {
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new Error("eventId inválido.");
  }

  const event = findClanGamesEventById(eventId);

  if (!event) {
    throw new Error(`Evento de Clan Games ${eventId} não encontrado.`);
  }

  if (event.state !== "active") {
    throw new Error(
      `Evento de Clan Games ${eventId} não está ativo. Estado atual: ${event.state}.`,
    );
  }

  const collectedAt = new Date().toISOString();

  const collection = await collectClanGamesEvent(event, collectedAt);

  return {
    success: collection.errors === 0,

    eventId: event.id,
    clanTag: event.clan_tag,
    season: event.season,

    state: event.state,

    collectedAt: collection.collectedAt,

    totalMembers: collection.totalMembers,
    updatedMembers: collection.updated,
    failedMembers: collection.errors,

    totalPoints: collection.totalPoints,
  };
}

/**
 * ============================================================================
 * FINALIZAÇÃO
 * ============================================================================
 */

/**
 * Finaliza uma edição ativa dos Jogos do Clã.
 *
 * Importante:
 * esta função não executa uma nova consulta à Clash API.
 *
 * Portanto, antes da finalização automática definitiva, o lifecycle
 * deverá garantir que uma coleta final tenha sido executada.
 */
export async function finalizeClanGamesEvent(
  eventId: number,
): Promise<CompleteClanGamesResult> {
  /**
   * ----------------------------------------------------------
   * 1. Validação
   * ----------------------------------------------------------
   */

  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new Error("eventId inválido.");
  }

  const event = findClanGamesEventById(eventId);

  if (!event) {
    throw new Error(`Evento de Clan Games ${eventId} não encontrado.`);
  }

  if (event.state === "completed") {
    throw new Error(`Evento de Clan Games ${eventId} já está finalizado.`);
  }

  if (event.state !== "active") {
    throw new Error(
      `Evento de Clan Games ${eventId} não está ativo. Estado atual: ${event.state}.`,
    );
  }

  /**
   * ----------------------------------------------------------
   * 2. Consolida o total persistido
   * ----------------------------------------------------------
   */

  const totalPoints = refreshClanGamesEventTotal(event.id);

  /**
   * ----------------------------------------------------------
   * 3. Finaliza
   * ----------------------------------------------------------
   */

  const endedAt = new Date().toISOString();

  completeClanGamesEvent(event.id, endedAt);

  /**
   * ----------------------------------------------------------
   * 4. Confirma a transição
   * ----------------------------------------------------------
   */

  const completedEvent = findClanGamesEventById(event.id);

  if (!completedEvent) {
    throw new Error(
      `Não foi possível reler o evento ${event.id} após a finalização.`,
    );
  }

  if (completedEvent.state !== "completed") {
    throw new Error(`Não foi possível finalizar o evento ${event.id}.`);
  }

  return {
    success: true,

    eventId: completedEvent.id,
    clanTag: completedEvent.clan_tag,
    season: completedEvent.season,

    previousState: event.state,
    state: completedEvent.state,

    totalPoints,

    endedAt: completedEvent.ended_at ?? endedAt,
  };
}
