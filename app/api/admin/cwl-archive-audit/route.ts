/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/cwl-archive-audit/route.ts
 *
 * Responsabilidade:
 * Auditar a integridade e a qualidade dos dados
 * históricos arquivados da Clash War League.
 *
 * Verificações:
 *
 * - quantidade de temporadas;
 * - quantidade de clãs;
 * - quantidade de rodadas;
 * - quantidade de guerras;
 * - quantidade de membros;
 * - quantidade de ataques;
 * - distribuição de ataques por estrelas;
 * - presença de atacante e defensor;
 * - presença de CV do atacante e defensor;
 * - quantidade de ataques do clã monitorado;
 * - jogadores que deixaram ataques;
 * - consistência geral do snapshot.
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

import { NextResponse } from "next/server";

import { database } from "@/lib/db/database";

/**
 * Clãs suportados pela auditoria.
 */
const supportedClans = {
  kod: {
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    tag: "#2RU9QG9CG",
  },
} as const;

/**
 * Slugs válidos.
 */
type SupportedClanSlug = keyof typeof supportedClans;

/**
 * Valida o slug recebido.
 */
function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

/**
 * Estrutura básica de uma linha de contagem.
 */
type CountRow = {
  total: number;
};

/**
 * Estrutura da distribuição por estrelas.
 */
type StarsDistributionRow = {
  stars: number;
  total: number;
};

/**
 * Estrutura de jogadores que deixaram ataques.
 */
type MissedAttackRow = {
  player_tag: string;
  player_name: string;

  wars_played: number;
  attacks_used: number;
  attacks_available: number;

  missed_attacks: number;
};

/**
 * GET /api/admin/cwl-archive-audit?clan=kod
 *
 * Audita a temporada histórica mais recente do
 * clã informado.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const clanSlug = url.searchParams.get("clan");

    /**
     * Validação do parâmetro obrigatório.
     */
    if (!clanSlug || !isSupportedClanSlug(clanSlug)) {
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

    const trackedClanTag = supportedClans[clanSlug].tag;

    /**
     * Localiza a temporada histórica mais recente
     * acompanhada para o clã informado.
     */
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
          ORDER BY season DESC
          LIMIT 1
        `,
      )
      .get(trackedClanTag) as
      | {
          id: number;
          season: string;
          state: string;
          total_rounds: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;

    if (!season) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhuma temporada arquivada foi encontrada para este clã.",
        },
        {
          status: 404,
        },
      );
    }

    const seasonId = season.id;

    /**
     * ========================================================
     * CONTAGENS ESTRUTURAIS
     * ========================================================
     */

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

    /**
     * ========================================================
     * DISTRIBUIÇÃO DOS ATAQUES
     * ========================================================
     */

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

    /**
     * ========================================================
     * INTEGRIDADE DOS ATAQUES
     * ========================================================
     */

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

    /**
     * ========================================================
     * ATAQUES DO CLÃ MONITORADO
     * ========================================================
     *
     * Consideramos como ataque do clã monitorado qualquer
     * ataque cujo atacante pertença à escalação do próprio
     * clã naquela guerra.
     */
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

    /**
     * ========================================================
     * PARTICIPAÇÃO DO CLÃ MONITORADO
     * ========================================================
     */

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

    /**
     * Na CWL, cada membro possui normalmente um ataque
     * disponível por guerra.
     *
     * Como attacks_per_member está persistido em cwl_wars,
     * calculamos a disponibilidade real por participação.
     */
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

    /**
     * ========================================================
     * RESULTADOS DO CLÃ MONITORADO
     * ========================================================
     *
     * Agrupa os ataques em 0, 1, 2 e 3 estrelas.
     */
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

    /**
     * ========================================================
     * TRIPLAS
     * ========================================================
     */

    const trackedClanTriples =
      trackedClanStarsDistribution.find((row) => row.stars === 3)?.total ?? 0;

    const trackedClanTwoStars =
      trackedClanStarsDistribution.find((row) => row.stars === 2)?.total ?? 0;

    const trackedClanOneStars =
      trackedClanStarsDistribution.find((row) => row.stars === 1)?.total ?? 0;

    const trackedClanZeroStars =
      trackedClanStarsDistribution.find((row) => row.stars === 0)?.total ?? 0;

    /**
     * ========================================================
     * TAXAS
     * ========================================================
     */

    const tripleRate =
      trackedClanAttacks > 0
        ? (trackedClanTriples / trackedClanAttacks) * 100
        : 0;

    /**
     * ========================================================
     * VALIDAÇÃO GERAL
     * ========================================================
     */

    const checks = {
      hasEightClans: clans === 8,

      hasSevenRounds: rounds === 7,

      hasTwentyEightWars: wars === 28,

      allAttacksHaveAttacker: attacksWithoutAttacker === 0,

      allAttacksHaveDefender: attacksWithoutDefender === 0,

      allAttacksHaveAttackerTownHall: attacksWithoutAttackerTownHall === 0,

      allAttacksHaveDefenderTownHall: attacksWithoutDefenderTownHall === 0,

      allAttacksHaveOrder: attacksWithoutOrder === 0,
    };

    const allIntegrityChecksPassed = Object.values(checks).every(Boolean);

    return NextResponse.json({
      success: true,

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

      checks,

      allIntegrityChecksPassed,
    });
  } catch (error) {
    console.error(
      "[Kings of Doom] Erro durante auditoria do arquivo histórico da CWL:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error: "Não foi possível auditar o arquivo histórico da CWL.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Executa uma contagem SQL simples.
 *
 * Aceita múltiplos parâmetros porque algumas
 * auditorias precisam filtrar temporada + clã.
 */
function getCount(sql: string, ...parameters: Array<string | number>): number {
  const row = database.prepare(sql).get(...parameters) as CountRow | undefined;

  return row?.total ?? 0;
}
