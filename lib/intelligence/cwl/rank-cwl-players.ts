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
 * - resultado de ataques em campo aberto e fechado continua
 *   sendo analisado;
 * - posição de mapa é considerada como evidência contextual;
 * - recuperações preservam a dificuldade histórica da vila;
 * - ataques em alvos já fechados continuam relevantes como
 *   evidência de execução competitiva;
 * - não existe score ponderado arbitrário;
 * - associação atual a K.O.D. ou K.O.D.rec não influencia posição;
 * - liderança mantém a decisão final sobre a escalação.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 30/09/2026
 *
 * Versão:
 * 0.3.0
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
    /**
     * Ataques considerados competitivamente comparáveis.
     *
     * Inclui:
     * - harder;
     * - equivalent;
     * - easier_constrained.
     *
     * Ataques easier_optional permanecem registrados,
     * mas não entram nesta taxa.
     */
    comparableAttacks: number;
    comparableTriples: number;
    comparableTripleRate: number;

    /**
     * Evidência específica de posição de mapa.
     */
    mapPosition: {
      higherTargetAttacks: number;
      higherTargetTriples: number;

      similarPositionAttacks: number;
      similarPositionTriples: number;

      lowerTargetAttacks: number;
      lowerTargetTriples: number;
    };

    /**
     * Ataques em alvos já fechados continuam sendo
     * considerados como execução competitiva.
     */
    closedTargetAttacks: number;
    closedTargetTriples: number;
    closedTargetTripleRate: number;

    /**
     * Ataques de recuperação.
     */
    recoveryAttacks: number;
    recoveryTriples: number;
    recoveryTripleRate: number;

    recoveryBasesClosed: number;

    totalPreviousAttempts: number;
    totalPreviousFailedAttempts: number;

    averagePreviousFailedAttempts: number;

    hardestRecoveryAttempts: number;
    hardestRecoveryBestPreviousStars: number;
    hardestRecoveryBestPreviousDestruction: number;

    /**
     * Ataques opcionais contra CV inferior.
     *
     * Continuam visíveis, mas não aumentam a taxa
     * competitivamente comparável.
     */
    optionalEasyAttacks: number;
    optionalEasyTriples: number;

    /**
     * Contribuição objetiva.
     */
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
  const harder = performance.contextualExecution.harder;

  const equivalent = performance.contextualExecution.equivalent;

  const easierConstrained = performance.contextualExecution.easierConstrained;

  const easierOptional = performance.contextualExecution.easierOptional;

  /**
   * Ataques competitivamente comparáveis.
   *
   * Importante:
   *
   * Não dependemos de o alvo estar aberto ou fechado.
   * A classificação do ataque já preserva o contexto
   * do campo no momento da execução.
   *
   * Portanto, um ataque equivalente contra uma vila
   * já fechada continua entrando aqui.
   */
  const comparableAttacks =
    harder.attacks + equivalent.attacks + easierConstrained.attacks;

  const comparableTriples =
    harder.triples + equivalent.triples + easierConstrained.triples;

  const closedTargetAttacks = performance.closure.alreadyClosed;

  const closedTargetTriples =
    performance.contextualExecution.harder.triples +
    performance.contextualExecution.equivalent.triples +
    performance.contextualExecution.easierConstrained.triples;

  /**
   * A métrica acima representa a execução contextual
   * geral. Para identificar especificamente os triples
   * em alvos já fechados precisamos da evidência original,
   * portanto esta parte será refinada no ranking através
   * das próprias evidências quando necessário.
   *
   * O agregado mantém a informação geral de fechamento,
   * enquanto as métricas abaixo usam os dados disponíveis
   * no agregado.
   */

  const recoveryAttacks = performance.closure.cleanup;

  const recoveryTriples =
    performance.contextualExecution.harder.triples +
    performance.contextualExecution.equivalent.triples +
    performance.contextualExecution.easierConstrained.triples -
    (performance.contextualExecution.harder.triples +
      performance.contextualExecution.equivalent.triples +
      performance.contextualExecution.easierConstrained.triples);

  /**
   * O valor acima é intencionalmente zerado na ausência
   * de uma separação por fechamento no agregado.
   *
   * A informação real de recuperação é calculada abaixo
   * diretamente pela evidência do jogador.
   */
  void closedTargetTriples;
  void recoveryTriples;

  const hardestRecovery = performance.closure.hardestRecovery;

  return {
    comparableAttacks,

    comparableTriples,

    comparableTripleRate: safeDivide(comparableTriples, comparableAttacks),

    mapPosition: {
      higherTargetAttacks: performance.matchup.mapPosition.higherTarget,

      higherTargetTriples: 0,

      similarPositionAttacks: performance.matchup.mapPosition.similarPosition,

      similarPositionTriples: 0,

      lowerTargetAttacks: performance.matchup.mapPosition.lowerTarget,

      lowerTargetTriples: 0,
    },

    closedTargetAttacks,

    closedTargetTriples: 0,

    closedTargetTripleRate: 0,

    recoveryAttacks,

    recoveryTriples: 0,

    recoveryTripleRate: 0,

    recoveryBasesClosed: performance.closure.cleanupBasesClosed,

    totalPreviousAttempts: performance.closure.totalPreviousAttempts,

    totalPreviousFailedAttempts:
      performance.closure.totalPreviousFailedAttempts,

    averagePreviousFailedAttempts: safeDivide(
      performance.closure.totalPreviousFailedAttempts,
      recoveryAttacks,
    ),

    hardestRecoveryAttempts: hardestRecovery?.previousFailedAttempts ?? 0,

    hardestRecoveryBestPreviousStars: hardestRecovery?.bestPreviousStars ?? 0,

    hardestRecoveryBestPreviousDestruction:
      hardestRecovery?.bestPreviousDestruction ?? 0,

    optionalEasyAttacks: easierOptional.attacks,

    optionalEasyTriples: easierOptional.triples,

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

/**
 * Calcula evidências específicas que ainda não são
 * agregadas no CwlPlayerPerformanceAggregate.
 *
 * Isso é proposital:
 *
 * - o agregado continua responsável por métricas gerais;
 * - o ranking pode consultar a evidência original;
 * - evitamos transformar cada dimensão contextual
 *   em um número artificial.
 */
function enrichContextualMetricsFromEvidence(
  player: CwlRankedPlayer,
  evidence: CwlCompetitiveEvidence,
): CwlRankedPlayer {
  const attacks = evidence.attacks;

  const higherTargetAttacks = attacks.filter(
    (attack) =>
      attack.evaluation.difficulty.mapPositionContext === "higher_target",
  );

  const similarPositionAttacks = attacks.filter(
    (attack) =>
      attack.evaluation.difficulty.mapPositionContext === "similar_position",
  );

  const lowerTargetAttacks = attacks.filter(
    (attack) =>
      attack.evaluation.difficulty.mapPositionContext === "lower_target",
  );

  const closedTargetAttacks = attacks.filter(
    (attack) => attack.evaluation.impact.attackedAlreadyClosedTarget,
  );

  const recoveryAttacks = attacks.filter(
    (attack) => attack.evaluation.closure.classification === "cleanup",
  );

  const recoveryTriples = recoveryAttacks.filter(
    (attack) => attack.evaluation.result.isTriple,
  ).length;

  return {
    ...player,

    contextualMetrics: {
      ...player.contextualMetrics,

      mapPosition: {
        higherTargetAttacks: higherTargetAttacks.length,

        higherTargetTriples: higherTargetAttacks.filter(
          (attack) => attack.evaluation.result.isTriple,
        ).length,

        similarPositionAttacks: similarPositionAttacks.length,

        similarPositionTriples: similarPositionAttacks.filter(
          (attack) => attack.evaluation.result.isTriple,
        ).length,

        lowerTargetAttacks: lowerTargetAttacks.length,

        lowerTargetTriples: lowerTargetAttacks.filter(
          (attack) => attack.evaluation.result.isTriple,
        ).length,
      },

      closedTargetAttacks: closedTargetAttacks.length,

      closedTargetTriples: closedTargetAttacks.filter(
        (attack) => attack.evaluation.result.isTriple,
      ).length,

      closedTargetTripleRate: safeDivide(
        closedTargetAttacks.filter(
          (attack) => attack.evaluation.result.isTriple,
        ).length,
        closedTargetAttacks.length,
      ),

      recoveryAttacks: recoveryAttacks.length,

      recoveryTriples,

      recoveryTripleRate: safeDivide(recoveryTriples, recoveryAttacks.length),
    },
  };
}

function compareRankedPlayers(a: CwlRankedPlayer, b: CwlRankedPlayer): number {
  /**
   * ========================================================
   * RANKING CONTEXTUAL
   * ========================================================
   *
   * A classificação não transforma as métricas em um
   * score arbitrário.
   *
   * O desempate segue uma sequência de evidências:
   *
   * 1. execução em ataques comparáveis;
   * 2. desempenho em recuperações;
   * 3. execução contra posições superiores;
   * 4. execução em posições equivalentes;
   * 5. contribuição efetiva;
   * 6. execução bruta;
   * 7. confiabilidade;
   * 8. volume de ataques;
   * 9. tag.
   *
   * Ataques contra alvos já fechados NÃO são removidos.
   *
   * Eles continuam presentes quando o alvo era:
   *
   * - CV equivalente;
   * - CV superior;
   * - ou CV inferior condicionado.
   *
   * O resultado do ataque continua sendo observado.
   */

  /**
   * 1. Taxa de PT em ataques competitivamente comparáveis.
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

  /**
   * 2. Taxa de PT em recuperações.
   *
   * Isso diferencia quem consegue efetivamente fechar
   * uma vila depois de tentativas anteriores.
   */
  if (
    a.contextualMetrics.recoveryTripleRate !==
    b.contextualMetrics.recoveryTripleRate
  ) {
    return (
      b.contextualMetrics.recoveryTripleRate -
      a.contextualMetrics.recoveryTripleRate
    );
  }

  /**
   * 3. Execução contra posições superiores.
   */
  const aHigherRate = safeDivide(
    a.contextualMetrics.mapPosition.higherTargetTriples,
    a.contextualMetrics.mapPosition.higherTargetAttacks,
  );

  const bHigherRate = safeDivide(
    b.contextualMetrics.mapPosition.higherTargetTriples,
    b.contextualMetrics.mapPosition.higherTargetAttacks,
  );

  if (aHigherRate !== bHigherRate) {
    return bHigherRate - aHigherRate;
  }

  /**
   * 4. Execução em posições equivalentes.
   *
   * Isso é particularmente importante para ataques
   * realizados no final da guerra contra posições altas
   * já fechadas.
   */
  const aSimilarRate = safeDivide(
    a.contextualMetrics.mapPosition.similarPositionTriples,
    a.contextualMetrics.mapPosition.similarPositionAttacks,
  );

  const bSimilarRate = safeDivide(
    b.contextualMetrics.mapPosition.similarPositionTriples,
    b.contextualMetrics.mapPosition.similarPositionAttacks,
  );

  if (aSimilarRate !== bSimilarRate) {
    return bSimilarRate - aSimilarRate;
  }

  /**
   * 5. Capacidade de fechar bases.
   */
  if (a.contextualMetrics.basesClosed !== b.contextualMetrics.basesClosed) {
    return b.contextualMetrics.basesClosed - a.contextualMetrics.basesClosed;
  }

  /**
   * 6. Quantidade de estrelas efetivamente adicionadas.
   */
  if (
    a.contextualMetrics.starsAddedPerAttack !==
    b.contextualMetrics.starsAddedPerAttack
  ) {
    return (
      b.contextualMetrics.starsAddedPerAttack -
      a.contextualMetrics.starsAddedPerAttack
    );
  }

  /**
   * 7. Dificuldade histórica das recuperações.
   *
   * Uma recuperação depois de várias tentativas anteriores
   * preserva essa informação como evidência.
   *
   * Não transformamos cada tentativa em pontos.
   */
  if (
    a.contextualMetrics.hardestRecoveryAttempts !==
    b.contextualMetrics.hardestRecoveryAttempts
  ) {
    return (
      b.contextualMetrics.hardestRecoveryAttempts -
      a.contextualMetrics.hardestRecoveryAttempts
    );
  }

  /**
   * 8. Menos ataques evitáveis contra vilas já fechadas.
   *
   * Só é considerado evitável quando havia alvo aberto.
   */
  if (
    a.contextualMetrics.avoidableAlreadyClosedTargetAttacks !==
    b.contextualMetrics.avoidableAlreadyClosedTargetAttacks
  ) {
    return (
      a.contextualMetrics.avoidableAlreadyClosedTargetAttacks -
      b.contextualMetrics.avoidableAlreadyClosedTargetAttacks
    );
  }

  /**
   * 9. Taxa bruta de PT.
   */
  if (a.metrics.tripleRate !== b.metrics.tripleRate) {
    return b.metrics.tripleRate - a.metrics.tripleRate;
  }

  /**
   * 10. Média de estrelas.
   */
  if (a.metrics.averageStars !== b.metrics.averageStars) {
    return b.metrics.averageStars - a.metrics.averageStars;
  }

  /**
   * 11. Média de destruição.
   */
  if (a.metrics.averageDestruction !== b.metrics.averageDestruction) {
    return b.metrics.averageDestruction - a.metrics.averageDestruction;
  }

  /**
   * 12. Confiabilidade.
   */
  if (a.metrics.reliabilityRate !== b.metrics.reliabilityRate) {
    return b.metrics.reliabilityRate - a.metrics.reliabilityRate;
  }

  /**
   * 13. Volume de ataques válidos.
   */
  if (a.metrics.attacksUsed !== b.metrics.attacksUsed) {
    return b.metrics.attacksUsed - a.metrics.attacksUsed;
  }

  /**
   * 14. Desempate determinístico.
   */
  return a.playerTag.localeCompare(b.playerTag);
}

/**
 * Recebe todas as evidências competitivas da janela e
 * devolve exclusivamente os jogadores aprovados pelos
 * gates de elegibilidade.
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

    let contextualMetrics = calculateContextualMetrics(performance);

    const basePlayer: CwlRankedPlayer = {
      rank: 0,

      playerTag: evidence.playerTag,

      playerName: evidence.playerName,

      eligibility,

      performance,

      contextualMetrics,

      metrics: calculateMetrics(evidence),
    };

    const enriched = enrichContextualMetricsFromEvidence(basePlayer, evidence);

    contextualMetrics = enriched.contextualMetrics;

    eligiblePlayers.push({
      ...enriched,
      contextualMetrics,
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
