/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/explain-cwl-ranking.ts
 *
 * Responsabilidade:
 * Gerar a base comparativa utilizada para explicar a
 * classificação competitiva de cada jogador na CWL.
 *
 * Funcionalidades:
 * - identifica os jogadores imediatamente acima e abaixo;
 * - compara métricas objetivas de desempenho;
 * - compara desempenho contra alvos de posições diferentes;
 * - expõe dados para justificar a posição no ranking;
 * - mantém a explicação baseada em evidências competitivas.
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

export type CwlRankingComparison = {
  position: number;
  player: CwlRankedPlayer;

  metrics: {
    comparableTripleRate: number;
    recoveryTripleRate: number;

    higherTargetTripleRate: number;
    similarPositionTripleRate: number;
    lowerTargetTripleRate: number;

    averageStars: number;
    averageDestruction: number;
    reliabilityRate: number;

    attacksUsed: number;
  };
};

function safeRate(triples: number, attacks: number): number {
  return attacks > 0 ? triples / attacks : 0;
}

function createComparison(player: CwlRankedPlayer): CwlRankingComparison {
  const contextual = player.contextualMetrics;
  const mapPosition = contextual.mapPosition;

  return {
    position: player.rank,
    player,

    metrics: {
      comparableTripleRate: contextual.comparableTripleRate,

      recoveryTripleRate: contextual.recoveryTripleRate,

      higherTargetTripleRate: safeRate(
        mapPosition.higherTargetTriples,
        mapPosition.higherTargetAttacks,
      ),

      similarPositionTripleRate: safeRate(
        mapPosition.similarPositionTriples,
        mapPosition.similarPositionAttacks,
      ),

      lowerTargetTripleRate: safeRate(
        mapPosition.lowerTargetTriples,
        mapPosition.lowerTargetAttacks,
      ),

      averageStars: player.metrics.averageStars,

      averageDestruction: player.metrics.averageDestruction,

      reliabilityRate: player.metrics.reliabilityRate,

      attacksUsed: player.metrics.attacksUsed,
    },
  };
}

/**
 * Retorna os jogadores imediatamente acima e abaixo
 * da posição analisada.
 *
 * Exemplo:
 *
 * posição 5:
 * 3, 4, [5], 6, 7
 *
 * O próprio jogador analisado é excluído.
 */
export function getRankingNeighbors(
  players: CwlRankedPlayer[],
  targetRank: number,
): CwlRankingComparison[] {
  return players
    .filter(
      (player) =>
        player.rank >= targetRank - 2 &&
        player.rank <= targetRank + 2 &&
        player.rank !== targetRank,
    )
    .sort((a, b) => a.rank - b.rank)
    .map(createComparison);
}
