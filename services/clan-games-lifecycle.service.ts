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
  registerClanGamesFinalizationObservation,
} from "@/repositories/clan-games.repository";

import { collectClanGamesEvent } from "@/services/clan-games-collector.service";

/**
 * ==========================================================
 * POLÍTICA DE FINALIZAÇÃO
 * ==========================================================
 *
 * Uma edição somente poderá ser considerada estável quando
 * houver múltiplas observações completas e suficientemente
 * espaçadas.
 */

const FINALIZATION_MIN_STABLE_OBSERVATIONS = 3;

const FINALIZATION_MIN_INTERVAL_MS = 10 * 60 * 1000;

export interface ClanGamesFinalizationReadiness {
  ready: boolean;

  reason: string | null;

  attempts: number;
  stableCount: number;

  lastTotal: number | null;
  lastObservedAt: string | null;

  remainingStableObservations: number;
}

export function getClanGamesFinalizationReadiness(
  eventId: number,
): ClanGamesFinalizationReadiness {
  const event = findClanGamesEventById(eventId);

  if (!event) {
    throw new Error(`Evento de Clan Games ${eventId} não encontrado.`);
  }

  if (event.state === "completed") {
    return {
      ready: false,
      reason: "O evento já foi finalizado.",

      attempts: event.finalization_attempts,
      stableCount: event.finalization_stable_count,

      lastTotal: event.finalization_last_total,
      lastObservedAt: event.finalization_last_observed_at,

      remainingStableObservations: 0,
    };
  }

  const remainingStableObservations = Math.max(
    0,
    FINALIZATION_MIN_STABLE_OBSERVATIONS - event.finalization_stable_count,
  );

  if (event.finalization_stable_count < FINALIZATION_MIN_STABLE_OBSERVATIONS) {
    return {
      ready: false,

      reason:
        remainingStableObservations === 1
          ? "Aguardando mais uma observação estável."
          : `Aguardando mais ${remainingStableObservations} observações estáveis.`,

      attempts: event.finalization_attempts,
      stableCount: event.finalization_stable_count,

      lastTotal: event.finalization_last_total,
      lastObservedAt: event.finalization_last_observed_at,

      remainingStableObservations,
    };
  }

  return {
    ready: true,
    reason: null,

    attempts: event.finalization_attempts,
    stableCount: event.finalization_stable_count,

    lastTotal: event.finalization_last_total,
    lastObservedAt: event.finalization_last_observed_at,

    remainingStableObservations: 0,
  };
}

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
  finalizationAttempts: number;
  finalizationStableCount: number;
  finalizationLastTotal: number;
  finalizationStartedAt: string;
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

  /**
   * ==========================================================
   * INTERVALO MÍNIMO ENTRE OBSERVAÇÕES
   * ==========================================================
   *
   * Evita que várias chamadas feitas em poucos segundos sejam
   * interpretadas como confirmações independentes do resultado.
   */
  if (event.finalization_last_observed_at) {
    const lastObservedAt = Date.parse(event.finalization_last_observed_at);

    const currentObservationAt = Date.parse(collectedAt);

    if (
      !Number.isNaN(lastObservedAt) &&
      currentObservationAt - lastObservedAt < FINALIZATION_MIN_INTERVAL_MS
    ) {
      const remainingMs =
        FINALIZATION_MIN_INTERVAL_MS - (currentObservationAt - lastObservedAt);

      const remainingSeconds = Math.ceil(remainingMs / 1000);

      throw new Error(
        `Nova observação disponível em aproximadamente ${remainingSeconds} segundos.`,
      );
    }
  }

  const collection = await collectClanGamesEvent(event, collectedAt);

  /**
   * Não registramos a observação como válida quando houve
   * falha na coleta de algum participante.
   *
   * Uma coleta parcial não deve aumentar o contador de
   * estabilidade da finalização.
   */
  if (collection.errors > 0) {
    return {
      success: false,

      eventId: event.id,
      clanTag: event.clan_tag,
      season: event.season,

      state: event.state,

      collectedAt: collection.collectedAt,

      totalMembers: collection.totalMembers,
      updatedMembers: collection.updated,
      failedMembers: collection.errors,

      totalPoints: collection.totalPoints,

      finalizationAttempts: event.finalization_attempts,
      finalizationStableCount: event.finalization_stable_count,
      finalizationLastTotal:
        event.finalization_last_total ?? collection.totalPoints,
      finalizationStartedAt: event.finalization_started_at ?? collectedAt,
    };
  }

  const reconciliation = registerClanGamesFinalizationObservation(
    event.id,
    collection.totalPoints,
    collectedAt,
  );

  return {
    success: true,

    eventId: event.id,
    clanTag: event.clan_tag,
    season: event.season,

    state: event.state,

    collectedAt: collection.collectedAt,

    totalMembers: collection.totalMembers,
    updatedMembers: collection.updated,
    failedMembers: collection.errors,

    totalPoints: collection.totalPoints,

    finalizationAttempts: reconciliation.attempts,
    finalizationStableCount: reconciliation.stableCount,
    finalizationLastTotal: reconciliation.lastTotal,
    finalizationStartedAt: reconciliation.startedAt,
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

  const readiness = getClanGamesFinalizationReadiness(eventId);

  if (!readiness.ready) {
    throw new Error(
      readiness.reason ?? "O evento ainda não está pronto para finalização.",
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
