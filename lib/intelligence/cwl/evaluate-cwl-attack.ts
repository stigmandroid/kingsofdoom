/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/evaluate-cwl-attack.ts
 *
 * Responsabilidade:
 * Avaliar competitivamente um ataque a partir do contexto
 * reconstruído imediatamente antes de sua realização.
 *
 * Princípios:
 *
 * - resultado e contexto são avaliados separadamente;
 * - atacar cedo ou tarde não gera bônus ou penalidade;
 * - atacar abaixo não é automaticamente penalizado;
 * - a liberdade real de escolha precisa ser considerada;
 * - limpezas e fechamentos preservam seu contexto;
 * - este módulo não calcula a classificação final do jogador.
 * - utilizar posição de mapa como refinamento contextual;
 * - manter CV como indicador estrutural primário de dificuldade;
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 21/09/2026
 *
 * Versão:
 * 0.3.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import type { CwlAttackContext } from "./build-cwl-attack-context";

export type CwlAttackDifficulty =
  | "harder"
  | "equivalent"
  | "easier_constrained"
  | "easier_optional";

export type CwlAttackClosure = "first_attempt" | "cleanup" | "already_closed";

export type CwlAttackEvaluation = {
  attackerTag: string;

  source: CwlAttackContext["source"];

  attackOrder: number;

  result: {
    stars: number;
    destruction: number;
    isTriple: boolean;
  };

  impact: {
    previousStars: number;
    previousDestruction: number;

    starsAdded: number;
    destructionImprovement: number;

    closedByCurrentAttack: boolean;
    attackedAlreadyClosedTarget: boolean;
  };

  difficulty: {
    classification: CwlAttackDifficulty;

    townHallDifference: number;

    mapPositionDifference: number;

    mapPositionContext: "higher_target" | "similar_position" | "lower_target";

    compatibleTargetsAvailable: number;
    harderTargetsAvailable: number;
    easierTargetsAvailable: number;

    hadEquivalentAlternative: boolean;
  };

  closure: {
    classification: CwlAttackClosure;

    previousAttempts: number;

    previousFailedAttempts: number;

    bestPreviousStars: number;

    bestPreviousDestruction: number;

    closedByCurrentAttack: boolean;

    recoveredPreviousFailure: boolean;
  };

  battlefield: {
    openTargets: number;
    closedTargets: number;
  };
};

function classifyDifficulty(context: CwlAttackContext): CwlAttackDifficulty {
  const { selectedTargetDifficulty, compatibleTargets } =
    context.battlefieldBeforeAttack;

  if (selectedTargetDifficulty === "harder") {
    return "harder";
  }

  if (selectedTargetDifficulty === "equivalent") {
    return "equivalent";
  }

  /**
   * Atacar abaixo não representa automaticamente uma escolha
   * competitivamente mais fácil.
   *
   * Se não existia nenhum alvo aberto do mesmo CV do atacante,
   * tratamos a escolha como condicionada pelo estado do campo.
   */
  if (compatibleTargets === 0) {
    return "easier_constrained";
  }

  return "easier_optional";
}

function classifyMapPosition(
  context: CwlAttackContext,
): "higher_target" | "similar_position" | "lower_target" {
  const difference = context.matchup.mapPositionDifference;

  /**
   * A posição de mapa é utilizada como refinamento contextual,
   * nunca como substituta do nível de Centro de Vila.
   *
   * Diferenças pequenas são tratadas como posições comparáveis
   * para evitar atribuir significado excessivo a uma variação
   * mínima dentro da escalação.
   */
  if (Math.abs(difference) <= 2) {
    return "similar_position";
  }

  if (difference > 2) {
    return "higher_target";
  }

  return "lower_target";
}

function classifyClosure(context: CwlAttackContext): CwlAttackClosure {
  if (context.impact.attackedAlreadyClosedTarget) {
    return "already_closed";
  }

  if (context.targetBeforeAttack.previousAttempts > 0) {
    return "cleanup";
  }

  return "first_attempt";
}

/**
 * Conta quantas tentativas ocorreram antes do primeiro triple
 * registrado naquele alvo.
 *
 * Isso representa quantas tentativas anteriores falharam em
 * produzir o primeiro fechamento da vila.
 *
 * Exemplo:
 *
 * 2⭐ → 2⭐ → 1⭐ → 3⭐
 *
 * previousAttempts = 3
 * previousFailedAttempts = 3
 *
 * Para um ataque posterior a uma vila já fechada:
 *
 * 2⭐ → 3⭐ → 3⭐
 *
 * previousAttempts = 2
 * previousFailedAttempts = 1
 *
 * O segundo ataque foi o primeiro fechamento; portanto,
 * apenas uma tentativa anterior falhou em fechar a vila.
 */
function calculatePreviousFailedAttempts(context: CwlAttackContext): number {
  const previousAttacks = context.targetBeforeAttack.previousAttacks;

  if (previousAttacks.length === 0) {
    return 0;
  }

  const firstTripleIndex = previousAttacks.findIndex(
    (attack) => attack.stars === 3,
  );

  if (firstTripleIndex === -1) {
    /**
     * Nenhum triple ocorreu antes do ataque atual.
     *
     * Todas as tentativas anteriores falharam em fechar a vila.
     */
    return previousAttacks.length;
  }

  /**
   * O índice do primeiro triple corresponde exatamente à
   * quantidade de tentativas anteriores ao primeiro fechamento.
   */
  return firstTripleIndex;
}

export function evaluateCwlAttack(
  context: CwlAttackContext,
): CwlAttackEvaluation {
  const isTriple = context.result.stars === 3;

  const closureClassification = classifyClosure(context);

  const previousStars =
    context.targetBeforeAttack.bestPreviousResult?.stars ?? 0;

  const previousDestruction =
    context.targetBeforeAttack.bestPreviousResult?.destruction ?? 0;

  const starsAdded = Math.max(0, context.result.stars - previousStars);

  const destructionImprovement =
    context.result.stars === previousStars
      ? Math.max(0, context.result.destruction - previousDestruction)
      : 0;

  const previousAttempts = context.targetBeforeAttack.previousAttempts;

  const previousFailedAttempts = calculatePreviousFailedAttempts(context);

  const bestPreviousStars = previousStars;

  const bestPreviousDestruction = previousDestruction;

  return {
    attackerTag: context.attacker.tag,

    source: context.source,

    attackOrder: context.attackOrder,

    result: {
      stars: context.result.stars,
      destruction: context.result.destruction,
      isTriple,
    },

    impact: {
      previousStars,
      previousDestruction,

      starsAdded,
      destructionImprovement,

      closedByCurrentAttack: context.impact.closedByCurrentAttack,

      attackedAlreadyClosedTarget: context.impact.attackedAlreadyClosedTarget,
    },

    difficulty: {
      classification: classifyDifficulty(context),

      townHallDifference: context.matchup.townHallDifference,

      mapPositionDifference: context.matchup.mapPositionDifference,

      mapPositionContext: classifyMapPosition(context),

      compatibleTargetsAvailable:
        context.battlefieldBeforeAttack.compatibleTargets,

      harderTargetsAvailable: context.battlefieldBeforeAttack.harderTargets,

      easierTargetsAvailable: context.battlefieldBeforeAttack.easierTargets,

      hadEquivalentAlternative:
        context.battlefieldBeforeAttack.compatibleTargets > 0,
    },

    closure: {
      classification: closureClassification,

      previousAttempts,

      previousFailedAttempts,

      bestPreviousStars,

      bestPreviousDestruction,

      closedByCurrentAttack: context.impact.closedByCurrentAttack,

      recoveredPreviousFailure:
        context.impact.closedByCurrentAttack && previousAttempts > 0,
    },

    battlefield: {
      openTargets: context.battlefieldBeforeAttack.openTargets,

      closedTargets: context.battlefieldBeforeAttack.closedTargets,
    },
  };
}
