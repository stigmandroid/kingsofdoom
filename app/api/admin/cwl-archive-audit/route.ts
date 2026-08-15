/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/cwl-archive-audit/route.ts
 *
 * Responsabilidade:
 * Auditar o archive histórico da CWL de TODOS os clãs
 * oficiais suportados pelo portal.
 *
 * Comportamento:
 *
 * GET /api/admin/cwl-archive-audit
 * - audita K.O.D. e K.O.D.rec na mesma execução;
 *
 * GET /api/admin/cwl-archive-audit?clan=kod
 * GET /api/admin/cwl-archive-audit?clan=kod-rec
 * - mantém auditoria individual para diagnóstico.
 *
 * Modos de validação:
 *
 * - progressivo:
 *   utilizado enquanto a temporada ainda está em andamento;
 *
 * - final:
 *   utilizado quando a temporada arquivada está encerrada.
 *
 * Segurança operacional:
 *
 * - sucesso global somente quando TODOS os clãs auditados
 *   possuem archive e passam nos checks aplicáveis;
 * - ausência de archive em um dos clãs nunca é mascarada;
 * - a auditoria final exige 8 clãs, 7 rodadas e 28 guerras.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 15/08/2026
 *
 * Versão:
 * 0.8.7
 *
 * Status:
 * ✅ Auditoria multi-clã e progressiva
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isCwlArchiveRequestAuthorized } from "@/lib/security/cwl-archive-auth";

import { database } from "@/lib/db/database";

const supportedClans = {
  kod: {
    slug: "kod",
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    slug: "kod-rec",
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
} as const;

type SupportedClanSlug = keyof typeof supportedClans;

type CountRow = {
  total: number;
};

type StarsDistributionRow = {
  stars: number;
  total: number;
};

type MissedAttackRow = {
  player_tag: string;
  player_name: string;

  wars_played: number;
  attacks_used: number;
  attacks_available: number;
  missed_attacks: number;
};

type SeasonRow = {
  id: number;
  season: string;
  state: string;
  total_rounds: number;
  created_at: string;
  updated_at: string;
};

type ClanAuditResult =
  | {
      slug: SupportedClanSlug;
      name: string;
      tag: string;

      success: false;
      archived: false;

      error: string;
    }
  | {
      slug: SupportedClanSlug;
      name: string;
      tag: string;

      success: boolean;
      archived: true;

      mode: "progressive" | "final";

      season: {
        id: number;
        season: string;
        state: string;
        totalRounds: number;
        createdAt: string;
        updatedAt: string;
      };

      structure: {
        clans: number;
        rounds: number;
        wars: number;
        members: number;
        attacks: number;
      };

      attacks: {
        distribution: Array<{
          stars: number;
          total: number;
        }>;

        integrity: {
          withoutAttacker: number;
          withoutDefender: number;
          withoutAttackerTownHall: number;
          withoutDefenderTownHall: number;
          withoutOrder: number;
        };
      };

      trackedClan: {
        tag: string;

        warMemberParticipations: number;
        attacks: number;

        resultDistribution: {
          triples: number;
          twoStars: number;
          oneStars: number;
          zeroStars: number;
        };

        tripleRate: number;

        missedAttacks: Array<{
          tag: string;
          name: string;
          warsPlayed: number;
          attacksUsed: number;
          attacksAvailable: number;
          missedAttacks: number;
        }>;
      };

      checks: {
        hasSeason: boolean;
        hasEightClans: boolean;
        hasSevenRounds: boolean;
        hasArchivedWars: boolean;
        hasTwentyEightWars: boolean | null;

        allAttacksHaveAttacker: boolean;
        allAttacksHaveDefender: boolean;
        allAttacksHaveAttackerTownHall: boolean;
        allAttacksHaveDefenderTownHall: boolean;
        allAttacksHaveOrder: boolean;
      };

      allIntegrityChecksPassed: boolean;
    };

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

/**
 * Audita a temporada histórica mais recente de um clã.
 */
function auditClan(clanSlug: SupportedClanSlug): ClanAuditResult {
  const selectedClan = supportedClans[clanSlug];

  const trackedClanTag = selectedClan.tag;

  const season = database
    .prepare(
      `
        SELECT
          id,
          season,
          state,
          total_rounds,
          created_at,
          updated_at
        FROM cwl_seasons
        WHERE tracked_clan_tag = ?
        ORDER BY season DESC, id DESC
        LIMIT 1
      `,
    )
    .get(trackedClanTag) as SeasonRow | undefined;

  if (!season) {
    return {
      slug: clanSlug,
      name: selectedClan.name,
      tag: trackedClanTag,

      success: false,
      archived: false,

      error: "Nenhuma temporada arquivada foi encontrada para este clã.",
    };
  }

  const seasonId = season.id;

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

  const starsDistribution = database
    .prepare(
      `
        SELECT
          stars,
          COUNT(*) AS total
        FROM cwl_attacks
        WHERE war_id IN (
          SELECT id
          FROM cwl_wars
          WHERE season_id = ?
        )
        GROUP BY stars
        ORDER BY stars DESC
      `,
    )
    .all(seasonId) as StarsDistributionRow[];

  const attacksWithoutAttacker = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_attacks
      WHERE war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND (
        attacker_tag IS NULL
        OR attacker_tag = ''
      )
    `,
    seasonId,
  );

  const attacksWithoutDefender = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_attacks
      WHERE war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND (
        defender_tag IS NULL
        OR defender_tag = ''
      )
    `,
    seasonId,
  );

  const attacksWithoutAttackerTownHall = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_attacks
      WHERE war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND attacker_town_hall IS NULL
    `,
    seasonId,
  );

  const attacksWithoutDefenderTownHall = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_attacks
      WHERE war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND defender_town_hall IS NULL
    `,
    seasonId,
  );

  const attacksWithoutOrder = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_attacks
      WHERE war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND attack_order IS NULL
    `,
    seasonId,
  );

  const trackedClanAttacks = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_attacks a

      INNER JOIN cwl_war_members m
        ON m.war_id = a.war_id
        AND m.player_tag = a.attacker_tag

      WHERE a.war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND m.clan_tag = ?
    `,
    seasonId,
    trackedClanTag,
  );

  const trackedClanWarMembers = getCount(
    `
      SELECT COUNT(*) AS total
      FROM cwl_war_members
      WHERE war_id IN (
        SELECT id
        FROM cwl_wars
        WHERE season_id = ?
      )
      AND clan_tag = ?
    `,
    seasonId,
    trackedClanTag,
  );

  const missedAttacks = database
    .prepare(
      `
        SELECT
          m.player_tag,
          m.player_name,

          COUNT(*) AS wars_played,

          SUM(
            COALESCE(
              (
                SELECT COUNT(*)
                FROM cwl_attacks a
                WHERE a.war_id = m.war_id
                  AND a.attacker_tag = m.player_tag
              ),
              0
            )
          ) AS attacks_used,

          SUM(
            COALESCE(
              w.attacks_per_member,
              1
            )
          ) AS attacks_available,

          SUM(
            COALESCE(
              w.attacks_per_member,
              1
            )
          )
          -
          SUM(
            COALESCE(
              (
                SELECT COUNT(*)
                FROM cwl_attacks a
                WHERE a.war_id = m.war_id
                  AND a.attacker_tag = m.player_tag
              ),
              0
            )
          ) AS missed_attacks

        FROM cwl_war_members m

        INNER JOIN cwl_wars w
          ON w.id = m.war_id

        WHERE
          w.season_id = ?
          AND m.clan_tag = ?

        GROUP BY
          m.player_tag,
          m.player_name

        HAVING missed_attacks > 0

        ORDER BY
          missed_attacks DESC,
          player_name ASC
      `,
    )
    .all(seasonId, trackedClanTag) as MissedAttackRow[];

  const trackedClanStarsDistribution = database
    .prepare(
      `
        SELECT
          a.stars,
          COUNT(*) AS total

        FROM cwl_attacks a

        INNER JOIN cwl_war_members m
          ON m.war_id = a.war_id
          AND m.player_tag = a.attacker_tag

        INNER JOIN cwl_wars w
          ON w.id = a.war_id

        WHERE
          w.season_id = ?
          AND m.clan_tag = ?

        GROUP BY
          a.stars

        ORDER BY
          a.stars DESC
      `,
    )
    .all(seasonId, trackedClanTag) as StarsDistributionRow[];

  const trackedClanTriples =
    trackedClanStarsDistribution.find((row) => row.stars === 3)?.total ?? 0;

  const trackedClanTwoStars =
    trackedClanStarsDistribution.find((row) => row.stars === 2)?.total ?? 0;

  const trackedClanOneStars =
    trackedClanStarsDistribution.find((row) => row.stars === 1)?.total ?? 0;

  const trackedClanZeroStars =
    trackedClanStarsDistribution.find((row) => row.stars === 0)?.total ?? 0;

  const tripleRate =
    trackedClanAttacks > 0
      ? (trackedClanTriples / trackedClanAttacks) * 100
      : 0;

  /**
   * "ended" ativa a validação final.
   *
   * Qualquer outro estado utiliza validação progressiva.
   */
  const mode: "progressive" | "final" =
    season.state === "ended" ? "final" : "progressive";

  /**
   * Checks sempre aplicáveis.
   */
  const hasSeason = true;
  const hasEightClans = clans === 8;
  const hasSevenRounds = rounds === 7;

  /**
   * Durante a CWL, não exigimos 28 guerras.
   *
   * Exigimos apenas que o archive esteja crescendo
   * quando guerras já estiverem disponíveis.
   */
  const hasArchivedWars = wars > 0;

  /**
   * Só existe check de 28 guerras no modo final.
   */
  const hasTwentyEightWars = mode === "final" ? wars === 28 : null;

  const allAttacksHaveAttacker = attacksWithoutAttacker === 0;
  const allAttacksHaveDefender = attacksWithoutDefender === 0;
  const allAttacksHaveAttackerTownHall = attacksWithoutAttackerTownHall === 0;
  const allAttacksHaveDefenderTownHall = attacksWithoutDefenderTownHall === 0;
  const allAttacksHaveOrder = attacksWithoutOrder === 0;

  const commonChecksPassed =
    hasSeason &&
    hasEightClans &&
    hasSevenRounds &&
    allAttacksHaveAttacker &&
    allAttacksHaveDefender &&
    allAttacksHaveAttackerTownHall &&
    allAttacksHaveDefenderTownHall &&
    allAttacksHaveOrder;

  const allIntegrityChecksPassed =
    mode === "final"
      ? commonChecksPassed && hasTwentyEightWars === true
      : commonChecksPassed;

  return {
    slug: clanSlug,
    name: selectedClan.name,
    tag: trackedClanTag,

    success: allIntegrityChecksPassed,
    archived: true,

    mode,

    season: {
      id: seasonId,
      season: season.season,
      state: season.state,
      totalRounds: season.total_rounds,
      createdAt: season.created_at,
      updatedAt: season.updated_at,
    },

    structure: {
      clans,
      rounds,
      wars,
      members,
      attacks,
    },

    attacks: {
      distribution: starsDistribution.map((row) => ({
        stars: row.stars,
        total: row.total,
      })),

      integrity: {
        withoutAttacker: attacksWithoutAttacker,
        withoutDefender: attacksWithoutDefender,
        withoutAttackerTownHall: attacksWithoutAttackerTownHall,
        withoutDefenderTownHall: attacksWithoutDefenderTownHall,
        withoutOrder: attacksWithoutOrder,
      },
    },

    trackedClan: {
      tag: trackedClanTag,

      warMemberParticipations: trackedClanWarMembers,
      attacks: trackedClanAttacks,

      resultDistribution: {
        triples: trackedClanTriples,
        twoStars: trackedClanTwoStars,
        oneStars: trackedClanOneStars,
        zeroStars: trackedClanZeroStars,
      },

      tripleRate: Number(tripleRate.toFixed(2)),

      missedAttacks: missedAttacks.map((player) => ({
        tag: player.player_tag,
        name: player.player_name,

        warsPlayed: player.wars_played,

        attacksUsed: player.attacks_used,
        attacksAvailable: player.attacks_available,

        missedAttacks: player.missed_attacks,
      })),
    },

    checks: {
      hasSeason,
      hasEightClans,
      hasSevenRounds,
      hasArchivedWars,
      hasTwentyEightWars,

      allAttacksHaveAttacker,
      allAttacksHaveDefender,
      allAttacksHaveAttackerTownHall,
      allAttacksHaveDefenderTownHall,
      allAttacksHaveOrder,
    },

    allIntegrityChecksPassed,
  };
}

/**
 * GET /api/admin/cwl-archive-audit
 *
 * Sem parâmetro:
 * audita TODOS os clãs oficiais.
 *
 * Com ?clan=:
 * mantém diagnóstico individual.
 */
export async function GET(request: Request) {
  try {
    if (!isCwlArchiveRequestAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autorizado.",
        },
        {
          status: 401,
        },
      );
    }

    const url = new URL(request.url);

    const requestedClan = url.searchParams.get("clan");

    if (requestedClan) {
      if (!isSupportedClanSlug(requestedClan)) {
        return NextResponse.json(
          {
            success: false,
            error: "Clã inválido.",
          },
          {
            status: 400,
          },
        );
      }

      const result = auditClan(requestedClan);

      return NextResponse.json(
        {
          success: result.success,
          complete: result.success,
          mode: "single",

          results: [result],
        },
        {
          status: result.success ? 200 : result.archived ? 422 : 404,
        },
      );
    }

    const clanSlugs = Object.keys(supportedClans) as SupportedClanSlug[];

    const results = clanSlugs.map((clanSlug) => auditClan(clanSlug));

    const successful = results.filter((result) => result.success);

    const complete = successful.length === clanSlugs.length;

    return NextResponse.json(
      {
        success: complete,
        complete,
        mode: "all",

        expectedClans: clanSlugs.length,
        healthyClans: successful.length,
        unhealthyClans: clanSlugs.length - successful.length,

        results,
      },
      {
        status: complete ? 200 : successful.length > 0 ? 207 : 422,
      },
    );
  } catch (error) {
    console.error(
      "[Kings of Doom] Erro durante auditoria do arquivo histórico da CWL:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        complete: false,

        error: "Não foi possível auditar o arquivo histórico da CWL.",
      },
      {
        status: 500,
      },
    );
  }
}

function getCount(sql: string, ...parameters: Array<string | number>): number {
  const row = database.prepare(sql).get(...parameters) as CountRow | undefined;

  return row?.total ?? 0;
}
