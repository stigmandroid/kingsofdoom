/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/evaluate-cwl-eligibility.ts
 *
 * Responsabilidade:
 * Avaliar a elegibilidade competitiva de jogadores para CWL
 * a partir das evidências dos últimos 30 dias.
 *
 * Funcionalidades:
 * - Valida atividade competitiva mínima
 * - Valida participação nos ataques disponíveis
 * - Valida média de estrelas
 * - Valida média de destruição
 * - Valida taxa de PT
 * - Explica individualmente cada critério
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 19/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Experimental
 * ==========================================================
 */

import type { CwlCompetitiveEvidence } from "./build-cwl-competitive-evidence";

export const CWL_ELIGIBILITY_RULES = {
  minimumAttacks: 12,
  minimumReliabilityRate: 0.9,
  minimumAverageStars: 2.6,
  minimumAverageDestruction: 90,
  minimumTripleRate: 0.8,
} as const;

export type CwlEligibilityStatus = "eligible" | "provisional" | "ineligible";

export type CwlEligibilityCriterion = {
  passed: boolean;
  value: number;
  required: number;
};

export type CwlEligibilityEvaluation = {
  playerTag: string;
  playerName: string | null;
  status: CwlEligibilityStatus;

  criteria: {
    activity: CwlEligibilityCriterion;
    reliability: CwlEligibilityCriterion;
    averageStars: CwlEligibilityCriterion;
    averageDestruction: CwlEligibilityCriterion;
    tripleRate: CwlEligibilityCriterion;
  };

  summary: {
    attacksUsed: number;
    attacksAvailable: number;
    attacksMissed: number;
    reliabilityRate: number;
    averageStars: number;
    averageDestruction: number;
    tripleRate: number;
  };

  failedCriteria: Array<keyof CwlEligibilityEvaluation["criteria"]>;
};

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

export function evaluateCwlEligibility(
  evidence: CwlCompetitiveEvidence,
): CwlEligibilityEvaluation {
  const attacksUsed = evidence.total.attacksUsed;
  const attacksAvailable = evidence.total.attacksAvailable;
  const attacksMissed = evidence.total.attacksMissed;

  const reliabilityRate = safeRate(attacksUsed, attacksAvailable);

  const totalStars = evidence.attacks.reduce(
    (sum, attack) => sum + attack.stars,
    0,
  );

  const totalDestruction = evidence.attacks.reduce(
    (sum, attack) => sum + attack.destruction,
    0,
  );

  const triples = evidence.attacks.filter(
    (attack) => attack.stars === 3,
  ).length;

  const averageStars = safeRate(totalStars, attacksUsed);

  const averageDestruction = safeRate(totalDestruction, attacksUsed);

  const tripleRate = safeRate(triples, attacksUsed);

  const criteria = {
    activity: {
      passed: attacksUsed >= CWL_ELIGIBILITY_RULES.minimumAttacks,
      value: attacksUsed,
      required: CWL_ELIGIBILITY_RULES.minimumAttacks,
    },

    reliability: {
      passed: reliabilityRate >= CWL_ELIGIBILITY_RULES.minimumReliabilityRate,
      value: reliabilityRate,
      required: CWL_ELIGIBILITY_RULES.minimumReliabilityRate,
    },

    averageStars: {
      passed: averageStars >= CWL_ELIGIBILITY_RULES.minimumAverageStars,
      value: averageStars,
      required: CWL_ELIGIBILITY_RULES.minimumAverageStars,
    },

    averageDestruction: {
      passed:
        averageDestruction >= CWL_ELIGIBILITY_RULES.minimumAverageDestruction,
      value: averageDestruction,
      required: CWL_ELIGIBILITY_RULES.minimumAverageDestruction,
    },

    tripleRate: {
      passed: tripleRate >= CWL_ELIGIBILITY_RULES.minimumTripleRate,
      value: tripleRate,
      required: CWL_ELIGIBILITY_RULES.minimumTripleRate,
    },
  };

  const failedCriteria = (
    Object.entries(criteria) as Array<
      [keyof typeof criteria, CwlEligibilityCriterion]
    >
  )
    .filter(([, criterion]) => !criterion.passed)
    .map(([criterion]) => criterion);

  let status: CwlEligibilityStatus;

  if (!criteria.activity.passed) {
    status = "provisional";
  } else if (failedCriteria.length > 0) {
    status = "ineligible";
  } else {
    status = "eligible";
  }

  return {
    playerTag: evidence.playerTag,
    playerName: evidence.playerName,
    status,

    criteria,

    summary: {
      attacksUsed,
      attacksAvailable,
      attacksMissed,
      reliabilityRate,
      averageStars,
      averageDestruction,
      tripleRate,
    },

    failedCriteria,
  };
}
