/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/rank-cwl-players.ts
 *
 * Responsabilidade:
 * Classificar jogadores elegíveis para composição competitiva
 * da CWL sem alterar as regras de elegibilidade.
 *
 * Princípios:
 *
 * - elegibilidade sempre acontece antes da classificação;
 * - somente jogadores elegíveis entram no ranking competitivo;
 * - não existe compensação entre critérios de elegibilidade;
 * - a classificação v0.1 utiliza métricas objetivas;
 * - não existe score ponderado arbitrário nesta versão;
 * - contexto de ataque será incorporado progressivamente;
 * - associação atual a K.O.D. ou K.O.D.rec não influencia posição;
 * - liderança mantém a decisão final sobre a escalação.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import type { CwlCompetitiveEvidence } from "./build-cwl-competitive-evidence";

import {
  aggregateCwlPlayerPerformance,
  type CwlPlayerPerformanceAggregate,
} from "./aggregate-cwl-player-performance";

import {
  evaluateCwlEligibility,
  type CwlEligibilityEvaluation,
} from "./evaluate-cwl-eligibility";

export type CwlRankedPlayer = {
  rank: number;

  playerTag: string;
  playerName: string | null;

  eligibility: CwlEligibilityEvaluation;

  performance: CwlPlayerPerformanceAggregate;

  contextualMetrics: {
    comparableAttacks: number;
    comparableTriples: number;
    comparableTripleRate: number;

    optionalEasyAttacks: number;
    optionalEasyTriples: number;

    starsAdded: number;
    starsAddedPerAttack: number;

    basesClosed: number;
    avoidableAlreadyClosedTargetAttacks: number;
  };

  metrics: {
    attacksUsed: number;
    attacksAvailable: number;
    attacksMissed: number;

    reliabilityRate: number;

    averageStars: number;
    averageDestruction: number;

    triples: number;
    tripleRate: number;
  };
};

function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

function calculateMetrics(
  evidence: CwlCompetitiveEvidence,
): CwlRankedPlayer["metrics"] {
  const attacks = evidence.attacks;

  const attacksUsed = evidence.total.attacksUsed;
  const attacksAvailable = evidence.total.attacksAvailable;
  const attacksMissed = evidence.total.attacksMissed;

  const totalStars = attacks.reduce((sum, attack) => sum + attack.stars, 0);

  const totalDestruction = attacks.reduce(
    (sum, attack) => sum + attack.destruction,
    0,
  );

  const triples = attacks.filter((attack) => attack.stars === 3).length;

  return {
    attacksUsed,
    attacksAvailable,
    attacksMissed,

    reliabilityRate: safeDivide(attacksUsed, attacksAvailable),

    averageStars: safeDivide(totalStars, attacksUsed),

    averageDestruction: safeDivide(totalDestruction, attacksUsed),

    triples,

    tripleRate: safeDivide(triples, attacksUsed),
  };
}

function calculateContextualMetrics(
  performance: CwlPlayerPerformanceAggregate,
): CwlRankedPlayer["contextualMetrics"] {
  const comparableAttacks =
    performance.contextualExecution.harder.attacks +
    performance.contextualExecution.equivalent.attacks +
    performance.contextualExecution.easierConstrained.attacks;

  const comparableTriples =
    performance.contextualExecution.harder.triples +
    performance.contextualExecution.equivalent.triples +
    performance.contextualExecution.easierConstrained.triples;

  return {
    comparableAttacks,
    comparableTriples,

    comparableTripleRate: safeDivide(comparableTriples, comparableAttacks),

    optionalEasyAttacks: performance.contextualExecution.easierOptional.attacks,

    optionalEasyTriples: performance.contextualExecution.easierOptional.triples,

    starsAdded: performance.contribution.starsAdded,

    starsAddedPerAttack: safeDivide(
      performance.contribution.starsAdded,
      performance.activity.attacksUsed,
    ),

    basesClosed: performance.closure.basesClosed,

    avoidableAlreadyClosedTargetAttacks:
      performance.contribution.avoidableAlreadyClosedTargetAttacks,
  };
}

function compareRankedPlayers(a: CwlRankedPlayer, b: CwlRankedPlayer): number {
  /**
   * Ranking competitivo contextual v0.2.
   *
   * Ordem:
   *
   * 1. taxa de PT em ataques competitivamente comparáveis;
   * 2. contribuição média de estrelas por ataque;
   * 3. quantidade de bases efetivamente fechadas;
   * 4. menor quantidade de ataques evitáveis em alvos já fechados;
   * 5. taxa bruta de PT;
   * 6. média de estrelas;
   * 7. média de destruição;
   * 8. confiabilidade no uso dos ataques;
   * 9. quantidade de ataques válidos;
   * 10. tag como desempate determinístico.
   *
   * Ataques "easier_optional" permanecem registrados e visíveis,
   * mas não aumentam a taxa de PT contextual comparável.
   */

  if (
    a.contextualMetrics.comparableTripleRate !==
    b.contextualMetrics.comparableTripleRate
  ) {
    return (
      b.contextualMetrics.comparableTripleRate -
      a.contextualMetrics.comparableTripleRate
    );
  }

  if (
    a.contextualMetrics.starsAddedPerAttack !==
    b.contextualMetrics.starsAddedPerAttack
  ) {
    return (
      b.contextualMetrics.starsAddedPerAttack -
      a.contextualMetrics.starsAddedPerAttack
    );
  }

  if (a.contextualMetrics.basesClosed !== b.contextualMetrics.basesClosed) {
    return b.contextualMetrics.basesClosed - a.contextualMetrics.basesClosed;
  }

  if (
    a.contextualMetrics.avoidableAlreadyClosedTargetAttacks !==
    b.contextualMetrics.avoidableAlreadyClosedTargetAttacks
  ) {
    return (
      a.contextualMetrics.avoidableAlreadyClosedTargetAttacks -
      b.contextualMetrics.avoidableAlreadyClosedTargetAttacks
    );
  }

  if (a.metrics.tripleRate !== b.metrics.tripleRate) {
    return b.metrics.tripleRate - a.metrics.tripleRate;
  }

  if (a.metrics.averageStars !== b.metrics.averageStars) {
    return b.metrics.averageStars - a.metrics.averageStars;
  }

  if (a.metrics.averageDestruction !== b.metrics.averageDestruction) {
    return b.metrics.averageDestruction - a.metrics.averageDestruction;
  }

  if (a.metrics.reliabilityRate !== b.metrics.reliabilityRate) {
    return b.metrics.reliabilityRate - a.metrics.reliabilityRate;
  }

  if (a.metrics.attacksUsed !== b.metrics.attacksUsed) {
    return b.metrics.attacksUsed - a.metrics.attacksUsed;
  }

  return a.playerTag.localeCompare(b.playerTag);
}

/**
 * Recebe todas as evidências competitivas da janela e devolve
 * exclusivamente os jogadores aprovados pelos gates de elegibilidade.
 */
export function rankCwlPlayers(
  evidences: CwlCompetitiveEvidence[],
): CwlRankedPlayer[] {
  const eligiblePlayers: CwlRankedPlayer[] = [];

  for (const evidence of evidences) {
    const eligibility = evaluateCwlEligibility(evidence);

    if (eligibility.status !== "eligible") {
      continue;
    }

    const performance = aggregateCwlPlayerPerformance(evidence);

    const contextualMetrics = calculateContextualMetrics(performance);

    eligiblePlayers.push({
      rank: 0,

      playerTag: evidence.playerTag,
      playerName: evidence.playerName,

      eligibility,

      performance,

      contextualMetrics,

      metrics: calculateMetrics(evidence),
    });
  }

  eligiblePlayers.sort(compareRankedPlayers);

  return eligiblePlayers.map(
    (player, index): CwlRankedPlayer => ({
      ...player,
      rank: index + 1,
    }),
  );
}
