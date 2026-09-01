/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/test-trophy-battle-result.mjs
 *
 * Responsabilidade:
 * Validar a interpretação empírica dos resultados da
 * Liga de Troféus a partir da movimentação de pontos.
 *
 * O teste cobre exemplos reais observados no jogo.
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
 * 🧪 Diagnóstico
 * ==========================================================
 */

const MAX_SCORE = 40;

function getAttackStarsFromScore(score) {
  const normalizedScore = Math.min(40, Math.max(0, Math.round(score)));

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

function interpretDefense(defenderScore) {
  const normalizedDefenderScore = Math.min(
    40,
    Math.max(0, Math.round(defenderScore)),
  );

  const attackerScore = MAX_SCORE - normalizedDefenderScore;

  return {
    defenderScore: normalizedDefenderScore,
    attackerScore,
    attackerStars: getAttackStarsFromScore(attackerScore),
  };
}

console.log("");
console.log("ATAQUES");
console.log("================================");

console.table(
  [40, 31, 22, 20, 19, 14, 0].map((score) => ({
    score,
    stars: getAttackStarsFromScore(score),
  })),
);

console.log("");
console.log("DEFESAS");
console.log("================================");

console.table(
  [26, 15, 12, 10, 0].map((score) => {
    const result = interpretDefense(score);

    return {
      defensorRecebeu: result.defenderScore,

      atacanteFez: result.attackerScore,

      estrelasAtacante: result.attackerStars,
    };
  }),
);
