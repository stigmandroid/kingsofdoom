/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/audit-cwl-contextual-evidence.ts
 *
 * Responsabilidade:
 * Auditar a integridade do pipeline contextual da
 * CWL Intelligence sem modificar dados persistidos.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 21/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Script temporário de auditoria
 * ==========================================================
 */

import { buildCwlCompetitiveEvidence } from "../lib/intelligence/cwl/build-cwl-competitive-evidence";

const evidence = buildCwlCompetitiveEvidence();

let totalAttacksUsed = 0;
let totalContextualized = 0;

let cwlUsed = 0;
let cwlContextualized = 0;

let regularWarUsed = 0;
let regularWarContextualized = 0;

const difficulty = {
  harder: 0,
  equivalent: 0,
  easier_constrained: 0,
  easier_optional: 0,
};

const closure = {
  first_attempt: 0,
  cleanup: 0,
  already_closed: 0,
};

const inconsistencies: Array<{
  playerTag: string;
  playerName: string | null;
  attacksUsed: number;
  contextualized: number;
}> = [];

for (const player of evidence) {
  const contextualized = player.attacks.length;

  totalAttacksUsed += player.total.attacksUsed;
  totalContextualized += contextualized;

  cwlUsed += player.cwl.attacksUsed;
  regularWarUsed += player.regularWar.attacksUsed;

  const playerCwlContextualized = player.attacks.filter(
    (attack) => attack.source === "cwl",
  ).length;

  const playerRegularWarContextualized = player.attacks.filter(
    (attack) => attack.source === "regular_war",
  ).length;

  cwlContextualized += playerCwlContextualized;
  regularWarContextualized += playerRegularWarContextualized;

  if (player.total.attacksUsed !== contextualized) {
    inconsistencies.push({
      playerTag: player.playerTag,
      playerName: player.playerName,
      attacksUsed: player.total.attacksUsed,
      contextualized,
    });
  }

  for (const attack of player.attacks) {
    difficulty[attack.evaluation.difficulty.classification] += 1;
    closure[attack.evaluation.closure.classification] += 1;
  }
}

console.log("\n=== KODA — AUDITORIA CONTEXTUAL ===\n");

console.log("Jogadores:", evidence.length);

console.log("\n--- INTEGRIDADE GERAL ---");
console.log("Ataques contabilizados:", totalAttacksUsed);
console.log("Ataques contextualizados:", totalContextualized);
console.log("Diferença:", totalAttacksUsed - totalContextualized);

console.log("\n--- CWL ---");
console.log("Ataques contabilizados:", cwlUsed);
console.log("Ataques contextualizados:", cwlContextualized);
console.log("Diferença:", cwlUsed - cwlContextualized);

console.log("\n--- GUERRAS NORMAIS ---");
console.log("Ataques contabilizados:", regularWarUsed);
console.log("Ataques contextualizados:", regularWarContextualized);
console.log("Diferença:", regularWarUsed - regularWarContextualized);

console.log("\n--- DIFICULDADE ---");
console.table(difficulty);

console.log("\n--- FECHAMENTO ---");
console.table(closure);

console.log("\n--- ALVOS JÁ FECHADOS ---");

const alreadyClosedAttacks = evidence.flatMap((player) =>
  player.attacks
    .filter((attack) => attack.evaluation.impact.attackedAlreadyClosedTarget)
    .map((attack) => ({
      player: player.playerName ?? player.playerTag,
      tag: player.playerTag,

      source: attack.source,

      stars: attack.evaluation.result.stars,
      destruction: attack.evaluation.result.destruction,

      difficulty: attack.evaluation.difficulty.classification,

      openTargets: attack.evaluation.battlefield.openTargets,

      closedTargets: attack.evaluation.battlefield.closedTargets,

      compatibleTargets:
        attack.evaluation.difficulty.compatibleTargetsAvailable,

      harderTargets: attack.evaluation.difficulty.harderTargetsAvailable,

      easierTargets: attack.evaluation.difficulty.easierTargetsAvailable,

      previousAttempts: attack.evaluation.closure.previousAttempts,

      starsAdded: attack.evaluation.impact.starsAdded,

      closedByCurrentAttack: attack.evaluation.impact.closedByCurrentAttack,

      avoidable:
        attack.evaluation.impact.attackedAlreadyClosedTarget &&
        attack.evaluation.battlefield.openTargets > 0,
    })),
);

if (alreadyClosedAttacks.length === 0) {
  console.log("Nenhum ataque contra alvo já fechado encontrado.");
} else {
  console.table(alreadyClosedAttacks);
}

console.log(
  "\nTotal de ataques contra alvos já fechados:",
  alreadyClosedAttacks.length,
);

console.log(
  "Com alvo aberto disponível:",
  alreadyClosedAttacks.filter((attack) => attack.avoidable).length,
);

console.log(
  "Sem alvo aberto disponível:",
  alreadyClosedAttacks.filter((attack) => !attack.avoidable).length,
);

console.log("\n--- ATAQUES CONTRA CV INFERIOR ---");

const easierAttacks = evidence.flatMap((player) =>
  player.attacks
    .filter(
      (attack) =>
        attack.evaluation.difficulty.classification === "easier_constrained" ||
        attack.evaluation.difficulty.classification === "easier_optional",
    )
    .map((attack) => ({
      player: player.playerName ?? player.playerTag,
      tag: player.playerTag,

      source: attack.source,

      stars: attack.evaluation.result.stars,
      destruction: attack.evaluation.result.destruction,

      classification: attack.evaluation.difficulty.classification,

      compatibleTargets:
        attack.evaluation.difficulty.compatibleTargetsAvailable,

      harderTargets: attack.evaluation.difficulty.harderTargetsAvailable,

      easierTargets: attack.evaluation.difficulty.easierTargetsAvailable,

      hadEquivalentAlternative:
        attack.evaluation.difficulty.hadEquivalentAlternative,

      openTargets: attack.evaluation.battlefield.openTargets,

      closedTargets: attack.evaluation.battlefield.closedTargets,
    })),
);

if (easierAttacks.length === 0) {
  console.log("Nenhum ataque contra CV inferior encontrado.");
} else {
  console.table(easierAttacks);
}

console.log("\n--- INCONSISTÊNCIAS ---");

if (inconsistencies.length === 0) {
  console.log("Nenhuma inconsistência encontrada.");
} else {
  console.table(inconsistencies);
}

console.log("\n--- EXEMPLOS CONTEXTUALIZADOS ---");

console.dir(
  evidence
    .flatMap((player) =>
      player.attacks.map((attack) => ({
        player: player.playerName ?? player.playerTag,
        source: attack.source,
        stars: attack.stars,
        destruction: attack.destruction,
        attackerTH: attack.attackerTownHall,
        defenderTH: attack.defenderTownHall,
        mapDifference: attack.mapPositionDifference,
        difficulty: attack.evaluation.difficulty.classification,
        compatibleTargets:
          attack.evaluation.difficulty.compatibleTargetsAvailable,
        closure: attack.evaluation.closure.classification,
        previousAttempts: attack.evaluation.closure.previousAttempts,
        recoveredPreviousFailure:
          attack.evaluation.closure.recoveredPreviousFailure,
      })),
    )
    .slice(0, 20),
  {
    depth: null,
  },
);

console.log("\n=== FIM DA AUDITORIA ===\n");
