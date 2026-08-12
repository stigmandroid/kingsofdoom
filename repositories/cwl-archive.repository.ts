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
