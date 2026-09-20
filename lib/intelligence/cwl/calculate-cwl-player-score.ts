/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/calculate-cwl-player-score.ts
 *
 * Responsabilidade:
 * Calcular métricas competitivas objetivas de um jogador
 * a partir de seu histórico de ataques na Clash War League.
 *
 * Funcionalidades:
 *
 * - calcular ataques esperados, utilizados e perdidos;
 * - calcular taxa de confiabilidade;
 * - classificar a confiança da amostra;
 * - calcular médias de estrelas e destruição;
 * - contabilizar resultados de 0, 1, 2 e 3 estrelas;
 * - calcular taxa de ataques de 3 estrelas;
 * - analisar confrontos por diferença de Centro de Vila;
 * - identificar ataques contra CV superior, igual ou inferior.
 *
 * Regras:
 *
 * - este módulo calcula somente métricas objetivas;
 * - não determina elegibilidade para a CWL;
 * - não calcula ranking de jogadores;
 * - não seleciona titulares ou reservas;
 * - não aplica pesos ou pontuação competitiva;
 * - townHallDifference representa CV atacante - CV defensor;
 * - valor negativo significa ataque contra CV superior;
 * - valor zero significa ataque contra CV igual;
 * - valor positivo significa ataque contra CV inferior.
 *
 * Arquitetura:
 *
 * Dados históricos
 *      ↓
 * Métricas CWL  ← este módulo
 *      ↓
 * Elegibilidade
 *      ↓
 * Ranking
 *      ↓
 * Alocação K.O.D. / K.O.D.rec
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
 * 🚧 Base de métricas da CWL Intelligence
 * ==========================================================
 */

export type CwlAttackSample = {
  stars: number;
  destruction: number;
  attackerTownHall: number | null;
  defenderTownHall: number | null;
  townHallDifference: number | null;
};

export type CwlPlayerScoreInput = {
  playerTag: string;
  playerName: string;
  townHallLevel: number | null;

  warsPlayed: number;
  attacksExpected: number;
  attacks: CwlAttackSample[];
};

export type CwlSampleConfidence =
  | "insufficient"
  | "low"
  | "medium"
  | "high";

export type CwlPlayerMetrics = {
  playerTag: string;
  playerName: string;
  townHallLevel: number | null;

  sample: {
    warsPlayed: number;
    attacksExpected: number;
    attacksUsed: number;
    attacksMissed: number;
    reliabilityRate: number;
    confidence: CwlSampleConfidence;
  };

  performance: {
    averageStars: number;
    averageDestruction: number;

    triples: number;
    twoStars: number;
    oneStars: number;
    zeroStars: number;

    tripleRate: number;
  };

  matchup: {
    attacksUp: number;
    attacksEqual: number;
    attacksDown: number;

    triplesUp: number;
    triplesEqual: number;
    triplesDown: number;

    averageTownHallDifference: number | null;
  };
};

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clampRate(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getSampleConfidence(
  attacksUsed: number,
): CwlSampleConfidence {
  if (attacksUsed <= 1) {
    return "insufficient";
  }

  if (attacksUsed <= 3) {
    return "low";
  }

  if (attacksUsed <= 5) {
    return "medium";
  }

  return "high";
}

export function calculateCwlPlayerMetrics(
  input: CwlPlayerScoreInput,
): CwlPlayerMetrics {
  const attacksUsed = input.attacks.length;

  const attacksExpected = Math.max(
    0,
    input.attacksExpected,
  );

  const attacksMissed = Math.max(
    0,
    attacksExpected - attacksUsed,
  );

  const reliabilityRate =
    attacksExpected > 0
      ? clampRate(attacksUsed / attacksExpected)
      : 0;

  const totalStars = input.attacks.reduce(
    (total, attack) => total + attack.stars,
    0,
  );

  const totalDestruction = input.attacks.reduce(
    (total, attack) => total + attack.destruction,
    0,
  );

  const triples = input.attacks.filter(
    (attack) => attack.stars === 3,
  ).length;

  const twoStars = input.attacks.filter(
    (attack) => attack.stars === 2,
  ).length;

  const oneStars = input.attacks.filter(
    (attack) => attack.stars === 1,
  ).length;

  const zeroStars = input.attacks.filter(
    (attack) => attack.stars === 0,
  ).length;

  /*
   * townHallDifference follows the archive convention:
   *
   * attacker TH - defender TH
   *
   * negative = attacking up
   * zero     = equal TH
   * positive = attacking down
   */
  const attacksWithTownHallDifference =
    input.attacks.filter(
      (
        attack,
      ): attack is CwlAttackSample & {
        townHallDifference: number;
      } => attack.townHallDifference !== null,
    );

  const attacksUp =
    attacksWithTownHallDifference.filter(
      (attack) => attack.townHallDifference < 0,
    ).length;

  const attacksEqual =
    attacksWithTownHallDifference.filter(
      (attack) => attack.townHallDifference === 0,
    ).length;

  const attacksDown =
    attacksWithTownHallDifference.filter(
      (attack) => attack.townHallDifference > 0,
    ).length;

  const triplesUp =
    attacksWithTownHallDifference.filter(
      (attack) =>
        attack.townHallDifference < 0 &&
        attack.stars === 3,
    ).length;

  const triplesEqual =
    attacksWithTownHallDifference.filter(
      (attack) =>
        attack.townHallDifference === 0 &&
        attack.stars === 3,
    ).length;

  const triplesDown =
    attacksWithTownHallDifference.filter(
      (attack) =>
        attack.townHallDifference > 0 &&
        attack.stars === 3,
    ).length;

  const averageTownHallDifference =
    attacksWithTownHallDifference.length > 0
      ? round(
          attacksWithTownHallDifference.reduce(
            (total, attack) =>
              total + attack.townHallDifference,
            0,
          ) / attacksWithTownHallDifference.length,
        )
      : null;

  return {
    playerTag: input.playerTag,
    playerName: input.playerName,
    townHallLevel: input.townHallLevel,

    sample: {
      warsPlayed: input.warsPlayed,
      attacksExpected,
      attacksUsed,
      attacksMissed,
      reliabilityRate: round(reliabilityRate, 4),
      confidence: getSampleConfidence(attacksUsed),
    },

    performance: {
      averageStars:
        attacksUsed > 0
          ? round(totalStars / attacksUsed)
          : 0,

      averageDestruction:
        attacksUsed > 0
          ? round(totalDestruction / attacksUsed)
          : 0,

      triples,
      twoStars,
      oneStars,
      zeroStars,

      tripleRate:
        attacksUsed > 0
          ? round(triples / attacksUsed, 4)
          : 0,
    },

    matchup: {
      attacksUp,
      attacksEqual,
      attacksDown,

      triplesUp,
      triplesEqual,
      triplesDown,

      averageTownHallDifference,
    },
  };
}