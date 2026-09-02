/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war-archive.service.ts
 *
 * Responsabilidade:
 * Arquivar a guerra atual do clã e preservar sua evolução
 * entre os estados preparation, inWar e warEnded.
 *
 * O serviço é responsável por:
 *
 * • identificar de forma consistente uma guerra;
 * • evitar registros duplicados quando horários da API mudam;
 * • persistir informações gerais da guerra;
 * • arquivar participantes dos dois clãs;
 * • arquivar ataques realizados;
 * • calcular o resultado da guerra;
 * • preservar a continuidade histórica do War Archive.
 *
 * Estratégia de identidade:
 *
 * A identidade padrão continua sendo baseada em um SHA-256
 * utilizando clã monitorado, adversário e horários da guerra.
 *
 * Como os horários retornados pela Clash API podem sofrer
 * alterações durante manutenção, atualização ou reagendamento,
 * o serviço também procura guerras historicamente compatíveis
 * antes de criar uma nova identidade.
 *
 * Isso impede que uma mesma guerra seja arquivada duas vezes
 * apenas porque preparationStartTime ou startTime mudou.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/09/2026
 *
 * Versão:
 * 0.9.4
 *
 * Status:
 * Em produção
 * ==========================================================
 */

import { createHash } from "node:crypto";

import {
  getWarArchiveSummary,
  getWarIdentityCandidates,
  upsertWarHistory,
  upsertWarHistoryAttack,
  upsertWarHistoryMember,
  type WarArchiveResultType,
  type WarIdentityCandidate,
} from "@/repositories/war-archive.repository";

import type { CurrentWar, WarAttack, WarMember } from "@/types/war";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type WarArchiveResult = {
  trackedClanTag: string;
  warKey: string;
  result: WarArchiveResultType;
  wars: number;
  members: number;
  attacks: number;
};

/**
 * ==========================================================
 * ARCHIVE PRINCIPAL
 * ==========================================================
 */

/**
 * Arquiva o estado atual de uma guerra.
 *
 * O mesmo registro deve ser atualizado durante todo o ciclo:
 *
 * preparation
 *      ↓
 * inWar
 *      ↓
 * warEnded
 *
 * A função tenta primeiro identificar uma guerra já conhecida
 * antes de assumir que o payload representa uma nova guerra.
 */
export function archiveCurrentWar({
  war,
  trackedClanTag,
}: {
  war: CurrentWar;
  trackedClanTag: string;
}): WarArchiveResult {
  const clan = war.clan;
  const opponent = war.opponent;

  if (!clan || !opponent) {
    throw new Error(
      `[Kings of Doom] Guerra incompleta para archive. trackedClanTag=${trackedClanTag}`,
    );
  }

  /**
   * Identidade determinística original.
   *
   * Continua sendo utilizada quando nenhuma guerra histórica
   * compatível é encontrada.
   */
  const generatedWarKey = createHash("sha256")
    .update(
      [
        trackedClanTag,
        opponent.tag,
        war.preparationStartTime ?? "",
        war.startTime ?? "",
      ].join("|"),
    )
    .digest("hex");

  /**
   * Antes de aceitar o novo hash, procura registros contra
   * o mesmo adversário que possam representar a mesma guerra.
   *
   * Essa proteção é necessária porque a Clash API pode alterar
   * horários entre preparation, inWar e warEnded.
   */
  const existingWar = getWarIdentityCandidates({
    trackedClanTag,
    opponentTag: opponent.tag,
  }).find((candidate) =>
    isSameWarCandidate({
      candidate,
      preparationStartTime: war.preparationStartTime,
      startTime: war.startTime,
      endTime: war.endTime,
      teamSize: war.teamSize,
    }),
  );

  /**
   * Quando uma guerra compatível existe, preservamos seu warKey.
   *
   * Caso contrário, usamos a identidade recém-gerada.
   */
  const warKey = existingWar?.warKey ?? generatedWarKey;

  const result = calculateWarResult(war);

  /**
   * O upsert atualiza o mesmo registro durante toda a evolução
   * da guerra, evitando a criação desnecessária de novas linhas.
   */
  const warId = upsertWarHistory({
    warKey,
    trackedClanTag,
    state: war.state,
    result,
    teamSize: war.teamSize,
    attacksPerMember: war.attacksPerMember,
    preparationStartTime: war.preparationStartTime,
    startTime: war.startTime,
    endTime: war.endTime,
    clanTag: clan.tag,
    clanName: clan.name,
    clanLevel: clan.clanLevel,
    clanStars: clan.stars,
    clanDestruction: clan.destructionPercentage,
    clanAttacks: clan.attacks,
    clanBadgeUrlsJson: JSON.stringify(clan.badgeUrls),
    opponentTag: opponent.tag,
    opponentName: opponent.name,
    opponentLevel: opponent.clanLevel,
    opponentStars: opponent.stars,
    opponentDestruction: opponent.destructionPercentage,
    opponentAttacks: opponent.attacks,
    opponentBadgeUrlsJson: JSON.stringify(opponent.badgeUrls),
    rawJson: JSON.stringify(war),
  });

  /**
   * A lista completa é utilizada para localizar os Centros
   * de Vila de atacante e defensor durante o archive de ataques.
   */
  const allMembers = [...(clan.members ?? []), ...(opponent.members ?? [])];

  archiveMembers(warId, "clan", clan.tag, clan.members ?? [], allMembers);

  archiveMembers(
    warId,
    "opponent",
    opponent.tag,
    opponent.members ?? [],
    allMembers,
  );

  const summary = getWarArchiveSummary(trackedClanTag);

  return {
    trackedClanTag,
    warKey,
    result,
    wars: summary.wars,
    members: summary.members,
    attacks: summary.attacks,
  };
}

/**
 * ==========================================================
 * IDENTIDADE DA GUERRA
 * ==========================================================
 */

/**
 * Determina se um registro histórico pode representar
 * a mesma guerra retornada atualmente pela Clash API.
 *
 * Critérios:
 *
 * • mesmo clã monitorado e adversário são filtrados no repository;
 * • tamanho da guerra deve permanecer compatível;
 * • pelo menos um dos horários deve estar dentro da tolerância.
 *
 * A janela de seis horas é suficiente para absorver ajustes
 * operacionais da API sem aproximar guerras consecutivas normais.
 */
function isSameWarCandidate({
  candidate,
  preparationStartTime,
  startTime,
  endTime,
  teamSize,
}: {
  candidate: WarIdentityCandidate;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  teamSize?: number;
}): boolean {
  if (
    candidate.teamSize !== null &&
    teamSize !== undefined &&
    candidate.teamSize !== teamSize
  ) {
    return false;
  }

  const tolerance = 6 * 60 * 60 * 1000;

  return (
    timestampsAreClose(
      candidate.preparationStartTime,
      preparationStartTime,
      tolerance,
    ) ||
    timestampsAreClose(candidate.startTime, startTime, tolerance) ||
    timestampsAreClose(candidate.endTime, endTime, tolerance)
  );
}

/**
 * Verifica se dois timestamps estão dentro da tolerância
 * considerada segura para identificar a mesma guerra.
 */
function timestampsAreClose(
  first: string | null | undefined,
  second: string | null | undefined,
  tolerance: number,
): boolean {
  const firstTime = parseClashTimestamp(first);
  const secondTime = parseClashTimestamp(second);

  if (firstTime === null || secondTime === null) {
    return false;
  }

  return Math.abs(firstTime - secondTime) <= tolerance;
}

/**
 * Converte o formato de data utilizado pela Clash API:
 *
 * YYYYMMDDTHHmmss.SSSZ
 *
 * para timestamp UTC em milissegundos.
 */
function parseClashTimestamp(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const match = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, millisecond] = match;

  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(millisecond),
  );
}

/**
 * ==========================================================
 * MEMBROS
 * ==========================================================
 */

/**
 * Arquiva todos os participantes pertencentes a um dos lados
 * da guerra e encaminha seus ataques para o archive.
 */
function archiveMembers(
  warId: number,
  side: "clan" | "opponent",
  clanTag: string,
  members: WarMember[],
  allMembers: WarMember[],
): void {
  members.forEach((member) => {
    upsertWarHistoryMember({
      warId,
      side,
      clanTag,
      playerTag: member.tag,
      playerName: member.name,
      townHallLevel: member.townhallLevel,
      mapPosition: member.mapPosition,
      opponentAttacks: member.opponentAttacks,
      bestOpponentAttackJson: member.bestOpponentAttack
        ? JSON.stringify(member.bestOpponentAttack)
        : undefined,
      rawJson: JSON.stringify(member),
    });

    (member.attacks ?? []).forEach((attack) => {
      archiveAttack(warId, attack, allMembers);
    });
  });
}

/**
 * ==========================================================
 * ATAQUES
 * ==========================================================
 */

/**
 * Arquiva um ataque individual e calcula automaticamente
 * a diferença de Centro de Vila entre atacante e defensor.
 */
function archiveAttack(
  warId: number,
  attack: WarAttack,
  allMembers: WarMember[],
): void {
  const attacker = allMembers.find((m) => m.tag === attack.attackerTag);
  const defender = allMembers.find((m) => m.tag === attack.defenderTag);

  const attackerTownHall = attacker?.townhallLevel;
  const defenderTownHall = defender?.townhallLevel;

  const townHallDifference =
    attackerTownHall !== undefined && defenderTownHall !== undefined
      ? attackerTownHall - defenderTownHall
      : undefined;

  upsertWarHistoryAttack({
    warId,
    attackerTag: attack.attackerTag,
    defenderTag: attack.defenderTag,
    attackerTownHall,
    defenderTownHall,
    stars: attack.stars,
    destruction: attack.destructionPercentage,
    attackOrder: attack.order,
    duration: attack.duration,
    townHallDifference,
    resultType: getAttackResultType(attack.stars),
    rawJson: JSON.stringify(attack),
  });
}

/**
 * ==========================================================
 * RESULTADO DA GUERRA
 * ==========================================================
 */

/**
 * Calcula o resultado da guerra utilizando as regras
 * tradicionais de estrelas e percentual de destruição.
 *
 * Estados ainda não finalizados são preservados separadamente.
 */
function calculateWarResult(war: CurrentWar): WarArchiveResultType {
  if (war.state === "preparation") {
    return "preparation";
  }

  if (war.state !== "warEnded") {
    return "ongoing";
  }

  const clan = war.clan;
  const opponent = war.opponent;

  if (!clan || !opponent) {
    return "draw";
  }

  if (clan.stars > opponent.stars) return "win";
  if (clan.stars < opponent.stars) return "loss";

  if (clan.destructionPercentage > opponent.destructionPercentage) {
    return "win";
  }

  if (clan.destructionPercentage < opponent.destructionPercentage) {
    return "loss";
  }

  return "draw";
}

/**
 * ==========================================================
 * CLASSIFICAÇÃO DOS ATAQUES
 * ==========================================================
 */

/**
 * Normaliza o resultado de cada ataque para facilitar
 * análises posteriores do Player Intelligence.
 */
function getAttackResultType(stars: number) {
  switch (stars) {
    case 3:
      return "triple" as const;
    case 2:
      return "two_star" as const;
    case 1:
      return "one_star" as const;
    default:
      return "zero_star" as const;
  }
}
