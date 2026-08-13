/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * repositories/cwl-archive.repository.ts
 *
 * Responsabilidade:
 * Centralizar todas as operações de persistência
 * relacionadas ao arquivo histórico da CWL.
 *
 * Funcionalidades:
 *
 * - criar ou atualizar uma temporada;
 * - criar ou atualizar os clãs participantes;
 * - criar ou atualizar rodadas;
 * - criar ou atualizar guerras;
 * - criar ou atualizar membros das guerras;
 * - criar ou atualizar ataques individuais;
 * - preservar payloads brutos;
 * - permitir múltiplos snapshots sem duplicar dados.
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

import { database } from "@/lib/db/database";

/**
 * ==========================================================
 * TIPOS DE ENTRADA
 * ==========================================================
 */

/**
 * Temporada arquivada.
 */
export type CwlArchiveSeasonInput = {
  season: string;
  trackedClanTag: string;
  state: string;
  totalRounds: number;
  rawJson?: string;
};

/**
 * Clã participante da temporada.
 */
export type CwlArchiveSeasonClanInput = {
  seasonId: number;

  clanTag: string;
  clanName: string;

  clanLevel?: number;

  badgeUrlsJson?: string;

  rosterSize: number;

  rawJson?: string;
};

/**
 * Rodada da temporada.
 */
export type CwlArchiveRoundInput = {
  seasonId: number;

  roundIndex: number;

  warCount: number;

  rawJson?: string;
};

/**
 * Guerra individual.
 */
export type CwlArchiveWarInput = {
  seasonId: number;
  roundId: number;

  warTag: string;

  state: string;

  teamSize?: number;
  attacksPerMember?: number;

  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;

  clanTag: string;
  clanName: string;
  clanLevel?: number;
  clanStars: number;
  clanDestruction: number;
  clanAttacks: number;
  clanBadgeUrlsJson?: string;

  opponentTag: string;
  opponentName: string;
  opponentLevel?: number;
  opponentStars: number;
  opponentDestruction: number;
  opponentAttacks: number;
  opponentBadgeUrlsJson?: string;

  rawJson: string;
};

/**
 * Membro de uma guerra.
 */
export type CwlArchiveWarMemberInput = {
  warId: number;

  side: "clan" | "opponent";

  clanTag: string;

  playerTag: string;
  playerName: string;

  townHallLevel?: number;
  mapPosition?: number;
  opponentAttacks?: number;

  bestOpponentAttackJson?: string;
  rawJson?: string;
};

/**
 * Ataque individual.
 */
export type CwlArchiveAttackInput = {
  warId: number;

  attackerTag: string;
  defenderTag: string;

  attackerTownHall?: number;
  defenderTownHall?: number;

  stars: number;
  destruction: number;

  attackOrder?: number;
  duration?: number;

  townHallDifference?: number;

  resultType: string;

  rawJson?: string;
};

/**
 * ==========================================================
 * TEMPORADA
 * ==========================================================
 */

/**
 * Cria ou atualiza uma temporada da CWL.
 *
 * Retorna o ID persistido.
 */
export function upsertCwlSeason(input: CwlArchiveSeasonInput): number {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    INSERT INTO cwl_seasons (
      season,
      tracked_clan_tag,
      state,
      total_rounds,
      raw_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT (
      season,
      tracked_clan_tag
    )
    DO UPDATE SET
      state = excluded.state,
      total_rounds = excluded.total_rounds,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `);

  statement.run(
    input.season,
    input.trackedClanTag,
    input.state,
    input.totalRounds,
    input.rawJson ?? null,
    now,
    now,
  );

  const row = database
    .prepare(
      `
      SELECT id
      FROM cwl_seasons
      WHERE season = ?
        AND tracked_clan_tag = ?
      LIMIT 1
    `,
    )
    .get(input.season, input.trackedClanTag) as
    | {
        id: number;
      }
    | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar temporada CWL ${input.season}.`,
    );
  }

  return row.id;
}

/**
 * ==========================================================
 * CLÃS DA TEMPORADA
 * ==========================================================
 */

/**
 * Cria ou atualiza um clã participante.
 */
export function upsertCwlSeasonClan(input: CwlArchiveSeasonClanInput): number {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    INSERT INTO cwl_season_clans (
      season_id,
      clan_tag,
      clan_name,
      clan_level,
      badge_urls_json,
      roster_size,
      raw_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT (
      season_id,
      clan_tag
    )
    DO UPDATE SET
      clan_name = excluded.clan_name,
      clan_level = excluded.clan_level,
      badge_urls_json = excluded.badge_urls_json,
      roster_size = excluded.roster_size,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `);

  statement.run(
    input.seasonId,
    input.clanTag,
    input.clanName,
    input.clanLevel ?? null,
    input.badgeUrlsJson ?? null,
    input.rosterSize,
    input.rawJson ?? null,
    now,
    now,
  );

  const row = database
    .prepare(
      `
      SELECT id
      FROM cwl_season_clans
      WHERE season_id = ?
        AND clan_tag = ?
      LIMIT 1
    `,
    )
    .get(input.seasonId, input.clanTag) as
    | {
        id: number;
      }
    | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar clã ${input.clanTag} da temporada.`,
    );
  }

  return row.id;
}

/**
 * ==========================================================
 * RODADAS
 * ==========================================================
 */

/**
 * Cria ou atualiza uma rodada.
 */
export function upsertCwlRound(input: CwlArchiveRoundInput): number {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    INSERT INTO cwl_rounds (
      season_id,
      round_index,
      war_count,
      raw_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)

    ON CONFLICT (
      season_id,
      round_index
    )
    DO UPDATE SET
      war_count = excluded.war_count,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `);

  statement.run(
    input.seasonId,
    input.roundIndex,
    input.warCount,
    input.rawJson ?? null,
    now,
    now,
  );

  const row = database
    .prepare(
      `
      SELECT id
      FROM cwl_rounds
      WHERE season_id = ?
        AND round_index = ?
      LIMIT 1
    `,
    )
    .get(input.seasonId, input.roundIndex) as
    | {
        id: number;
      }
    | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar rodada ${input.roundIndex}.`,
    );
  }

  return row.id;
}

/**
 * ==========================================================
 * GUERRAS
 * ==========================================================
 */

/**
 * Cria ou atualiza uma guerra da CWL.
 */
export function upsertCwlWar(input: CwlArchiveWarInput): number {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    INSERT INTO cwl_wars (
      season_id,
      round_id,
      war_tag,
      state,
      team_size,
      attacks_per_member,
      preparation_start_time,
      start_time,
      end_time,

      clan_tag,
      clan_name,
      clan_level,
      clan_stars,
      clan_destruction,
      clan_attacks,
      clan_badge_urls_json,

      opponent_tag,
      opponent_name,
      opponent_level,
      opponent_stars,
      opponent_destruction,
      opponent_attacks,
      opponent_badge_urls_json,

      raw_json,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )

    ON CONFLICT (war_tag)
    DO UPDATE SET
      season_id = excluded.season_id,
      round_id = excluded.round_id,
      state = excluded.state,
      team_size = excluded.team_size,
      attacks_per_member = excluded.attacks_per_member,
      preparation_start_time = excluded.preparation_start_time,
      start_time = excluded.start_time,
      end_time = excluded.end_time,

      clan_tag = excluded.clan_tag,
      clan_name = excluded.clan_name,
      clan_level = excluded.clan_level,
      clan_stars = excluded.clan_stars,
      clan_destruction = excluded.clan_destruction,
      clan_attacks = excluded.clan_attacks,
      clan_badge_urls_json = excluded.clan_badge_urls_json,

      opponent_tag = excluded.opponent_tag,
      opponent_name = excluded.opponent_name,
      opponent_level = excluded.opponent_level,
      opponent_stars = excluded.opponent_stars,
      opponent_destruction = excluded.opponent_destruction,
      opponent_attacks = excluded.opponent_attacks,
      opponent_badge_urls_json = excluded.opponent_badge_urls_json,

      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `);

  statement.run(
    input.seasonId,
    input.roundId,
    input.warTag,
    input.state,

    input.teamSize ?? null,
    input.attacksPerMember ?? null,

    input.preparationStartTime ?? null,
    input.startTime ?? null,
    input.endTime ?? null,

    input.clanTag,
    input.clanName,
    input.clanLevel ?? null,
    input.clanStars,
    input.clanDestruction,
    input.clanAttacks,
    input.clanBadgeUrlsJson ?? null,

    input.opponentTag,
    input.opponentName,
    input.opponentLevel ?? null,
    input.opponentStars,
    input.opponentDestruction,
    input.opponentAttacks,
    input.opponentBadgeUrlsJson ?? null,

    input.rawJson,

    now,
    now,
  );

  const row = database
    .prepare(
      `
      SELECT id
      FROM cwl_wars
      WHERE war_tag = ?
      LIMIT 1
    `,
    )
    .get(input.warTag) as
    | {
        id: number;
      }
    | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar guerra ${input.warTag}.`,
    );
  }

  return row.id;
}

/**
 * ==========================================================
 * MEMBROS DA GUERRA
 * ==========================================================
 */

/**
 * Cria ou atualiza um membro de uma guerra.
 */
export function upsertCwlWarMember(input: CwlArchiveWarMemberInput): number {
  const now = new Date().toISOString();

  const statement = database.prepare(`
    INSERT INTO cwl_war_members (
      war_id,
      side,
      clan_tag,
      player_tag,
      player_name,
      town_hall_level,
      map_position,
      opponent_attacks,
      best_opponent_attack_json,
      raw_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT (
      war_id,
      player_tag
    )
    DO UPDATE SET
      side = excluded.side,
      clan_tag = excluded.clan_tag,
      player_name = excluded.player_name,
      town_hall_level = excluded.town_hall_level,
      map_position = excluded.map_position,
      opponent_attacks = excluded.opponent_attacks,
      best_opponent_attack_json = excluded.best_opponent_attack_json,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `);

  statement.run(
    input.warId,
    input.side,
    input.clanTag,
    input.playerTag,
    input.playerName,
    input.townHallLevel ?? null,
    input.mapPosition ?? null,
    input.opponentAttacks ?? null,
    input.bestOpponentAttackJson ?? null,
    input.rawJson ?? null,
    now,
    now,
  );

  const row = database
    .prepare(
      `
      SELECT id
      FROM cwl_war_members
      WHERE war_id = ?
        AND player_tag = ?
      LIMIT 1
    `,
    )
    .get(input.warId, input.playerTag) as
    | {
        id: number;
      }
    | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar jogador ${input.playerTag} da guerra ${input.warId}.`,
    );
  }

  return row.id;
}

/**
 * ==========================================================
 * ATAQUES
 * ==========================================================
 */

/**
 * Cria ou atualiza um ataque individual.
 *
 * A combinação:
 *
 * war_id + attack_order
 *
 * identifica um ataque específico dentro da guerra.
 */
export function upsertCwlAttack(input: CwlArchiveAttackInput): number {
  const now = new Date().toISOString();

  /**
   * A Clash API normalmente fornece order.
   *
   * Se não houver order, não podemos usar a constraint
   * principal da tabela com segurança.
   */
  if (input.attackOrder === undefined || input.attackOrder === null) {
    throw new Error(
      `[Kings of Doom] Ataque sem attack_order. Guerra=${input.warId}, atacante=${input.attackerTag}.`,
    );
  }

  const statement = database.prepare(`
    INSERT INTO cwl_attacks (
      war_id,
      attacker_tag,
      defender_tag,
      attacker_town_hall,
      defender_town_hall,
      stars,
      destruction,
      attack_order,
      duration,
      town_hall_difference,
      result_type,
      raw_json,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT (
      war_id,
      attack_order
    )
    DO UPDATE SET
      attacker_tag = excluded.attacker_tag,
      defender_tag = excluded.defender_tag,
      attacker_town_hall = excluded.attacker_town_hall,
      defender_town_hall = excluded.defender_town_hall,
      stars = excluded.stars,
      destruction = excluded.destruction,
      duration = excluded.duration,
      town_hall_difference = excluded.town_hall_difference,
      result_type = excluded.result_type,
      raw_json = excluded.raw_json,
      updated_at = excluded.updated_at
  `);

  statement.run(
    input.warId,

    input.attackerTag,
    input.defenderTag,

    input.attackerTownHall ?? null,
    input.defenderTownHall ?? null,

    input.stars,
    input.destruction,

    input.attackOrder,

    input.duration ?? null,

    input.townHallDifference ?? null,

    input.resultType,

    input.rawJson ?? null,

    now,
    now,
  );

  const row = database
    .prepare(
      `
      SELECT id
      FROM cwl_attacks
      WHERE war_id = ?
        AND attack_order = ?
      LIMIT 1
    `,
    )
    .get(input.warId, input.attackOrder) as
    | {
        id: number;
      }
    | undefined;

  if (!row) {
    throw new Error(
      `[Kings of Doom] Falha ao recuperar ataque ${input.attackOrder} da guerra ${input.warId}.`,
    );
  }

  return row.id;
}

/**
 * ==========================================================
 * AUDITORIA
 * ==========================================================
 */

/**
 * Retorna um resumo simples do volume de dados históricos
 * persistidos para determinada temporada.
 *
 * Esta função será utilizada para validar o snapshot.
 */
export function getCwlArchiveSummary({
  season,
  trackedClanTag,
}: {
  season: string;
  trackedClanTag: string;
}): {
  seasonId: number;
  clans: number;
  rounds: number;
  wars: number;
  members: number;
  attacks: number;
} | null {
  const seasonRow = database
    .prepare(
      `
      SELECT id
      FROM cwl_seasons
      WHERE season = ?
        AND tracked_clan_tag = ?
      LIMIT 1
    `,
    )
    .get(season, trackedClanTag) as
    | {
        id: number;
      }
    | undefined;

  if (!seasonRow) {
    return null;
  }

  const seasonId = seasonRow.id;

  const clans = getCount(
    `
    SELECT COUNT(*) AS total
    FROM cwl_season_clans
    WHERE season_id = ?
  `,
    seasonId,
  );

  const rounds = getCount(
    `
    SELECT COUNT(*) AS total
    FROM cwl_rounds
    WHERE season_id = ?
  `,
    seasonId,
  );

  const wars = getCount(
    `
    SELECT COUNT(*) AS total
    FROM cwl_wars
    WHERE season_id = ?
  `,
    seasonId,
  );

  const members = getCount(
    `
    SELECT COUNT(*) AS total
    FROM cwl_war_members
    WHERE war_id IN (
      SELECT id
      FROM cwl_wars
      WHERE season_id = ?
    )
  `,
    seasonId,
  );

  const attacks = getCount(
    `
    SELECT COUNT(*) AS total
    FROM cwl_attacks
    WHERE war_id IN (
      SELECT id
      FROM cwl_wars
      WHERE season_id = ?
    )
  `,
    seasonId,
  );

  return {
    seasonId,
    clans,
    rounds,
    wars,
    members,
    attacks,
  };
}

/**
 * Executa uma contagem SQL simples.
 */
function getCount(sql: string, parameter: number): number {
  const row = database.prepare(sql).get(parameter) as
    | {
        total: number;
      }
    | undefined;

  return row?.total ?? 0;
}

/**
 * ==========================================================
 * LEITURA PÓS-CWL
 * ==========================================================
 */

/**
 * Última temporada arquivada para um clã acompanhado.
 */
export type LatestCwlArchiveSeasonRecord = {
  id: number;
  season: string;
  trackedClanTag: string;
  state: string;
  totalRounds: number;
};

/**
 * Linha agregada da classificação final de um clã.
 */
export type CwlArchiveStandingRecord = {
  clanTag: string;
  clanName: string;
  badgeUrlsJson?: string;

  wins: number;
  losses: number;
  draws: number;

  stars: number;
  destruction: number;
};

/**
 * Desempenho agregado de um jogador do clã acompanhado.
 */
export type CwlArchivePlayerPerformanceRecord = {
  playerTag: string;
  playerName: string;

  warsPlayed: number;

  triples: number;
  twoStars: number;
  oneStar: number;
  zeroStars: number;

  attacksUsed: number;
  attacksAvailable: number;

  stars: number;
  destruction: number;
};

/**
 * Recupera a temporada arquivada mais recente de um clã.
 *
 * O ID é usado pelas demais consultas para garantir que
 * todos os dados pertençam exatamente ao mesmo snapshot.
 */
export function findLatestCwlArchiveSeason(
  trackedClanTag: string,
): LatestCwlArchiveSeasonRecord | null {
  const row = database
    .prepare(
      `
        SELECT
          id,
          season,
          tracked_clan_tag,
          state,
          total_rounds
        FROM cwl_seasons
        WHERE tracked_clan_tag = ?
        ORDER BY season DESC, id DESC
        LIMIT 1
      `,
    )
    .get(trackedClanTag) as
    | {
        id: number;
        season: string;
        tracked_clan_tag: string;
        state: string;
        total_rounds: number;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    season: row.season,
    trackedClanTag: row.tracked_clan_tag,
    state: row.state,
    totalRounds: row.total_rounds,
  };
}

/**
 * Calcula a classificação final usando as guerras arquivadas.
 *
 * Cada guerra do grupo aparece uma única vez em cwl_wars.
 * Para a classificação, os dois lados são transformados em
 * resultados independentes e depois agregados por clan_tag.
 */
export function findCwlArchiveStandings(
  seasonId: number,
): CwlArchiveStandingRecord[] {
  const rows = database
    .prepare(
      `
        WITH results AS (
          SELECT
            clan_tag AS clan_tag,
            clan_name AS clan_name,
            clan_badge_urls_json AS badge_urls_json,
            clan_stars AS stars,
            clan_destruction AS destruction,
            CASE
              WHEN clan_stars > opponent_stars THEN 1
              WHEN clan_stars = opponent_stars
                AND clan_destruction > opponent_destruction THEN 1
              ELSE 0
            END AS wins,
            CASE
              WHEN clan_stars < opponent_stars THEN 1
              WHEN clan_stars = opponent_stars
                AND clan_destruction < opponent_destruction THEN 1
              ELSE 0
            END AS losses,
            CASE
              WHEN clan_stars = opponent_stars
                AND clan_destruction = opponent_destruction THEN 1
              ELSE 0
            END AS draws
          FROM cwl_wars
          WHERE season_id = ?
            AND state = 'warEnded'

          UNION ALL

          SELECT
            opponent_tag AS clan_tag,
            opponent_name AS clan_name,
            opponent_badge_urls_json AS badge_urls_json,
            opponent_stars AS stars,
            opponent_destruction AS destruction,
            CASE
              WHEN opponent_stars > clan_stars THEN 1
              WHEN opponent_stars = clan_stars
                AND opponent_destruction > clan_destruction THEN 1
              ELSE 0
            END AS wins,
            CASE
              WHEN opponent_stars < clan_stars THEN 1
              WHEN opponent_stars = clan_stars
                AND opponent_destruction < clan_destruction THEN 1
              ELSE 0
            END AS losses,
            CASE
              WHEN opponent_stars = clan_stars
                AND opponent_destruction = clan_destruction THEN 1
              ELSE 0
            END AS draws
          FROM cwl_wars
          WHERE season_id = ?
            AND state = 'warEnded'
        )
        SELECT
          clan_tag,
          MAX(clan_name) AS clan_name,
          MAX(badge_urls_json) AS badge_urls_json,
          SUM(wins) AS wins,
          SUM(losses) AS losses,
          SUM(draws) AS draws,
          SUM(stars) AS stars,
          SUM(destruction) AS destruction
        FROM results
        GROUP BY clan_tag
        ORDER BY
          stars DESC,
          destruction DESC,
          clan_name COLLATE NOCASE ASC
      `,
    )
    .all(seasonId, seasonId) as Array<{
    clan_tag: string;
    clan_name: string;
    badge_urls_json: string | null;
    wins: number;
    losses: number;
    draws: number;
    stars: number;
    destruction: number;
  }>;

  return rows.map((row) => ({
    clanTag: row.clan_tag,
    clanName: row.clan_name,
    badgeUrlsJson: row.badge_urls_json ?? undefined,

    wins: row.wins,
    losses: row.losses,
    draws: row.draws,

    stars: row.stars,
    destruction: row.destruction,
  }));
}

/**
 * Agrega o desempenho ofensivo de todos os jogadores que
 * participaram pelo clã acompanhado na temporada.
 *
 * attacksAvailable considera o limite configurado em cada
 * guerra (normalmente 1 ataque por membro em CWL).
 */
export function findCwlArchivePlayerPerformance({
  seasonId,
  clanTag,
}: {
  seasonId: number;
  clanTag: string;
}): CwlArchivePlayerPerformanceRecord[] {
  const rows = database
    .prepare(
      `
        SELECT
          m.player_tag,
          MAX(m.player_name) AS player_name,

          COUNT(DISTINCT m.war_id) AS wars_played,

          SUM(CASE WHEN a.stars = 3 THEN 1 ELSE 0 END) AS triples,
          SUM(CASE WHEN a.stars = 2 THEN 1 ELSE 0 END) AS two_stars,
          SUM(CASE WHEN a.stars = 1 THEN 1 ELSE 0 END) AS one_star,
          SUM(CASE WHEN a.stars = 0 THEN 1 ELSE 0 END) AS zero_stars,

          COUNT(a.id) AS attacks_used,

          SUM(
            CASE
              WHEN w.attacks_per_member IS NOT NULL
                THEN w.attacks_per_member
              ELSE 1
            END
          ) AS attacks_available,

          COALESCE(SUM(a.stars), 0) AS stars,
          COALESCE(SUM(a.destruction), 0) AS destruction

        FROM cwl_war_members m

        INNER JOIN cwl_wars w
          ON w.id = m.war_id
         AND w.season_id = ?

        LEFT JOIN cwl_attacks a
          ON a.war_id = m.war_id
         AND a.attacker_tag = m.player_tag

        WHERE m.clan_tag = ?
          AND w.state = 'warEnded'

        GROUP BY
          m.player_tag

        ORDER BY
          triples DESC,
          two_stars DESC,
          stars DESC,
          destruction DESC,
          player_name COLLATE NOCASE ASC
      `,
    )
    .all(seasonId, clanTag) as Array<{
    player_tag: string;
    player_name: string;
    wars_played: number;
    triples: number;
    two_stars: number;
    one_star: number;
    zero_stars: number;
    attacks_used: number;
    attacks_available: number;
    stars: number;
    destruction: number;
  }>;

  return rows.map((row) => ({
    playerTag: row.player_tag,
    playerName: row.player_name,

    warsPlayed: row.wars_played,

    triples: row.triples,
    twoStars: row.two_stars,
    oneStar: row.one_star,
    zeroStars: row.zero_stars,

    attacksUsed: row.attacks_used,
    attacksAvailable: row.attacks_available,

    stars: row.stars,
    destruction: row.destruction,
  }));
}

/**
 * Guerra arquivada em formato bruto para reconstrução
 * dos componentes já existentes da CWL.
 */
export type CwlArchiveWarSnapshotRecord = {
  warTag: string;
  roundIndex: number;
  rawJson: string;
};

/**
 * Recupera todas as guerras da temporada arquivada,
 * preservando a rodada original.
 *
 * O raw_json contém exatamente o payload persistido
 * durante a CWL e será reconstruído pelo service.
 */
export function findCwlArchiveWarSnapshots(
  seasonId: number,
): CwlArchiveWarSnapshotRecord[] {
  const rows = database
    .prepare(
      `
        SELECT
          w.war_tag,
          r.round_index,
          w.raw_json
        FROM cwl_wars w

        INNER JOIN cwl_rounds r
          ON r.id = w.round_id

        WHERE w.season_id = ?

        ORDER BY
          r.round_index ASC,
          w.id ASC
      `,
    )
    .all(seasonId) as Array<{
    war_tag: string;
    round_index: number;
    raw_json: string;
  }>;

  return rows.map((row) => ({
    warTag: row.war_tag,
    roundIndex: row.round_index,
    rawJson: row.raw_json,
  }));
}
