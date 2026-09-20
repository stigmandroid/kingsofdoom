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
  evaluateCwlEligibility,
  type CwlEligibilityEvaluation,
} from "./evaluate-cwl-eligibility";

export type CwlRankedPlayer = {
  rank: number;

  playerTag: string;
  playerName: string | null;

  eligibility: CwlEligibilityEvaluation;

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

/**
 * Ordenação competitiva v0.1.
 *
 * Não produz score composto.
 *
 * Os jogadores são comparados sequencialmente por:
 *
 * 1. taxa de triple;
 * 2. média de estrelas;
 * 3. média de destruição;
 * 4. confiabilidade no uso dos ataques;
 * 5. quantidade de ataques válidos na janela;
 * 6. tag como desempate determinístico.
 *
 * Essa ordem é deliberadamente explícita para que a classificação
 * permaneça auditável enquanto o Attack Context Engine evolui.
 */
function compareRankedPlayers(a: CwlRankedPlayer, b: CwlRankedPlayer): number {
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

    eligiblePlayers.push({
      rank: 0,

      playerTag: evidence.playerTag,
      playerName: evidence.playerName,

      eligibility,

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
