/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/build-cwl-ranking-explanation.ts
 *
 * Responsabilidade:
 * Transformar os dados comparativos do ranking da CWL em
 * evidências objetivas que expliquem a posição do jogador.
 *
 * Funcionalidades:
 * - compara jogadores imediatamente acima e abaixo;
 * - identifica diferenças relevantes de desempenho;
 * - evita explicações genéricas;
 * - retorna evidências estruturadas para a interface.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/10/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CwlRankedPlayer } from "./rank-cwl-players";

import {
  getRankingNeighbors,
  type CwlRankingComparison,
} from "./explain-cwl-ranking";

export type CwlRankingEvidence = {
  metric: string;
  playerValue: string;
  comparisonValue: string;
  difference: string;
  direction: "advantage" | "disadvantage" | "neutral";
};

export type CwlRankingExplanation = {
  target: CwlRankingComparison;

  above: CwlRankingComparison[];

  below: CwlRankingComparison[];

  evidence: CwlRankingEvidence[];
};

function percentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function difference(playerValue: number, comparisonValue: number): string {
  const value = (playerValue - comparisonValue) * 100;

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)} p.p.`;
}

function compareRate(
  metric: string,
  playerValue: number,
  comparisonValue: number,
  playerLabel: string,
): CwlRankingEvidence {
  const delta = playerValue - comparisonValue;

  return {
    metric,

    playerValue: percentage(playerValue),

    comparisonValue: `${percentage(comparisonValue)} (${playerLabel})`,

    difference: difference(playerValue, comparisonValue),

    direction:
      Math.abs(delta) < 0.0001
        ? "neutral"
        : delta > 0
          ? "advantage"
          : "disadvantage",
  };
}

function buildEvidence(
  target: CwlRankingComparison,
  comparison: CwlRankingComparison,
): CwlRankingEvidence[] {
  const player = target.player;
  const other = comparison.player;

  return [
    compareRate(
      "Taxa de triplas",
      target.metrics.comparableTripleRate,
      comparison.metrics.comparableTripleRate,
      other.playerName ?? other.playerTag,
    ),

    compareRate(
      "Taxa de triplas em recuperação",
      target.metrics.recoveryTripleRate,
      comparison.metrics.recoveryTripleRate,
      other.playerName ?? other.playerTag,
    ),

    compareRate(
      "Taxa de triplas contra alvos superiores",
      target.metrics.higherTargetTripleRate,
      comparison.metrics.higherTargetTripleRate,
      other.playerName ?? other.playerTag,
    ),

    compareRate(
      "Taxa de triplas contra posições semelhantes",
      target.metrics.similarPositionTripleRate,
      comparison.metrics.similarPositionTripleRate,
      other.playerName ?? other.playerTag,
    ),

    compareRate(
      "Taxa de triplas contra alvos inferiores",
      target.metrics.lowerTargetTripleRate,
      comparison.metrics.lowerTargetTripleRate,
      other.playerName ?? other.playerTag,
    ),

    {
      metric: "Média de estrelas",
      playerValue: target.metrics.averageStars.toFixed(2),
      comparisonValue: `${comparison.metrics.averageStars.toFixed(2)} (${other.playerName})`,
      difference: (
        target.metrics.averageStars - comparison.metrics.averageStars
      ).toFixed(2),
      direction:
        target.metrics.averageStars === comparison.metrics.averageStars
          ? "neutral"
          : target.metrics.averageStars > comparison.metrics.averageStars
            ? "advantage"
            : "disadvantage",
    },

    {
      metric: "Média de destruição",
      playerValue: `${target.metrics.averageDestruction.toFixed(1)}%`,
      comparisonValue: `${comparison.metrics.averageDestruction.toFixed(1)}% (${other.playerName})`,
      difference: `${(
        target.metrics.averageDestruction -
        comparison.metrics.averageDestruction
      ).toFixed(1)} p.p.`,
      direction:
        target.metrics.averageDestruction ===
        comparison.metrics.averageDestruction
          ? "neutral"
          : target.metrics.averageDestruction >
              comparison.metrics.averageDestruction
            ? "advantage"
            : "disadvantage",
    },

    {
      metric: "Confiabilidade",
      playerValue: percentage(target.metrics.reliabilityRate),
      comparisonValue: `${percentage(comparison.metrics.reliabilityRate)} (${other.playerName})`,
      difference: difference(
        target.metrics.reliabilityRate,
        comparison.metrics.reliabilityRate,
      ),
      direction:
        target.metrics.reliabilityRate === comparison.metrics.reliabilityRate
          ? "neutral"
          : target.metrics.reliabilityRate > comparison.metrics.reliabilityRate
            ? "advantage"
            : "disadvantage",
    },
  ];
}

/**
 * Constrói a explicação completa de uma posição do ranking.
 */
export function buildCwlRankingExplanation(
  players: CwlRankedPlayer[],
  target: CwlRankedPlayer,
): CwlRankingExplanation {
  const neighbors = getRankingNeighbors(players, target.rank);

  const targetComparison = {
    position: target.rank,
    player: target,
    metrics: {
      comparableTripleRate: target.contextualMetrics.comparableTripleRate,

      recoveryTripleRate: target.contextualMetrics.recoveryTripleRate,

      higherTargetTripleRate:
        target.contextualMetrics.mapPosition.higherTargetTriples /
        Math.max(target.contextualMetrics.mapPosition.higherTargetAttacks, 1),

      similarPositionTripleRate:
        target.contextualMetrics.mapPosition.similarPositionTriples /
        Math.max(
          target.contextualMetrics.mapPosition.similarPositionAttacks,
          1,
        ),

      lowerTargetTripleRate:
        target.contextualMetrics.mapPosition.lowerTargetTriples /
        Math.max(target.contextualMetrics.mapPosition.lowerTargetAttacks, 1),

      averageStars: target.metrics.averageStars,

      averageDestruction: target.metrics.averageDestruction,

      reliabilityRate: target.metrics.reliabilityRate,

      attacksUsed: target.metrics.attacksUsed,
    },
  } satisfies CwlRankingComparison;

  const above = neighbors.filter(
    (comparison) => comparison.position < target.rank,
  );

  const below = neighbors.filter(
    (comparison) => comparison.position > target.rank,
  );

  const evidence = neighbors.flatMap((comparison) =>
    buildEvidence(targetComparison, comparison),
  );

  return {
    target: targetComparison,
    above,
    below,
    evidence,
  };
}
