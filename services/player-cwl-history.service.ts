/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player-cwl-history.service.ts
 *
 * Responsabilidade:
 * Construir o histórico individual de CWL de um jogador
 * utilizando os dados já persistidos no CWL Archive.
 *
 * Métricas:
 *
 * • temporadas participadas;
 * • guerras disputadas;
 * • ataques realizados;
 * • estrelas;
 * • média de estrelas;
 * • destruição média;
 * • triples;
 * • taxa de triples;
 * • distribuição 3★ / 2★ / 1★ / 0★;
 * • desempenho por temporada;
 * • desempenho por rodada;
 * • diferença de Centro de Vila.
 *
 * Nenhuma nova tabela é criada.
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

export type PlayerCwlAttack = {
  attackId: number;

  warId: number;

  roundIndex: number;

  defenderTag: string;

  attackerTownHall: number | null;
  defenderTownHall: number | null;

  townHallDifference: number | null;

  stars: number;

  destruction: number;

  attackOrder: number | null;

  duration: number | null;

  resultType: string | null;
};

export type PlayerCwlWarEntry = {
  warId: number;

  warTag: string;

  roundIndex: number;

  state: string;

  opponentTag: string;
  opponentName: string;

  playerTownHall: number | null;

  mapPosition: number | null;

  attacksUsed: number;

  stars: number;

  averageDestruction: number;

  triples: number;

  attacks: PlayerCwlAttack[];
};

export type PlayerCwlSeasonEntry = {
  seasonId: number;

  season: string;

  trackedClanTag: string;

  state: string;

  warsPlayed: number;

  attacksUsed: number;

  stars: number;

  averageStars: number;

  averageDestruction: number;

  triples: number;

  twoStars: number;

  oneStars: number;

  zeroStars: number;

  tripleRate: number;

  wars: PlayerCwlWarEntry[];
};

export type PlayerCwlHistorySummary = {
  playerTag: string;

  playerName: string | null;

  seasonsParticipated: number;

  warsPlayed: number;

  attacksUsed: number;

  stars: number;

  averageStars: number;

  averageDestruction: number;

  triples: number;

  twoStars: number;

  oneStars: number;

  zeroStars: number;

  tripleRate: number;

  seasons: PlayerCwlSeasonEntry[];
};

/**
 * ==========================================================
 * ROWS
 * ==========================================================
 */

type PlayerCwlMemberRow = {
  season_id: number;

  season: string;

  tracked_clan_tag: string;

  season_state: string;

  war_id: number;

  war_tag: string;

  war_state: string;

  round_index: number;

  opponent_tag: string;

  opponent_name: string;

  player_name: string;

  town_hall_level: number | null;

  map_position: number | null;

  member_clan_tag: string;

  war_clan_tag: string;

  war_clan_name: string;
};

type PlayerCwlAttackRow = {
  id: number;

  war_id: number;

  round_index: number;

  defender_tag: string;

  attacker_town_hall: number | null;

  defender_town_hall: number | null;

  town_hall_difference: number | null;

  stars: number;

  destruction: number;

  attack_order: number | null;

  duration: number | null;

  result_type: string | null;
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

export function getPlayerCwlHistory(
  playerTag: string,
): PlayerCwlHistorySummary {
  /**
   * ========================================================
   * PARTICIPAÇÕES EM GUERRAS CWL
   * ========================================================
   */

  const memberRows = database
    .prepare(
      `
      SELECT
        s.id AS season_id,
        s.season,
        s.tracked_clan_tag,
        s.state AS season_state,

        w.id AS war_id,
        w.war_tag,
        w.state AS war_state,

        r.round_index,

        m.clan_tag AS member_clan_tag,

        w.clan_tag AS war_clan_tag,
        w.clan_name AS war_clan_name,

        w.opponent_tag,
        w.opponent_name,

        m.player_name,
        m.town_hall_level,
        m.map_position

      FROM cwl_war_members m

      INNER JOIN cwl_wars w
        ON w.id = m.war_id

      INNER JOIN cwl_rounds r
        ON r.id = w.round_id

      INNER JOIN cwl_seasons s
        ON s.id = w.season_id

      WHERE m.player_tag = ?

      ORDER BY
        s.season DESC,
        r.round_index DESC,
        w.id DESC
    `,
    )
    .all(playerTag) as PlayerCwlMemberRow[];

  /**
   * ========================================================
   * ATAQUES
   * ========================================================
   */

  const attackRows = database
    .prepare(
      `
        SELECT
          a.id,
          a.war_id,

          r.round_index,

          a.defender_tag,

          a.attacker_town_hall,
          a.defender_town_hall,

          a.town_hall_difference,

          a.stars,
          a.destruction,

          a.attack_order,
          a.duration,

          a.result_type

        FROM cwl_attacks a

        INNER JOIN cwl_wars w
          ON w.id = a.war_id

        INNER JOIN cwl_rounds r
          ON r.id = w.round_id

        WHERE a.attacker_tag = ?

        ORDER BY
          w.season_id DESC,
          r.round_index DESC,
          a.attack_order ASC
      `,
    )
    .all(playerTag) as PlayerCwlAttackRow[];

  /**
   * ========================================================
   * ATAQUES POR GUERRA
   * ========================================================
   */

  const attacksByWar = new Map<number, PlayerCwlAttack[]>();

  for (const row of attackRows) {
    const attack: PlayerCwlAttack = {
      attackId: row.id,

      warId: row.war_id,

      roundIndex: row.round_index,

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
   * AGRUPAMENTO POR TEMPORADA
   * ========================================================
   */

  const seasonMap = new Map<
    number,
    {
      seasonId: number;
      season: string;
      trackedClanTag: string;
      state: string;
      wars: PlayerCwlWarEntry[];
    }
  >();

  for (const row of memberRows) {
    const attacks = attacksByWar.get(row.war_id) ?? [];

    const attacksUsed = attacks.length;

    const stars = attacks.reduce((total, attack) => total + attack.stars, 0);

    const destructionTotal = attacks.reduce(
      (total, attack) => total + attack.destruction,
      0,
    );

    const averageDestruction =
      attacksUsed > 0 ? round(destructionTotal / attacksUsed) : 0;

    const triples = attacks.filter((attack) => attack.stars === 3).length;

    const playerWasOnClanSide = row.member_clan_tag === row.war_clan_tag;

    const opponentTag = playerWasOnClanSide
      ? row.opponent_tag
      : row.war_clan_tag;

    const opponentName = playerWasOnClanSide
      ? row.opponent_name
      : row.war_clan_name;

    const war: PlayerCwlWarEntry = {
      warId: row.war_id,

      warTag: row.war_tag,

      roundIndex: row.round_index,

      state: row.war_state,

      opponentTag,

      opponentName,

      playerTownHall: row.town_hall_level,

      mapPosition: row.map_position,

      attacksUsed,

      stars,

      averageDestruction,

      triples,

      attacks,
    };

    const currentSeason = seasonMap.get(row.season_id);

    if (currentSeason) {
      currentSeason.wars.push(war);

      continue;
    }

    seasonMap.set(row.season_id, {
      seasonId: row.season_id,

      season: row.season,

      trackedClanTag: row.tracked_clan_tag,

      state: row.season_state,

      wars: [war],
    });
  }

  /**
   * ========================================================
   * RESUMO POR TEMPORADA
   * ========================================================
   */

  const seasons: PlayerCwlSeasonEntry[] = Array.from(seasonMap.values()).map(
    (season) => {
      const attacks = season.wars.flatMap((war) => war.attacks);

      const attacksUsed = attacks.length;

      const stars = attacks.reduce((total, attack) => total + attack.stars, 0);

      const destructionTotal = attacks.reduce(
        (total, attack) => total + attack.destruction,
        0,
      );

      const triples = attacks.filter((attack) => attack.stars === 3).length;

      const twoStars = attacks.filter((attack) => attack.stars === 2).length;

      const oneStars = attacks.filter((attack) => attack.stars === 1).length;

      const zeroStars = attacks.filter((attack) => attack.stars === 0).length;

      return {
        seasonId: season.seasonId,

        season: season.season,

        trackedClanTag: season.trackedClanTag,

        state: season.state,

        warsPlayed: season.wars.length,

        attacksUsed,

        stars,

        averageStars: attacksUsed > 0 ? round(stars / attacksUsed) : 0,

        averageDestruction:
          attacksUsed > 0 ? round(destructionTotal / attacksUsed) : 0,

        triples,

        twoStars,

        oneStars,

        zeroStars,

        tripleRate: attacksUsed > 0 ? round((triples / attacksUsed) * 100) : 0,

        wars: season.wars,
      };
    },
  );

  /**
   * ========================================================
   * MÉTRICAS GERAIS
   * ========================================================
   */

  const attacksUsed = attackRows.length;

  const stars = attackRows.reduce((total, attack) => total + attack.stars, 0);

  const destructionTotal = attackRows.reduce(
    (total, attack) => total + attack.destruction,
    0,
  );

  const triples = attackRows.filter((attack) => attack.stars === 3).length;

  const twoStars = attackRows.filter((attack) => attack.stars === 2).length;

  const oneStars = attackRows.filter((attack) => attack.stars === 1).length;

  const zeroStars = attackRows.filter((attack) => attack.stars === 0).length;

  /**
   * ========================================================
   * RESULTADO
   * ========================================================
   */

  return {
    playerTag,

    playerName: memberRows[0]?.player_name ?? null,

    seasonsParticipated: seasons.length,

    warsPlayed: memberRows.length,

    attacksUsed,

    stars,

    averageStars: attacksUsed > 0 ? round(stars / attacksUsed) : 0,

    averageDestruction:
      attacksUsed > 0 ? round(destructionTotal / attacksUsed) : 0,

    triples,

    twoStars,

    oneStars,

    zeroStars,

    tripleRate: attacksUsed > 0 ? round((triples / attacksUsed) * 100) : 0,

    seasons,
  };
}
