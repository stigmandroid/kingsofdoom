/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/aggregate-cwl-player-performance.ts
 *
 * Responsabilidade:
 * Agregar a evidência competitiva contextual dos ataques
 * de cada jogador sem produzir ranking ou pontuação.
 *
 * Princípios:
 *
 * - preservar separadamente resultado e contexto;
 * - não atribuir pesos arbitrários;
 * - não transformar contexto em bônus ou penalidade;
 * - manter CWL e guerra normal identificáveis;
 * - produzir evidência explicável para a camada de ranking.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 21/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import type {
  CompetitiveAttackEvidence,
  CwlCompetitiveEvidence,
} from "./build-cwl-competitive-evidence";

export type CwlPlayerPerformanceAggregate = {
  playerTag: string;
  playerName: string | null;

  activity: {
    attacksUsed: number;
    attacksAvailable: number;
    attacksMissed: number;
    reliabilityRate: number;
  };

  execution: {
    stars: number;
    triples: number;

    tripleRate: number;
    averageStars: number;
    averageDestruction: number;
  };

  sources: {
    cwl: {
      attacks: number;
    };

    regularWar: {
      attacks: number;
    };
  };

  matchup: {
    townHall: {
      harder: number;
      equivalent: number;
      easierConstrained: number;
      easierOptional: number;
    };

    mapPosition: {
      higherTarget: number;
      similarPosition: number;
      lowerTarget: number;
    };
  };

  contextualExecution: {
    harder: {
      attacks: number;
      triples: number;
      starsAdded: number;
    };

    equivalent: {
      attacks: number;
      triples: number;
      starsAdded: number;
    };

    easierConstrained: {
      attacks: number;
      triples: number;
      starsAdded: number;
    };

    easierOptional: {
      attacks: number;
      triples: number;
      starsAdded: number;
    };
  };

  closure: {
    firstAttempt: number;
    cleanup: number;
    alreadyClosed: number;

    basesClosed: number;
    recoveredPreviousFailures: number;
  };

  contribution: {
    starsAdded: number;
    destructionImprovement: number;

    attacksAddingStars: number;
    attacksImprovingDestruction: number;

    attacksOnAlreadyClosedTargets: number;
    avoidableAlreadyClosedTargetAttacks: number;
  };
};

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return (numerator / denominator) * 100;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function countAttacks(
  attacks: CompetitiveAttackEvidence[],
  predicate: (attack: CompetitiveAttackEvidence) => boolean,
): number {
  return attacks.filter(predicate).length;
}

function aggregateContextualExecution(
  attacks: CompetitiveAttackEvidence[],
  classification:
    | "harder"
    | "equivalent"
    | "easier_constrained"
    | "easier_optional",
): {
  attacks: number;
  triples: number;
  starsAdded: number;
} {
  const contextualAttacks = attacks.filter(
    (attack) => attack.evaluation.difficulty.classification === classification,
  );

  return {
    attacks: contextualAttacks.length,

    triples: contextualAttacks.filter(
      (attack) => attack.evaluation.result.isTriple,
    ).length,

    starsAdded: contextualAttacks.reduce(
      (total, attack) => total + attack.evaluation.impact.starsAdded,
      0,
    ),
  };
}

export function aggregateCwlPlayerPerformance(
  evidence: CwlCompetitiveEvidence,
): CwlPlayerPerformanceAggregate {
  const attacks = evidence.attacks;

  const triples = countAttacks(
    attacks,
    (attack) => attack.evaluation.result.isTriple,
  );

  const stars = attacks.reduce(
    (total, attack) => total + attack.evaluation.result.stars,
    0,
  );

  return {
    playerTag: evidence.playerTag,
    playerName: evidence.playerName,

    activity: {
      attacksUsed: evidence.total.attacksUsed,
      attacksAvailable: evidence.total.attacksAvailable,
      attacksMissed: evidence.total.attacksMissed,

      reliabilityRate: percentage(
        evidence.total.attacksUsed,
        evidence.total.attacksAvailable,
      ),
    },

    execution: {
      stars,
      triples,

      tripleRate: percentage(triples, attacks.length),

      averageStars: average(
        attacks.map((attack) => attack.evaluation.result.stars),
      ),

      averageDestruction: average(
        attacks.map((attack) => attack.evaluation.result.destruction),
      ),
    },

    sources: {
      cwl: {
        attacks: countAttacks(attacks, (attack) => attack.source === "cwl"),
      },

      regularWar: {
        attacks: countAttacks(
          attacks,
          (attack) => attack.source === "regular_war",
        ),
      },
    },

    matchup: {
      townHall: {
        harder: countAttacks(
          attacks,
          (attack) => attack.evaluation.difficulty.classification === "harder",
        ),

        equivalent: countAttacks(
          attacks,
          (attack) =>
            attack.evaluation.difficulty.classification === "equivalent",
        ),

        easierConstrained: countAttacks(
          attacks,
          (attack) =>
            attack.evaluation.difficulty.classification ===
            "easier_constrained",
        ),

        easierOptional: countAttacks(
          attacks,
          (attack) =>
            attack.evaluation.difficulty.classification === "easier_optional",
        ),
      },

      mapPosition: {
        higherTarget: countAttacks(
          attacks,
          (attack) =>
            attack.evaluation.difficulty.mapPositionContext === "higher_target",
        ),

        similarPosition: countAttacks(
          attacks,
          (attack) =>
            attack.evaluation.difficulty.mapPositionContext ===
            "similar_position",
        ),

        lowerTarget: countAttacks(
          attacks,
          (attack) =>
            attack.evaluation.difficulty.mapPositionContext === "lower_target",
        ),
      },
    },

    contextualExecution: {
      harder: aggregateContextualExecution(attacks, "harder"),

      equivalent: aggregateContextualExecution(attacks, "equivalent"),

      easierConstrained: aggregateContextualExecution(
        attacks,
        "easier_constrained",
      ),

      easierOptional: aggregateContextualExecution(attacks, "easier_optional"),
    },

    closure: {
      firstAttempt: countAttacks(
        attacks,
        (attack) =>
          attack.evaluation.closure.classification === "first_attempt",
      ),

      cleanup: countAttacks(
        attacks,
        (attack) => attack.evaluation.closure.classification === "cleanup",
      ),

      alreadyClosed: countAttacks(
        attacks,
        (attack) =>
          attack.evaluation.closure.classification === "already_closed",
      ),

      basesClosed: countAttacks(
        attacks,
        (attack) => attack.evaluation.closure.closedByCurrentAttack,
      ),

      recoveredPreviousFailures: countAttacks(
        attacks,
        (attack) => attack.evaluation.closure.recoveredPreviousFailure,
      ),
    },

    contribution: {
      starsAdded: attacks.reduce(
        (total, attack) => total + attack.evaluation.impact.starsAdded,
        0,
      ),

      destructionImprovement: attacks.reduce(
        (total, attack) =>
          total + attack.evaluation.impact.destructionImprovement,
        0,
      ),

      attacksAddingStars: countAttacks(
        attacks,
        (attack) => attack.evaluation.impact.starsAdded > 0,
      ),

      attacksImprovingDestruction: countAttacks(
        attacks,
        (attack) => attack.evaluation.impact.destructionImprovement > 0,
      ),

      attacksOnAlreadyClosedTargets: countAttacks(
        attacks,
        (attack) => attack.evaluation.impact.attackedAlreadyClosedTarget,
      ),

      avoidableAlreadyClosedTargetAttacks: countAttacks(
        attacks,
        (attack) =>
          attack.evaluation.impact.attackedAlreadyClosedTarget &&
          attack.evaluation.battlefield.openTargets > 0,
      ),
    },
  };
}
