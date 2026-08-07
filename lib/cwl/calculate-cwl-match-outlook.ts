/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/cwl/calculate-cwl-match-outlook.ts
 *
 * Responsabilidade:
 * Calcular o que ainda é matematicamente possível em um
 * confronto da Clash War League.
 *
 * O analisador identifica:
 *
 * - vitória matematicamente confirmada;
 * - derrota matematicamente confirmada;
 * - resultado final;
 * - estrelas necessárias para empatar;
 * - estrelas necessárias para assumir a liderança;
 * - máximo possível de estrelas;
 * - meta atual de destruição.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 06/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CurrentWar, WarClan } from "@/types/war";

/**
 * Estados possíveis da análise matemática do confronto.
 */
export type CwlMatchOutlookStatus =
  | "confirmedVictory"
  | "confirmedDefeat"
  | "finishedVictory"
  | "finishedDefeat"
  | "finishedDraw"
  | "stillPossible"
  | "unavailable";

/**
 * Calcula o máximo real de estrelas que um clã ainda pode
 * acrescentar com os ataques restantes.
 *
 * Para cada base inimiga, considera somente a diferença
 * entre o melhor resultado atual e o máximo de três estrelas.
 */
function calculateMaximumPossibleStars({
  attackingClan,
  defendingClan,
  remainingAttacks,
}: {
  attackingClan: WarClan;
  defendingClan: WarClan;
  remainingAttacks: number;
}): number {
  /**
   * Cada posição defensiva informa o melhor ataque recebido.
   *
   * Exemplo:
   * Base com 1 estrela ainda pode render +2.
   * Base com 2 estrelas ainda pode render +1.
   * Base com 3 estrelas não pode render estrelas adicionais.
   */
  const availableStarGains = defendingClan.members
    .map((member) => {
      const currentBestStars = member.bestOpponentAttack?.stars ?? 0;

      return Math.max(3 - currentBestStars, 0);
    })
    .filter((gain) => gain > 0)
    .sort((firstGain, secondGain) => secondGain - firstGain);

  /**
   * Cada ataque restante pode melhorar no máximo uma base.
   */
  const maximumAdditionalStars = availableStarGains
    .slice(0, remainingAttacks)
    .reduce((total, gain) => total + gain, 0);

  return attackingClan.stars + maximumAdditionalStars;
}

/**
 * Resultado produzido pelo analisador.
 */
export type CwlMatchOutlook = {
  status: CwlMatchOutlookStatus;

  /**
   * Título curto para exibição no card.
   */
  title: string;

  /**
   * Explicação resumida da situação atual.
   */
  description: string;

  /**
   * Estrelas atuais do nosso clã.
   */
  currentStars: number;

  /**
   * Estrelas atuais do adversário.
   */
  enemyStars: number;

  /**
   * Máximo matemático que nosso clã ainda pode alcançar.
   */
  maximumPossibleStars: number;

  /**
   * Máximo matemático que o adversário ainda pode alcançar.
   */
  enemyMaximumPossibleStars: number;

  /**
   * Quantidade de ataques restantes do nosso clã.
   */
  remainingAttacks: number;

  /**
   * Quantidade de ataques restantes do adversário.
   */
  enemyRemainingAttacks: number;

  /**
   * Estrelas necessárias para alcançar o placar atual
   * do adversário.
   */
  starsNeededToTie: number;

  /**
   * Estrelas necessárias para ultrapassar o placar atual
   * do adversário.
   */
  starsNeededToLead: number;

  /**
   * Meta atual de destruição em caso de empate nas estrelas.
   *
   * Essa meta poderá mudar enquanto o adversário ainda
   * possuir ataques disponíveis.
   */
  currentDestructionTarget?: number;
};

/**
 * Dados recebidos pelo analisador.
 */
type CalculateCwlMatchOutlookInput = {
  war: CurrentWar;
  /**
   * Clã utilizado como referência para a análise.
   */
  referenceClanTag?: string;
};

/**
 * Identifica qual lado da guerra representa o clã
 * selecionado e qual representa o adversário.
 */
function resolveWarSides(
  war: CurrentWar,
  referenceClanTag?: string,
): {
  ownClan: WarClan;
  enemyClan: WarClan;
} | null {
  const clan = war.clan;
  const opponent = war.opponent;

  if (!clan || !opponent || !referenceClanTag) {
    return null;
  }

  if (clan.tag === referenceClanTag) {
    return {
      ownClan: clan,
      enemyClan: opponent,
    };
  }

  if (opponent.tag === referenceClanTag) {
    return {
      ownClan: opponent,
      enemyClan: clan,
    };
  }

  return null;
}

/**
 * Verifica qual clã está à frente considerando:
 *
 * 1. estrelas;
 * 2. porcentagem de destruição.
 */
function compareScore(firstClan: WarClan, secondClan: WarClan): number {
  if (firstClan.stars !== secondClan.stars) {
    return firstClan.stars - secondClan.stars;
  }

  return firstClan.destructionPercentage - secondClan.destructionPercentage;
}

/**
 * Calcula a perspectiva matemática do confronto.
 */
export function calculateCwlMatchOutlook({
  war,
  referenceClanTag,
}: CalculateCwlMatchOutlookInput): CwlMatchOutlook {
  const sides = resolveWarSides(war, referenceClanTag);

  /**
   * Retorno controlado quando os lados da guerra
   * ainda não estão disponíveis.
   */
  if (!sides) {
    return {
      status: "unavailable",
      title: "Análise indisponível",
      description:
        "Ainda não existem informações suficientes para calcular o confronto.",
      currentStars: 0,
      enemyStars: 0,
      maximumPossibleStars: 0,
      enemyMaximumPossibleStars: 0,
      remainingAttacks: 0,
      enemyRemainingAttacks: 0,
      starsNeededToTie: 0,
      starsNeededToLead: 0,
    };
  }

  const { ownClan, enemyClan } = sides;

  /**
   * Na CWL cada participante normalmente possui um ataque.
   *
   * Ainda assim, utilizamos attacksPerMember quando a API
   * devolver explicitamente outro valor.
   */
  const attacksPerMember = war.attacksPerMember ?? 1;

  /**
   * Usa teamSize como fonte principal e o número de membros
   * como fallback.
   */
  const teamSize =
    war.teamSize ?? Math.max(ownClan.members.length, enemyClan.members.length);

  const totalAttacks = teamSize * attacksPerMember;
  const maximumWarStars = teamSize * 3;

  const remainingAttacks = Math.max(totalAttacks - ownClan.attacks, 0);

  const enemyRemainingAttacks = Math.max(totalAttacks - enemyClan.attacks, 0);

  /**
   * Cada ataque restante poderá render no máximo três estrelas.
   *
   * O resultado também é limitado pelo máximo absoluto
   * disponível na guerra.
   */
  const maximumPossibleStars = calculateMaximumPossibleStars({
    attackingClan: ownClan,
    defendingClan: enemyClan,
    remainingAttacks,
  });

  const enemyMaximumPossibleStars = calculateMaximumPossibleStars({
    attackingClan: enemyClan,
    defendingClan: ownClan,
    remainingAttacks: enemyRemainingAttacks,
  });

  const starsNeededToTie = Math.max(enemyClan.stars - ownClan.stars, 0);

  const starsNeededToLead = Math.max(enemyClan.stars - ownClan.stars + 1, 0);

  /**
   * Meta baseada no placar atual.
   *
   * Ela só é relevante quando os clãs terminarem
   * com a mesma quantidade de estrelas.
   */
  const currentDestructionTarget =
    enemyClan.destructionPercentage < 100
      ? Math.min(enemyClan.destructionPercentage + 0.01, 100)
      : undefined;

  const currentScoreComparison = compareScore(ownClan, enemyClan);

  /**
   * Guerra oficialmente encerrada.
   */
  if (war.state === "warEnded") {
    if (currentScoreComparison > 0) {
      return {
        status: "finishedVictory",
        title: "Vitória",
        description: `${ownClan.name} venceu o confronto.`,
        currentStars: ownClan.stars,
        enemyStars: enemyClan.stars,
        maximumPossibleStars,
        enemyMaximumPossibleStars,
        remainingAttacks,
        enemyRemainingAttacks,
        starsNeededToTie,
        starsNeededToLead,
        currentDestructionTarget,
      };
    }

    if (currentScoreComparison < 0) {
      return {
        status: "finishedDefeat",
        title: "Derrota",
        description: `${enemyClan.name} venceu o confronto.`,
        currentStars: ownClan.stars,
        enemyStars: enemyClan.stars,
        maximumPossibleStars,
        enemyMaximumPossibleStars,
        remainingAttacks,
        enemyRemainingAttacks,
        starsNeededToTie,
        starsNeededToLead,
        currentDestructionTarget,
      };
    }

    return {
      status: "finishedDraw",
      title: "Empate",
      description: "Os dois clãs terminaram com o mesmo resultado.",
      currentStars: ownClan.stars,
      enemyStars: enemyClan.stars,
      maximumPossibleStars,
      enemyMaximumPossibleStars,
      remainingAttacks,
      enemyRemainingAttacks,
      starsNeededToTie,
      starsNeededToLead,
      currentDestructionTarget,
    };
  }

  /**
   * Derrota confirmada por estrelas.
   *
   * Mesmo que todos os ataques restantes consigam três
   * estrelas, nosso clã não alcançará o placar adversário.
   */
  if (maximumPossibleStars < enemyClan.stars) {
    return {
      status: "confirmedDefeat",
      title: "Derrota matematicamente confirmada",
      description: `${ownClan.name} pode alcançar no máximo ${maximumPossibleStars} estrelas, enquanto ${enemyClan.name} já possui ${enemyClan.stars}.`,
      currentStars: ownClan.stars,
      enemyStars: enemyClan.stars,
      maximumPossibleStars,
      enemyMaximumPossibleStars,
      remainingAttacks,
      enemyRemainingAttacks,
      starsNeededToTie,
      starsNeededToLead,
      currentDestructionTarget,
    };
  }

  /**
   * Nosso clã não possui ataques restantes e está perdendo
   * no critério de destruição com as estrelas empatadas.
   */
  if (
    remainingAttacks === 0 &&
    ownClan.stars === enemyClan.stars &&
    ownClan.destructionPercentage < enemyClan.destructionPercentage
  ) {
    return {
      status: "confirmedDefeat",
      title: "Derrota matematicamente confirmada",
      description:
        "Não existem ataques restantes para superar a destruição do adversário.",
      currentStars: ownClan.stars,
      enemyStars: enemyClan.stars,
      maximumPossibleStars,
      enemyMaximumPossibleStars,
      remainingAttacks,
      enemyRemainingAttacks,
      starsNeededToTie,
      starsNeededToLead,
      currentDestructionTarget,
    };
  }

  /**
   * Vitória confirmada porque o adversário não consegue
   * mais alcançar o nosso placar.
   */
  if (ownClan.stars > enemyMaximumPossibleStars) {
    return {
      status: "confirmedVictory",
      title: "Vitória matematicamente confirmada",
      description: `${enemyClan.name} pode alcançar no máximo ${enemyMaximumPossibleStars} estrelas.`,
      currentStars: ownClan.stars,
      enemyStars: enemyClan.stars,
      maximumPossibleStars,
      enemyMaximumPossibleStars,
      remainingAttacks,
      enemyRemainingAttacks,
      starsNeededToTie,
      starsNeededToLead,
      currentDestructionTarget,
    };
  }

  /**
   * O adversário não possui ataques restantes e nosso clã
   * já está vencendo no placar ou na destruição.
   */
  if (enemyRemainingAttacks === 0 && currentScoreComparison > 0) {
    return {
      status: "confirmedVictory",
      title: "Vitória matematicamente confirmada",
      description:
        "O adversário não possui ataques restantes para alterar o resultado.",
      currentStars: ownClan.stars,
      enemyStars: enemyClan.stars,
      maximumPossibleStars,
      enemyMaximumPossibleStars,
      remainingAttacks,
      enemyRemainingAttacks,
      starsNeededToTie,
      starsNeededToLead,
      currentDestructionTarget,
    };
  }

  /**
   * O confronto ainda pode ser alterado.
   */
  return {
    status: "stillPossible",
    title: "Confronto ainda em aberto",
    description:
      enemyRemainingAttacks > 0
        ? "A meta poderá mudar porque o adversário ainda possui ataques."
        : "O resultado ainda pode ser alterado pelos ataques restantes.",
    currentStars: ownClan.stars,
    enemyStars: enemyClan.stars,
    maximumPossibleStars,
    enemyMaximumPossibleStars,
    remainingAttacks,
    enemyRemainingAttacks,
    starsNeededToTie,
    starsNeededToLead,
    currentDestructionTarget,
  };
}
