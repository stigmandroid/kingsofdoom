/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/build-cwl-attack-context.ts
 *
 * Responsabilidade:
 * Reconstruir o contexto competitivo existente imediatamente
 * antes de cada ataque de guerra analisado pela CWL Intelligence.
 *
 * Funcionalidades:
 *
 * - ordenar cronologicamente os ataques pela ordem da guerra;
 * - identificar atacante e defensor nas escalações;
 * - preservar CV e posição de mapa de ambos;
 * - reconstruir o estado dos alvos antes de cada ataque;
 * - identificar bases abertas e já fechadas por triple;
 * - preservar o histórico anterior completo de cada alvo;
 * - identificar quem realizou o primeiro triple de cada alvo;
 * - contabilizar tentativas anteriores no mesmo alvo;
 * - preservar o melhor resultado anterior naquele alvo;
 * - medir quantas opções de alvo ainda estavam abertas;
 * - identificar se o ataque atual fechou a vila;
 * - distinguir CWL de guerra normal sem atribuir mérito
 *   automaticamente à ordem do ataque.
 *
 * Regras:
 *
 * - attackOrder representa sequência, não mérito;
 * - atacar cedo ou tarde não gera bônus ou penalidade;
 * - uma base é considerada fechada no primeiro triple;
 * - triples posteriores não representam novo fechamento;
 * - somente ataques anteriores ao ataque atual influenciam
 *   o estado reconstruído;
 * - este módulo não calcula ranking;
 * - este módulo não determina elegibilidade;
 * - este módulo não seleciona titulares ou reservas.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import type {
  CurrentWar,
  WarAttack,
  WarClan,
  WarMember,
} from "../../../types/war";

export type CwlAttackContextSource = "cwl" | "regular_war";

export type AttackResultSnapshot = {
  stars: number;
  destruction: number;
};

export type PreviousTargetAttack = {
  attackOrder: number;

  attackerTag: string;
  attackerName: string | null;

  attackerTownHall: number | null;
  attackerMapPosition: number | null;

  stars: number;
  destruction: number;
};

export type FirstTripleSnapshot = {
  attackOrder: number;

  attackerTag: string;
  attackerName: string | null;

  stars: 3;
  destruction: number;
};

export type AttackTargetState = {
  defenderTag: string;
  defenderName: string;

  defenderTownHall: number;
  defenderMapPosition: number;

  previousAttempts: number;

  previousAttacks: PreviousTargetAttack[];

  bestPreviousResult: AttackResultSnapshot | null;

  alreadyTripled: boolean;

  firstTriple: FirstTripleSnapshot | null;
};

export type CwlAttackContext = {
  source: CwlAttackContextSource;

  trackedClanTag: string;

  attackOrder: number;

  attacker: {
    tag: string;
    name: string;
    townHallLevel: number;
    mapPosition: number;
  };

  defender: {
    tag: string;
    name: string;
    townHallLevel: number;
    mapPosition: number;
  };

  result: AttackResultSnapshot;

  matchup: {
    townHallDifference: number;
    mapPositionDifference: number;
  };

  targetBeforeAttack: {
    previousAttempts: number;

    previousAttacks: PreviousTargetAttack[];

    bestPreviousResult: AttackResultSnapshot | null;

    alreadyTripled: boolean;

    firstTriple: FirstTripleSnapshot | null;
  };

  impact: {
    closedByCurrentAttack: boolean;
    attackedAlreadyClosedTarget: boolean;
  };

  battlefieldBeforeAttack: {
    totalTargets: number;

    openTargets: number;
    closedTargets: number;

    openTargetTags: string[];
  };
};

type BuildCwlAttackContextInput = {
  source: CwlAttackContextSource;

  trackedClanTag: string;

  war: CurrentWar;
};

function getTrackedSides(
  war: CurrentWar,
  trackedClanTag: string,
): {
  attackingSide: WarClan | null;
  defendingSide: WarClan | null;
} {
  if (war.clan?.tag === trackedClanTag) {
    return {
      attackingSide: war.clan,
      defendingSide: war.opponent ?? null,
    };
  }

  if (war.opponent?.tag === trackedClanTag) {
    return {
      attackingSide: war.opponent,
      defendingSide: war.clan ?? null,
    };
  }

  return {
    attackingSide: null,
    defendingSide: null,
  };
}

function collectTrackedAttacks(attackingSide: WarClan): WarAttack[] {
  return attackingSide.members
    .flatMap((member) => member.attacks ?? [])
    .sort((a, b) => a.order - b.order);
}

function buildMemberIndex(members: WarMember[]): Map<string, WarMember> {
  return new Map(members.map((member) => [member.tag, member]));
}

function isBetterResult(
  candidate: AttackResultSnapshot,
  current: AttackResultSnapshot | null,
): boolean {
  if (!current) {
    return true;
  }

  if (candidate.stars !== current.stars) {
    return candidate.stars > current.stars;
  }

  return candidate.destruction > current.destruction;
}

function buildPreviousTargetAttack(
  attack: WarAttack,
  attackers: Map<string, WarMember>,
): PreviousTargetAttack {
  const attacker = attackers.get(attack.attackerTag);

  return {
    attackOrder: attack.order,

    attackerTag: attack.attackerTag,
    attackerName: attacker?.name ?? null,

    attackerTownHall: attacker?.townhallLevel ?? null,
    attackerMapPosition: attacker?.mapPosition ?? null,

    stars: attack.stars,
    destruction: attack.destructionPercentage,
  };
}

function buildFirstTriple(
  previousAttacks: PreviousTargetAttack[],
): FirstTripleSnapshot | null {
  const firstTriple = previousAttacks.find((attack) => attack.stars === 3);

  if (!firstTriple) {
    return null;
  }

  return {
    attackOrder: firstTriple.attackOrder,

    attackerTag: firstTriple.attackerTag,
    attackerName: firstTriple.attackerName,

    stars: 3,
    destruction: firstTriple.destruction,
  };
}

function getTargetState(
  defender: WarMember,
  previousWarAttacks: WarAttack[],
  attackers: Map<string, WarMember>,
): AttackTargetState {
  const attacksOnTarget = previousWarAttacks
    .filter((attack) => attack.defenderTag === defender.tag)
    .sort((a, b) => a.order - b.order);

  const previousAttacks = attacksOnTarget.map((attack) =>
    buildPreviousTargetAttack(attack, attackers),
  );

  let bestPreviousResult: AttackResultSnapshot | null = null;

  for (const attack of previousAttacks) {
    const result: AttackResultSnapshot = {
      stars: attack.stars,
      destruction: attack.destruction,
    };

    if (isBetterResult(result, bestPreviousResult)) {
      bestPreviousResult = result;
    }
  }

  const firstTriple = buildFirstTriple(previousAttacks);

  return {
    defenderTag: defender.tag,
    defenderName: defender.name,

    defenderTownHall: defender.townhallLevel,
    defenderMapPosition: defender.mapPosition,

    previousAttempts: previousAttacks.length,

    previousAttacks,

    bestPreviousResult,

    alreadyTripled: firstTriple !== null,

    firstTriple,
  };
}

function buildBattlefieldState(
  defendingSide: WarClan,
  previousAttacks: WarAttack[],
  attackers: Map<string, WarMember>,
): AttackTargetState[] {
  return defendingSide.members
    .map((defender) => getTargetState(defender, previousAttacks, attackers))
    .sort((a, b) => a.defenderMapPosition - b.defenderMapPosition);
}

/**
 * Reconstrói o contexto existente antes de cada ataque realizado
 * pelo clã acompanhado.
 *
 * O estado é calculado exclusivamente com ataques cuja ordem seja
 * anterior ao ataque analisado.
 */
export function buildCwlAttackContext({
  source,
  trackedClanTag,
  war,
}: BuildCwlAttackContextInput): CwlAttackContext[] {
  const { attackingSide, defendingSide } = getTrackedSides(war, trackedClanTag);

  if (!attackingSide || !defendingSide) {
    return [];
  }

  const attackers = buildMemberIndex(attackingSide.members);

  const defenders = buildMemberIndex(defendingSide.members);

  const attacks = collectTrackedAttacks(attackingSide);

  return attacks.flatMap((attack): CwlAttackContext[] => {
    const attacker = attackers.get(attack.attackerTag);

    const defender = defenders.get(attack.defenderTag);

    if (!attacker || !defender) {
      return [];
    }

    const previousAttacks = attacks.filter(
      (candidate) => candidate.order < attack.order,
    );

    const battlefield = buildBattlefieldState(
      defendingSide,
      previousAttacks,
      attackers,
    );

    const targetBeforeAttack = battlefield.find(
      (target) => target.defenderTag === defender.tag,
    );

    if (!targetBeforeAttack) {
      return [];
    }

    const openTargets = battlefield.filter((target) => !target.alreadyTripled);

    const closedTargets = battlefield.length - openTargets.length;

    const isTriple = attack.stars === 3;

    const closedByCurrentAttack =
      isTriple && !targetBeforeAttack.alreadyTripled;

    const attackedAlreadyClosedTarget = targetBeforeAttack.alreadyTripled;

    return [
      {
        source,

        trackedClanTag,

        attackOrder: attack.order,

        attacker: {
          tag: attacker.tag,
          name: attacker.name,
          townHallLevel: attacker.townhallLevel,
          mapPosition: attacker.mapPosition,
        },

        defender: {
          tag: defender.tag,
          name: defender.name,
          townHallLevel: defender.townhallLevel,
          mapPosition: defender.mapPosition,
        },

        result: {
          stars: attack.stars,
          destruction: attack.destructionPercentage,
        },

        matchup: {
          townHallDifference: attacker.townhallLevel - defender.townhallLevel,

          mapPositionDifference: attacker.mapPosition - defender.mapPosition,
        },

        targetBeforeAttack: {
          previousAttempts: targetBeforeAttack.previousAttempts,

          previousAttacks: [...targetBeforeAttack.previousAttacks],

          bestPreviousResult: targetBeforeAttack.bestPreviousResult,

          alreadyTripled: targetBeforeAttack.alreadyTripled,

          firstTriple: targetBeforeAttack.firstTriple,
        },

        impact: {
          closedByCurrentAttack,
          attackedAlreadyClosedTarget,
        },

        battlefieldBeforeAttack: {
          totalTargets: battlefield.length,

          openTargets: openTargets.length,

          closedTargets,

          openTargetTags: openTargets.map((target) => target.defenderTag),
        },
      },
    ];
  });
}
