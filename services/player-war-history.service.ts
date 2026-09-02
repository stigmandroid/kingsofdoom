/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player-war-history.service.ts
 *
 * Responsabilidade:
 * Construir o histórico individual de guerras de um jogador
 * utilizando os dados já persistidos no War Archive.
 *
 * A análise inclui:
 *
 * • guerras participadas;
 * • ataques realizados;
 * • estrelas conquistadas;
 * • média de estrelas;
 * • média de destruição;
 * • triples;
 * • ataques de 2, 1 e 0 estrelas;
 * • ataques não utilizados;
 * • diferença de Centro de Vila;
 * • resultado do clã;
 * • histórico cronológico por guerra.
 *
 * Estratégia:
 *
 * Nenhuma nova tabela é criada.
 *
 * O serviço utiliza:
 *
 * • war_history;
 * • war_history_members;
 * • war_history_attacks.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { database } from "@/lib/db/database";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type PlayerWarAttack = {
  attackId: number;

  defenderTag: string;

  attackerTownHall: number | null;
  defenderTownHall: number | null;

  townHallDifference: number | null;

  stars: number;

  destruction: number;

  attackOrder: number | null;

  duration: number | null;

  resultType: "triple" | "two_star" | "one_star" | "zero_star";
};

export type PlayerWarHistoryEntry = {
  warId: number;

  warKey: string;

  trackedClanTag: string;

  result: "preparation" | "ongoing" | "win" | "loss" | "draw";

  state: string;

  opponentTag: string;
  opponentName: string;

  teamSize: number | null;

  attacksPerMember: number | null;

  preparationStartTime: string | null;
  startTime: string | null;
  endTime: string | null;

  mapPosition: number | null;

  playerTownHall: number | null;

  attacksUsed: number;

  attacksAvailable: number;

  attacksMissed: number;

  stars: number;

  averageDestruction: number;

  triples: number;

  attacks: PlayerWarAttack[];
};

export type PlayerWarHistorySummary = {
  playerTag: string;

  playerName: string | null;

  warsParticipated: number;

  completedWars: number;

  wins: number;
  losses: number;
  draws: number;

  attacksUsed: number;

  attacksAvailable: number;

  attacksMissed: number;

  stars: number;

  averageStars: number;

  averageDestruction: number;

  triples: number;

  twoStars: number;

  oneStars: number;

  zeroStars: number;

  tripleRate: number;

  history: PlayerWarHistoryEntry[];
};

/**
 * ==========================================================
 * ROWS
 * ==========================================================
 */

type PlayerWarMemberRow = {
  war_id: number;

  war_key: string;

  tracked_clan_tag: string;

  state: string;

  result: "preparation" | "ongoing" | "win" | "loss" | "draw";

  team_size: number | null;

  attacks_per_member: number | null;

  preparation_start_time: string | null;

  start_time: string | null;

  end_time: string | null;

  opponent_tag: string;

  opponent_name: string;

  player_name: string;

  town_hall_level: number | null;

  map_position: number | null;
};

type PlayerWarAttackRow = {
  id: number;

  war_id: number;

  defender_tag: string;

  attacker_town_hall: number | null;

  defender_town_hall: number | null;

  town_hall_difference: number | null;

  stars: number;

  destruction: number;

  attack_order: number | null;

  duration: number | null;

  result_type: "triple" | "two_star" | "one_star" | "zero_star";
};

/**
 * ==========================================================
 * HELPERS
 * ==========================================================
 */

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}

/**
 * ==========================================================
 * CONSULTA PRINCIPAL
 * ==========================================================
 */

export function getPlayerWarHistory(
  playerTag: string,
): PlayerWarHistorySummary {
  /**
   * ========================================================
   * GUERRAS EM QUE O JOGADOR PARTICIPOU
   * ========================================================
   */

  const memberRows = database
    .prepare(
      `
        SELECT
          w.id AS war_id,
          w.war_key,
          w.tracked_clan_tag,
          w.state,
          w.result,
          w.team_size,
          w.attacks_per_member,
          w.preparation_start_time,
          w.start_time,
          w.end_time,
          w.opponent_tag,
          w.opponent_name,

          m.player_name,
          m.town_hall_level,
          m.map_position

        FROM war_history_members m

        INNER JOIN war_history w
          ON w.id = m.war_id

        WHERE m.player_tag = ?
          AND m.side = 'clan'
          AND w.state <> 'preparation'

        ORDER BY
          COALESCE(
            w.end_time,
            w.start_time,
            w.preparation_start_time
          ) DESC,
          w.id DESC
      `,
    )
    .all(playerTag) as PlayerWarMemberRow[];

  /**
   * ========================================================
   * ATAQUES DO JOGADOR
   * ========================================================
   */

  const attackRows = database
    .prepare(
      `
        SELECT
          id,
          war_id,
          defender_tag,
          attacker_town_hall,
          defender_town_hall,
          town_hall_difference,
          stars,
          destruction,
          attack_order,
          duration,
          result_type

        FROM war_history_attacks

        WHERE attacker_tag = ?

        ORDER BY
          war_id DESC,
          attack_order ASC
      `,
    )
    .all(playerTag) as PlayerWarAttackRow[];

  /**
   * ========================================================
   * AGRUPAMENTO DOS ATAQUES POR GUERRA
   * ========================================================
   */

  const attacksByWar = new Map<number, PlayerWarAttack[]>();

  for (const row of attackRows) {
    const attack: PlayerWarAttack = {
      attackId: row.id,

      defenderTag: row.defender_tag,

      attackerTownHall: row.attacker_town_hall,

      defenderTownHall: row.defender_town_hall,

      townHallDifference: row.town_hall_difference,

      stars: row.stars,

      destruction: row.destruction,

      attackOrder: row.attack_order,

      duration: row.duration,

      resultType: row.result_type,
    };

    const current = attacksByWar.get(row.war_id) ?? [];

    current.push(attack);

    attacksByWar.set(row.war_id, current);
  }

  /**
   * ========================================================
   * HISTÓRICO POR GUERRA
   * ========================================================
   */

  const history = memberRows.map((row): PlayerWarHistoryEntry => {
    const attacks = attacksByWar.get(row.war_id) ?? [];

    const attacksUsed = attacks.length;

    const attacksAvailable = row.attacks_per_member ?? 0;

    const attacksMissed = Math.max(0, attacksAvailable - attacksUsed);

    const stars = attacks.reduce((total, attack) => total + attack.stars, 0);

    const destructionTotal = attacks.reduce(
      (total, attack) => total + attack.destruction,
      0,
    );

    const averageDestruction =
      attacksUsed > 0 ? round(destructionTotal / attacksUsed) : 0;

    const triples = attacks.filter(
      (attack) => attack.resultType === "triple",
    ).length;

    return {
      warId: row.war_id,

      warKey: row.war_key,

      trackedClanTag: row.tracked_clan_tag,

      result: row.result,

      state: row.state,

      opponentTag: row.opponent_tag,

      opponentName: row.opponent_name,

      teamSize: row.team_size,

      attacksPerMember: row.attacks_per_member,

      preparationStartTime: row.preparation_start_time,

      startTime: row.start_time,

      endTime: row.end_time,

      mapPosition: row.map_position,

      playerTownHall: row.town_hall_level,

      attacksUsed,

      attacksAvailable,

      attacksMissed,

      stars,

      averageDestruction,

      triples,

      attacks,
    };
  });

  /**
   * ========================================================
   * MÉTRICAS GERAIS
   * ========================================================
   */

  const completedWars = history.filter(
    (war) =>
      war.result === "win" || war.result === "loss" || war.result === "draw",
  );

  const attacksUsed = attackRows.length;

  /**
   * Total de ataques disponibilizados em todas as guerras
   * atualmente conhecidas do jogador.
   */
  const attacksAvailable = history.reduce(
    (total, war) => total + war.attacksAvailable,
    0,
  );

  const attacksMissed = completedWars.reduce(
    (total, war) => total + war.attacksMissed,
    0,
  );

  const stars = attackRows.reduce((total, attack) => total + attack.stars, 0);

  const destructionTotal = attackRows.reduce(
    (total, attack) => total + attack.destruction,
    0,
  );

  const triples = attackRows.filter(
    (attack) => attack.result_type === "triple",
  ).length;

  const twoStars = attackRows.filter(
    (attack) => attack.result_type === "two_star",
  ).length;

  const oneStars = attackRows.filter(
    (attack) => attack.result_type === "one_star",
  ).length;

  const zeroStars = attackRows.filter(
    (attack) => attack.result_type === "zero_star",
  ).length;

  /**
   * ========================================================
   * RESULTADO
   * ========================================================
   */

  return {
    playerTag,

    playerName: memberRows[0]?.player_name ?? null,

    warsParticipated: history.length,

    completedWars: completedWars.length,

    wins: completedWars.filter((war) => war.result === "win").length,

    losses: completedWars.filter((war) => war.result === "loss").length,

    draws: completedWars.filter((war) => war.result === "draw").length,

    attacksUsed,

    attacksAvailable,

    attacksMissed,

    stars,

    averageStars: attacksUsed > 0 ? round(stars / attacksUsed) : 0,

    averageDestruction:
      attacksUsed > 0 ? round(destructionTotal / attacksUsed) : 0,

    triples,

    twoStars,

    oneStars,

    zeroStars,

    tripleRate: attacksUsed > 0 ? round((triples / attacksUsed) * 100) : 0,

    history,
  };
}
