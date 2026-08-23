/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/trophy-league/trophy-delta.ts
 *
 * Responsabilidade:
 * Interpretar a variação de troféus entre dois snapshots
 * consecutivos da Liga de Troféus.
 *
 * Importante:
 *
 * A variação representa apenas o SALDO observado entre duas
 * capturas.
 *
 * Exemplo:
 *
 * snapshot A: 947
 * snapshot B: 968
 *
 * saldo observado: +21
 *
 * Esse saldo NÃO prova que ocorreu uma única batalha de +21.
 * Entre as duas capturas podem ter ocorrido múltiplos ataques
 * e defesas.
 *
 * Por isso, o Command Center mantém uma distinção explícita
 * entre:
 *
 * • dado observado;
 * • batalha individual confirmada.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

export type TrophyDeltaDirection = "gain" | "loss" | "unchanged";

export type TrophyLeagueDelta = {
  previousTrophies: number;
  currentTrophies: number;

  delta: number;

  absoluteDelta: number;

  direction: TrophyDeltaDirection;
};

/**
 * Calcula a diferença observada entre dois snapshots.
 */
export function calculateTrophyLeagueDelta({
  previousTrophies,
  currentTrophies,
}: {
  previousTrophies: number;
  currentTrophies: number;
}): TrophyLeagueDelta {
  const delta = currentTrophies - previousTrophies;

  let direction: TrophyDeltaDirection = "unchanged";

  if (delta > 0) {
    direction = "gain";
  }

  if (delta < 0) {
    direction = "loss";
  }

  return {
    previousTrophies,
    currentTrophies,

    delta,

    absoluteDelta: Math.abs(delta),

    direction,
  };
}
