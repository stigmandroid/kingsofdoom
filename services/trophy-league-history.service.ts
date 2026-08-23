/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/trophy-league-history.service.ts
 *
 * Responsabilidade:
 * Transformar os snapshots persistidos da Liga de Troféus
 * em uma linha do tempo interpretada do jogador.
 *
 * O serviço:
 *
 * • recupera os snapshots em ordem cronológica;
 * • separa corretamente mudanças de temporada;
 * • calcula variações entre capturas consecutivas;
 * • classifica movimentações observadas;
 * • diferencia possíveis ataques, possíveis defesas e
 *   movimentos agregados;
 * • preserva a distinção entre dado observado e batalha
 *   individual confirmada.
 *
 * Importante:
 *
 * Uma variação entre snapshots representa somente o saldo
 * observado no intervalo.
 *
 * Exemplo:
 *
 * snapshot A: 947
 * snapshot B: 968
 *
 * saldo observado: +21
 *
 * Isso pode ser compatível com um ataque individual de
 * +21, porém não prova que apenas uma batalha ocorreu entre
 * as duas capturas.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import {
  calculateTrophyLeagueDelta,
  type TrophyDeltaDirection,
} from "@/lib/trophy-league/trophy-delta";

import {
  classifyObservedTrophyEvent,
  type TrophyObservedEventConfidence,
  type TrophyObservedEventType,
} from "@/lib/trophy-league/observed-event";

import type { TrophyBattleStars } from "@/lib/trophy-league/battle-result";

import {
  getTrophyLeaguePlayerTimeline,
  type TrophyLeagueSnapshot,
} from "@/repositories/trophy-league.repository";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

/**
 * Um ponto individual da linha do tempo.
 *
 * O ponto preserva tanto os dados brutos do snapshot quanto
 * a interpretação observada em relação à captura anterior.
 */
export type TrophyLeagueTimelinePoint = {
  snapshotId: number;

  capturedAt: string;

  trophies: number;

  /**
   * Diferença líquida em relação ao snapshot anterior.
   *
   * null:
   * primeiro snapshot conhecido ou início de nova temporada.
   */
  delta: number | null;

  absoluteDelta: number | null;

  direction: TrophyDeltaDirection | null;

  /**
   * Classificação da movimentação observada.
   */
  eventType: TrophyObservedEventType | null;

  /**
   * Grau de confiança da interpretação.
   */
  confidence: TrophyObservedEventConfidence | null;

  /**
   * Estrelas inferidas somente quando a movimentação é
   * compatível com um possível ataque individual.
   */
  inferredStars: TrophyBattleStars | null;

  /**
   * Contexto competitivo.
   */
  leagueTierName: string | null;

  leagueSeasonId: number | null;

  leagueGroupTag: string | null;
};

/**
 * Resumo completo do histórico observado do jogador.
 */
export type TrophyLeaguePlayerHistory = {
  playerTag: string;

  playerName: string | null;

  totalSnapshots: number;

  firstCapturedAt: string | null;

  lastCapturedAt: string | null;

  initialTrophies: number | null;

  currentTrophies: number | null;

  observedNetChange: number;

  /**
   * Quantidade de intervalos com saldo positivo.
   */
  gainsObserved: number;

  /**
   * Quantidade de intervalos com saldo negativo.
   */
  lossesObserved: number;

  /**
   * Quantidade de intervalos sem alteração líquida.
   */
  unchangedObserved: number;

  /**
   * Movimentações compatíveis com um possível ataque
   * individual.
   */
  possibleAttacks: number;

  /**
   * Movimentações compatíveis com uma possível defesa ou
   * saldo negativo de batalha.
   */
  possibleDefenses: number;

  /**
   * Intervalos cuja variação ultrapassa o limite individual
   * observado de 40 pontos.
   */
  aggregateMovements: number;

  timeline: TrophyLeagueTimelinePoint[];
};

/**
 * ==========================================================
 * CRIAÇÃO DE PONTO-BASE
 * ==========================================================
 */

/**
 * Cria um ponto sem delta.
 *
 * Utilizado:
 *
 * • no primeiro snapshot conhecido;
 * • no primeiro snapshot de uma nova temporada.
 *
 * Dessa forma evitamos interpretar resets e mudanças de
 * temporada como batalhas.
 */
function createBaselinePoint(
  snapshot: TrophyLeagueSnapshot,
): TrophyLeagueTimelinePoint {
  return {
    snapshotId: snapshot.id,

    capturedAt: snapshot.capturedAt,

    trophies: snapshot.trophies,

    delta: null,

    absoluteDelta: null,

    direction: null,

    eventType: null,

    confidence: null,

    inferredStars: null,

    leagueTierName: snapshot.leagueTierName,

    leagueSeasonId: snapshot.leagueSeasonId,

    leagueGroupTag: snapshot.leagueGroupTag,
  };
}

/**
 * ==========================================================
 * MAPEAMENTO DA TIMELINE
 * ==========================================================
 */

/**
 * Converte os snapshots persistidos em uma linha do tempo
 * contendo:
 *
 * • delta observado;
 * • direção;
 * • classificação do movimento;
 * • estrelas inferidas quando aplicável.
 */
function buildTimeline(
  snapshots: TrophyLeagueSnapshot[],
): TrophyLeagueTimelinePoint[] {
  return snapshots.map((snapshot, index): TrophyLeagueTimelinePoint => {
    /**
     * ====================================================
     * PRIMEIRO SNAPSHOT
     * ====================================================
     */

    if (index === 0) {
      return createBaselinePoint(snapshot);
    }

    const previousSnapshot = snapshots[index - 1];

    /**
     * ====================================================
     * TROCA DE TEMPORADA
     * ====================================================
     *
     * Não calculamos delta atravessando temporadas.
     *
     * Resets, promoções, rebaixamentos e mudanças de grupo
     * podem alterar os valores sem representar batalha.
     */

    const isNewSeason =
      previousSnapshot.leagueSeasonId !== snapshot.leagueSeasonId;

    if (isNewSeason) {
      return createBaselinePoint(snapshot);
    }

    /**
     * ====================================================
     * DELTA OBSERVADO
     * ====================================================
     */

    const delta = calculateTrophyLeagueDelta({
      previousTrophies: previousSnapshot.trophies,

      currentTrophies: snapshot.trophies,
    });

    /**
     * ====================================================
     * CLASSIFICAÇÃO
     * ====================================================
     */

    const observedEvent = classifyObservedTrophyEvent(delta.delta);

    return {
      snapshotId: snapshot.id,

      capturedAt: snapshot.capturedAt,

      trophies: snapshot.trophies,

      delta: delta.delta,

      absoluteDelta: delta.absoluteDelta,

      direction: delta.direction,

      eventType: observedEvent.type,

      confidence: observedEvent.confidence,

      inferredStars: observedEvent.inferredStars,

      leagueTierName: snapshot.leagueTierName,

      leagueSeasonId: snapshot.leagueSeasonId,

      leagueGroupTag: snapshot.leagueGroupTag,
    };
  });
}

/**
 * ==========================================================
 * HISTÓRICO DO JOGADOR
 * ==========================================================
 */

/**
 * Recupera e interpreta todo o histórico observado da
 * Liga de Troféus de um jogador.
 */
export function getTrophyLeaguePlayerHistory(
  playerTag: string,
): TrophyLeaguePlayerHistory {
  const snapshots = getTrophyLeaguePlayerTimeline(playerTag);

  /**
   * ========================================================
   * SEM HISTÓRICO
   * ========================================================
   */

  if (snapshots.length === 0) {
    return {
      playerTag,

      playerName: null,

      totalSnapshots: 0,

      firstCapturedAt: null,

      lastCapturedAt: null,

      initialTrophies: null,

      currentTrophies: null,

      observedNetChange: 0,

      gainsObserved: 0,

      lossesObserved: 0,

      unchangedObserved: 0,

      possibleAttacks: 0,

      possibleDefenses: 0,

      aggregateMovements: 0,

      timeline: [],
    };
  }

  /**
   * ========================================================
   * TIMELINE
   * ========================================================
   */

  const timeline = buildTimeline(snapshots);

  const firstSnapshot = snapshots[0];

  const lastSnapshot = snapshots[snapshots.length - 1];

  /**
   * ========================================================
   * RESUMO GERAL
   * ========================================================
   */

  const observedNetChange = lastSnapshot.trophies - firstSnapshot.trophies;

  const gainsObserved = timeline.filter(
    (point) => point.direction === "gain",
  ).length;

  const lossesObserved = timeline.filter(
    (point) => point.direction === "loss",
  ).length;

  const unchangedObserved = timeline.filter(
    (point) => point.direction === "unchanged",
  ).length;

  /**
   * ========================================================
   * CLASSIFICAÇÕES OBSERVADAS
   * ========================================================
   */

  const possibleAttacks = timeline.filter(
    (point) => point.eventType === "possible-attack",
  ).length;

  const possibleDefenses = timeline.filter(
    (point) => point.eventType === "possible-defense",
  ).length;

  const aggregateMovements = timeline.filter(
    (point) => point.eventType === "aggregate",
  ).length;

  /**
   * ========================================================
   * RESULTADO
   * ========================================================
   */

  return {
    playerTag: firstSnapshot.playerTag,

    playerName: lastSnapshot.playerName,

    totalSnapshots: snapshots.length,

    firstCapturedAt: firstSnapshot.capturedAt,

    lastCapturedAt: lastSnapshot.capturedAt,

    initialTrophies: firstSnapshot.trophies,

    currentTrophies: lastSnapshot.trophies,

    observedNetChange,

    gainsObserved,

    lossesObserved,

    unchangedObserved,

    possibleAttacks,

    possibleDefenses,

    aggregateMovements,

    timeline,
  };
}
