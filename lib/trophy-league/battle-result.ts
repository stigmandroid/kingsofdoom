/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/trophy-league/battle-result.ts
 *
 * Responsabilidade:
 * Interpretar resultados individuais da Liga de Troféus
 * a partir da movimentação de pontos observada.
 *
 * A lógica atual é empírica e foi construída com base em
 * exemplos reais observados dentro do jogo.
 *
 * Regras atualmente adotadas:
 *
 * ATAQUE
 *
 * • 0 pontos      → 0 estrelas;
 * • 1–19 pontos   → 1 estrela;
 * • 20–39 pontos  → 2 estrelas;
 * • 40 pontos     → 3 estrelas.
 *
 * DEFESA
 *
 * O jogo apresenta ao defensor quantos pontos ele preservou.
 *
 * Exemplo:
 *
 * defesa +26
 *
 * Como o valor máximo da batalha é 40:
 *
 * 40 - 26 = 14
 *
 * Portanto, o atacante obteve 14 pontos.
 *
 * Pela regra empírica atual:
 *
 * 14 pontos → 1 estrela.
 *
 * Importante:
 *
 * Esses limites ainda podem ser refinados conforme novos
 * resultados reais forem coletados com os membros dos clãs.
 *
 * A regra permanece centralizada neste arquivo justamente
 * para permitir correções futuras sem espalhar thresholds
 * pela interface ou por outras camadas da aplicação.
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
 * 🧪 Regra empírica em validação
 * ==========================================================
 */

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type TrophyBattleStars = 0 | 1 | 2 | 3;

export type TrophyBattleResult = {
  /**
   * Pontuação utilizada para interpretar o resultado.
   */
  score: number;

  /**
   * Quantidade estimada de estrelas.
   */
  stars: TrophyBattleStars;

  /**
   * Indica que a regra atual foi derivada empiricamente.
   */
  empirical: true;
};

export type TrophyDefenseResult = {
  /**
   * Pontuação mostrada para o defensor.
   */
  defenderScore: number;

  /**
   * Pontuação estimada obtida pelo atacante.
   */
  attackerScore: number;

  /**
   * Quantidade estimada de estrelas do atacante.
   */
  attackerStars: TrophyBattleStars;

  /**
   * Indica que a regra atual foi derivada empiricamente.
   */
  empirical: true;
};

/**
 * ==========================================================
 * NORMALIZAÇÃO
 * ==========================================================
 */

/**
 * Mantém qualquer pontuação dentro do intervalo observado
 * atualmente no sistema de batalhas ranqueadas.
 */
function normalizeBattleScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(40, Math.max(0, Math.round(score)));
}

/**
 * ==========================================================
 * ESTRELAS DE ATAQUE
 * ==========================================================
 */

/**
 * Converte a pontuação individual de um ataque em estrelas.
 *
 * Regra empírica atual:
 *
 * 0      → 0 estrelas
 * 1–19   → 1 estrela
 * 20–39  → 2 estrelas
 * 40     → 3 estrelas
 */
export function getAttackStarsFromScore(score: number): TrophyBattleStars {
  const normalizedScore = normalizeBattleScore(score);

  if (normalizedScore >= 40) {
    return 3;
  }

  if (normalizedScore >= 20) {
    return 2;
  }

  if (normalizedScore > 0) {
    return 1;
  }

  return 0;
}

/**
 * Retorna uma interpretação completa do ataque.
 */
export function interpretTrophyAttack(score: number): TrophyBattleResult {
  const normalizedScore = normalizeBattleScore(score);

  return {
    score: normalizedScore,

    stars: getAttackStarsFromScore(normalizedScore),

    empirical: true,
  };
}

/**
 * ==========================================================
 * ESTRELAS DE DEFESA
 * ==========================================================
 */

/**
 * Interpreta uma defesa a partir dos pontos preservados pelo
 * defensor.
 *
 * Exemplo:
 *
 * defensor +26
 *
 * 40 - 26 = 14 pontos para o atacante.
 *
 * 14 pontos → 1 estrela pela regra empírica atual.
 */
export function interpretTrophyDefense(
  defenderScore: number,
): TrophyDefenseResult {
  const normalizedDefenderScore = normalizeBattleScore(defenderScore);

  const attackerScore = 40 - normalizedDefenderScore;

  return {
    defenderScore: normalizedDefenderScore,

    attackerScore,

    attackerStars: getAttackStarsFromScore(attackerScore),

    empirical: true,
  };
}
