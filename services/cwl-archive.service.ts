/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/cwl-archive.service.ts
 *
 * Responsabilidade:
 * Orquestrar o arquivamento histórico completo de uma
 * temporada da Clash War League.
 *
 * Funcionalidades:
 *
 * - arquivar a temporada;
 * - arquivar os clãs participantes;
 * - arquivar todas as rodadas;
 * - arquivar todas as guerras disponíveis;
 * - arquivar as escalações de cada guerra;
 * - arquivar cada ataque individual;
 * - preservar payloads brutos da Clash API;
 * - permitir múltiplos snapshots sem duplicação;
 * - retornar um resumo para auditoria.
 *
 * Objetivo:
 * Garantir que os dados históricos da CWL permaneçam
 * disponíveis mesmo depois de deixarem de estar acessíveis
 * através dos endpoints atuais da Clash API.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 10/08/2026
 *
 * Versão:
 * 0.8.3
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

import {
  findCwlArchivePlayerPerformance,
  findCwlArchiveWarSnapshots,
  findLatestCwlArchiveSeason,
  getCwlArchiveSummary,
  upsertCwlAttack,
  upsertCwlRound,
  upsertCwlSeason,
  upsertCwlSeasonClan,
  upsertCwlWar,
  upsertCwlWarMember,
} from "@/repositories/cwl-archive.repository";

import type { CwlGroup } from "@/types/cwl";

/**
 * Resultado retornado após o arquivamento.
 */
export type CwlArchiveResult = {
  season: string;
  trackedClanTag: string;

  seasonId: number;

  clans: number;
  rounds: number;
  wars: number;
  members: number;
  attacks: number;
};

/**
 * Entrada principal do arquivador.
 */
type ArchiveCurrentCwlInput = {
  /**
   * Grupo completo retornado pelo endpoint da CWL.
   */
  group: CwlGroup;

  /**
   * Todas as guerras já consultadas da temporada.
   *
   * Cada guerra preserva também seu roundIndex.
   */
  wars: CwlRoundWar[];

  /**
   * Clã utilizado como referência para consultar
   * esta temporada.
   */
  trackedClanTag: string;
};

/**
 * Arquiva uma fotografia completa do estado atual
 * da temporada da CWL.
 *
 * Esta função pode ser executada diversas vezes.
 *
 * O repository utiliza UPSERT, portanto:
 *
 * - dados existentes são atualizados;
 * - novos dados são inseridos;
 * - registros não são duplicados.
 */
export function archiveCurrentCwl({
  group,
  wars,
  trackedClanTag,
}: ArchiveCurrentCwlInput): CwlArchiveResult {
  /**
   * ========================================================
   * 1. TEMPORADA
   * ========================================================
   */
  const seasonId = upsertCwlSeason({
    season: group.season,
    trackedClanTag,
    state: group.state,
    totalRounds: group.rounds.length,
    rawJson: serializeJson(group),
  });

  /**
   * ========================================================
   * 2. CLÃS PARTICIPANTES
   * ========================================================
   *
   * Preservamos os oito clãs do grupo e também
   * a lista completa de inscritos de cada um.
   */
  group.clans.forEach((clan) => {
    upsertCwlSeasonClan({
      seasonId,

      clanTag: clan.tag,
      clanName: clan.name,

      clanLevel: clan.clanLevel,

      badgeUrlsJson: serializeJson(clan.badgeUrls),

      rosterSize: clan.members?.length ?? 0,

      rawJson: serializeJson(clan),
    });
  });

  /**
   * ========================================================
   * 3. RODADAS
   * ========================================================
   *
   * Criamos inclusive rodadas cujas guerras ainda não
   * tenham sido disponibilizadas.
   */
  const roundIdByIndex = new Map<number, number>();

  group.rounds.forEach((round, roundIndex) => {
    const availableWarCount = round.warTags.filter(
      (warTag) => Boolean(warTag) && warTag !== "#0",
    ).length;

    const roundId = upsertCwlRound({
      seasonId,
      roundIndex,

      warCount: availableWarCount,

      rawJson: serializeJson(round),
    });

    roundIdByIndex.set(roundIndex, roundId);
  });

  /**
   * ========================================================
   * 4. GUERRAS
   * ========================================================
   */
  wars.forEach(({ warTag, roundIndex, war }) => {
    const clan = war.clan;
    const opponent = war.opponent;

    /**
     * Uma guerra incompleta não deve gerar
     * um snapshot parcial inválido.
     */
    if (!clan || !opponent) {
      return;
    }

    const roundId = roundIdByIndex.get(roundIndex);

    if (!roundId) {
      throw new Error(
        `[Kings of Doom] Rodada ${roundIndex + 1} não encontrada durante o arquivamento da guerra ${warTag}.`,
      );
    }

    /**
     * Persiste a guerra e recupera seu ID interno.
     */
    const warId = upsertCwlWar({
      seasonId,
      roundId,

      warTag,

      state: war.state,

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

      clanBadgeUrlsJson: serializeJson(clan.badgeUrls),

      opponentTag: opponent.tag,

      opponentName: opponent.name,

      opponentLevel: opponent.clanLevel,

      opponentStars: opponent.stars,

      opponentDestruction: opponent.destructionPercentage,

      opponentAttacks: opponent.attacks,

      opponentBadgeUrlsJson: serializeJson(opponent.badgeUrls),

      rawJson: serializeJson(war),
    });

    /**
     * ====================================================
     * 5. MEMBROS DO PRIMEIRO CLÃ
     * ====================================================
     */
    archiveWarMembers({
      warId,

      side: "clan",

      clanTag: clan.tag,

      members: clan.members ?? [],

      allMembers: [...(clan.members ?? []), ...(opponent.members ?? [])],
    });

    /**
     * ====================================================
     * 6. MEMBROS DO ADVERSÁRIO
     * ====================================================
     */
    archiveWarMembers({
      warId,

      side: "opponent",

      clanTag: opponent.tag,

      members: opponent.members ?? [],

      allMembers: [...(clan.members ?? []), ...(opponent.members ?? [])],
    });
  });

  /**
   * ========================================================
   * 7. AUDITORIA
   * ========================================================
   */
  const summary = getCwlArchiveSummary({
    season: group.season,
    trackedClanTag,
  });

  if (!summary) {
    throw new Error(
      `[Kings of Doom] Não foi possível gerar o resumo da temporada ${group.season} após o arquivamento.`,
    );
  }

  return {
    season: group.season,
    trackedClanTag,

    seasonId: summary.seasonId,

    clans: summary.clans,

    rounds: summary.rounds,

    wars: summary.wars,

    members: summary.members,

    attacks: summary.attacks,
  };
}

/**
 * ==========================================================
 * ARQUIVAMENTO DOS MEMBROS
 * ==========================================================
 */

/**
 * Estrutura mínima necessária de um membro de guerra.
 *
 * Mantemos o tipo estrutural dentro do service para
 * permitir que o arquivador utilize somente os campos
 * necessários para persistência.
 */
type ArchiveWarMember = {
  tag: string;
  name: string;

  townhallLevel?: number;
  townHallLevel?: number;

  mapPosition?: number;

  opponentAttacks?: number;

  bestOpponentAttack?: unknown;

  attacks?: ArchiveWarAttack[];
};

/**
 * Estrutura mínima de um ataque retornado
 * dentro do membro da guerra.
 */
type ArchiveWarAttack = {
  attackerTag: string;
  defenderTag: string;

  stars: number;

  destructionPercentage: number;

  order?: number;

  duration?: number;
};

/**
 * Arquiva todos os membros de um dos lados da guerra
 * e seus respectivos ataques.
 */
function archiveWarMembers({
  warId,
  side,
  clanTag,
  members,
  allMembers,
}: {
  warId: number;

  side: "clan" | "opponent";

  clanTag: string;

  members: ArchiveWarMember[];

  /**
   * Jogadores dos dois lados da guerra.
   *
   * Utilizado para descobrir o CV do defensor.
   */
  allMembers: ArchiveWarMember[];
}): void {
  members.forEach((member) => {
    /**
     * A Clash API utiliza townhallLevel em algumas
     * estruturas históricas e townHallLevel em outras
     * tipagens internas do projeto.
     *
     * Aceitamos ambos de maneira defensiva.
     */
    const townHallLevel = getMemberTownHallLevel(member);

    /**
     * Persiste o jogador dentro daquela guerra.
     */
    upsertCwlWarMember({
      warId,

      side,
      clanTag,

      playerTag: member.tag,

      playerName: member.name,

      townHallLevel,

      mapPosition: member.mapPosition,

      opponentAttacks: member.opponentAttacks,

      bestOpponentAttackJson: member.bestOpponentAttack
        ? serializeJson(member.bestOpponentAttack)
        : undefined,

      rawJson: serializeJson(member),
    });

    /**
     * ======================================================
     * ATAQUES DO JOGADOR
     * ======================================================
     */
    const attacks = member.attacks ?? [];

    attacks.forEach((attack) => {
      archiveAttack({
        warId,

        attack,

        allMembers,
      });
    });
  });
}

/**
 * ==========================================================
 * ARQUIVAMENTO DE ATAQUES
 * ==========================================================
 */

/**
 * Persiste um ataque individual.
 */
function archiveAttack({
  warId,
  attack,
  allMembers,
}: {
  warId: number;

  attack: ArchiveWarAttack;

  allMembers: ArchiveWarMember[];
}): void {
  /**
   * Localiza atacante e defensor nas escalações
   * para preservar o confronto de Centro de Vila.
   */
  const attacker = allMembers.find(
    (member) => member.tag === attack.attackerTag,
  );

  const defender = allMembers.find(
    (member) => member.tag === attack.defenderTag,
  );

  const attackerTownHall = attacker
    ? getMemberTownHallLevel(attacker)
    : undefined;

  const defenderTownHall = defender
    ? getMemberTownHallLevel(defender)
    : undefined;

  /**
   * Calcula a diferença de CV somente quando
   * os dois níveis estão disponíveis.
   */
  const townHallDifference =
    attackerTownHall !== undefined && defenderTownHall !== undefined
      ? attackerTownHall - defenderTownHall
      : undefined;

  /**
   * A ordem é essencial para identificar de maneira
   * estável o ataque dentro da guerra.
   */
  if (attack.order === undefined || attack.order === null) {
    console.warn(
      `[Kings of Doom] Ataque ignorado no arquivo histórico porque não possui order. Guerra=${warId}, atacante=${attack.attackerTag}, defensor=${attack.defenderTag}.`,
    );

    return;
  }

  upsertCwlAttack({
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

    rawJson: serializeJson(attack),
  });
}

/**
 * ==========================================================
 * CLASSIFICAÇÃO DOS ATAQUES
 * ==========================================================
 */

/**
 * Converte o número de estrelas em uma classificação
 * textual estável para consultas futuras.
 */
function getAttackResultType(
  stars: number,
): "triple" | "two_star" | "one_star" | "zero_star" {
  switch (stars) {
    case 3:
      return "triple";

    case 2:
      return "two_star";

    case 1:
      return "one_star";

    default:
      return "zero_star";
  }
}

/**
 * ==========================================================
 * CENTRO DE VILA
 * ==========================================================
 */

/**
 * Recupera o Centro de Vila de maneira defensiva.
 */
function getMemberTownHallLevel(member: ArchiveWarMember): number | undefined {
  if (typeof member.townhallLevel === "number") {
    return member.townhallLevel;
  }

  if (typeof member.townHallLevel === "number") {
    return member.townHallLevel;
  }

  return undefined;
}

/**
 * ==========================================================
 * SERIALIZAÇÃO
 * ==========================================================
 */

/**
 * Serializa payloads da Clash API para armazenamento.
 *
 * Centralizar esta operação também permite evoluir
 * futuramente para compressão ou tratamento específico
 * sem modificar todos os repositories.
 */
function serializeJson(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * ==========================================================
 * RESUMO PÓS-CWL
 * ==========================================================
 */

/**
 * Linha pública do desempenho de um participante.
 */
export type CwlPostSeasonPlayer = {
  tag: string;
  name: string;

  warsPlayed: number;

  triples: number;
  twoStars: number;
  oneStar: number;
  zeroStars: number;

  attacksUsed: number;
  attacksAvailable: number;
  unusedAttacks: number;

  stars: number;
  destruction: number;
};

/**
 * Contrato pronto para a interface pós-CWL.
 *
 * Importante:
 *
 * - wars utiliza o mesmo formato da CWL ativa;
 * - isso permite reutilizar diretamente CwlStandings;
 * - nenhuma segunda regra de ranking é criada.
 */
export type CwlPostSeasonSummary = {
  season: string;
  trackedClanTag: string;

  wars: CwlRoundWar[];
  players: CwlPostSeasonPlayer[];
};

/**
 * Recupera a última temporada arquivada e transforma
 * o histórico em um modelo pronto para a interface.
 *
 * Nenhuma consulta à Clash API é necessária.
 */
export function getLatestCwlPostSeasonSummary(
  trackedClanTag: string,
): CwlPostSeasonSummary | null {
  const season = findLatestCwlArchiveSeason(trackedClanTag);

  if (!season) {
    return null;
  }

  /**
   * Reconstrói as guerras exatamente no contrato utilizado
   * pelos componentes da temporada ativa.
   */
  const wars = findCwlArchiveWarSnapshots(season.id).flatMap((snapshot) => {
    try {
      return [
        {
          warTag: snapshot.warTag,
          roundIndex: snapshot.roundIndex,
          war: JSON.parse(snapshot.rawJson) as CwlRoundWar["war"],
        },
      ];
    } catch (error) {
      console.error(
        `[Kings of Doom] Falha ao reconstruir guerra arquivada ${snapshot.warTag}.`,
        error,
      );

      return [];
    }
  });

  const players = findCwlArchivePlayerPerformance({
    seasonId: season.id,
    clanTag: trackedClanTag,
  });

  return {
    season: season.season,
    trackedClanTag,

    wars,

    players: players.map((player) => ({
      tag: player.playerTag,
      name: player.playerName,

      warsPlayed: player.warsPlayed,

      triples: player.triples,
      twoStars: player.twoStars,
      oneStar: player.oneStar,
      zeroStars: player.zeroStars,

      attacksUsed: player.attacksUsed,
      attacksAvailable: player.attacksAvailable,
      unusedAttacks: Math.max(0, player.attacksAvailable - player.attacksUsed),

      stars: player.stars,
      destruction: player.destruction,
    })),
  };
}
