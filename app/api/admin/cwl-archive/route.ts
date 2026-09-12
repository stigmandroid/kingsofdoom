/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/cwl-archive/route.ts
 *
 * Responsabilidade:
 * Executar snapshots históricos da Clash War League
 * para TODOS os clãs oficiais suportados pelo portal.
 *
 * Comportamento:
 *
 * POST /api/admin/cwl-archive
 * - arquiva K.O.D. e K.O.D.rec na mesma execução;
 *
 * POST /api/admin/cwl-archive?clan=kod
 * POST /api/admin/cwl-archive?clan=kod-rec
 * - mantém execução individual apenas para diagnóstico.
 *
 * Integração com Passe de Temporada:
 *
 * - somente cria/congela o Passe quando a CWL estiver
 *   definitivamente encerrada;
 * - exige todas as guerras disponíveis carregadas;
 * - exige todas as guerras em warEnded;
 * - utiliza season + clanTag como identidade do evento;
 * - não sobrescreve eventos históricos já sorteados;
 * - pode ser executado repetidamente com segurança.
 *
 * Segurança operacional:
 *
 * - cada clã é consultado e persistido de forma independente;
 * - falha em um clã não impede o diagnóstico do outro;
 * - sucesso parcial nunca é retornado como sucesso completo;
 * - o resultado identifica claramente o estado de cada clã.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 12/09/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * ✅ Arquivamento multi-clã + integração Season Pass
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isCwlArchiveRequestAuthorized } from "@/lib/security/cwl-archive-auth";

import {
  archiveCurrentCwl,
  type CwlArchiveResult,
} from "@/services/cwl-archive.service";

import { ensureSeasonPassEventForEndedCwl } from "@/services/season-pass.service";

import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";

import { isAvailableCwlWarTag } from "@/types/cwl";

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

/**
 * Clãs oficiais que precisam possuir archive independente.
 */
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

/**
 * Diagnóstico público da integração com o Passe.
 */
type SeasonPassArchiveResult = {
  processed: boolean;
  created: boolean;
  season: string;
  eligiblePlayers: number;
  reason?: string;
};

type ClanArchiveSuccess = {
  slug: SupportedClanSlug;
  name: string;
  tag: string;
  success: true;
  available: true;
  archive: CwlArchiveResult;
  seasonPass: SeasonPassArchiveResult;
};

type ClanArchiveUnavailable = {
  slug: SupportedClanSlug;
  name: string;
  tag: string;
  success: false;
  available: false;
  reason: string;
};

type ClanArchiveFailure = {
  slug: SupportedClanSlug;
  name: string;
  tag: string;
  success: false;
  available: true;
  error: string;
};

type ClanArchiveExecutionResult =
  | ClanArchiveSuccess
  | ClanArchiveUnavailable
  | ClanArchiveFailure;

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

/**
 * ==========================================================
 * ARQUIVAMENTO INDIVIDUAL
 * ==========================================================
 */
async function archiveClan(
  clanSlug: SupportedClanSlug,
): Promise<ClanArchiveExecutionResult> {
  const selectedClan = supportedClans[clanSlug];

  try {
    /**
     * Recupera o grupo atual da CWL.
     */
    const result = await getCurrentCwlGroup(selectedClan.tag);

    if (!result.available) {
      return {
        slug: clanSlug,
        name: selectedClan.name,
        tag: selectedClan.tag,
        success: false,
        available: false,
        reason: "Nenhuma temporada CWL disponível para arquivamento.",
      };
    }

    /**
     * Lista todas as war tags que deveriam estar disponíveis
     * nesta fotografia da temporada.
     */
    const availableWars = result.group.rounds.flatMap((round, roundIndex) =>
      round.warTags.filter(isAvailableCwlWarTag).map((warTag) => ({
        warTag,
        roundIndex,
      })),
    );

    /**
     * Consulta cada guerra individualmente.
     */
    const warResults = await Promise.all(
      availableWars.map(async ({ warTag, roundIndex }) => ({
        warTag,
        roundIndex,
        result: await getCwlWar(warTag),
      })),
    );

    /**
     * Mantém apenas guerras efetivamente recuperadas.
     */
    const wars: CwlRoundWar[] = warResults.flatMap(
      ({ warTag, roundIndex, result: warResult }) =>
        warResult.available
          ? [
              {
                warTag,
                roundIndex,
                war: warResult.war,
              },
            ]
          : [],
    );

    /**
     * ========================================================
     * SNAPSHOT HISTÓRICO
     * ========================================================
     *
     * O archive continua sendo realizado mesmo durante
     * a temporada, preservando sua função original.
     */
    const archive = archiveCurrentCwl({
      group: result.group,
      wars,
      trackedClanTag: selectedClan.tag,
    });

    /**
     * ========================================================
     * PASSE DE TEMPORADA
     * ========================================================
     *
     * Para congelar oficialmente o evento, exigimos:
     *
     * 1. grupo CWL marcado como ended;
     * 2. existência de guerras;
     * 3. TODAS as war tags disponíveis recuperadas;
     * 4. TODAS as guerras efetivamente encerradas.
     *
     * Isso impede congelar elegibilidade a partir
     * de um snapshot parcial.
     */
    const allAvailableWarsLoaded =
      availableWars.length > 0 && wars.length === availableWars.length;

    const allWarsEnded =
      wars.length > 0 && wars.every(({ war }) => war.state === "warEnded");

    const seasonDefinitelyEnded =
      result.group.state === "ended" && allAvailableWarsLoaded && allWarsEnded;

    let seasonPass: SeasonPassArchiveResult;

    if (seasonDefinitelyEnded) {
      const ensured = ensureSeasonPassEventForEndedCwl({
        season: result.group.season,
        clanTag: selectedClan.tag,
        wars,
      });

      if (ensured) {
        seasonPass = {
          processed: true,
          created: ensured.created,
          season: result.group.season,
          eligiblePlayers: ensured.eligiblePlayers,
        };
      } else {
        seasonPass = {
          processed: false,
          created: false,
          season: result.group.season,
          eligiblePlayers: 0,
          reason:
            "A temporada parece encerrada, mas o Passe não pôde ser garantido.",
        };
      }
    } else {
      seasonPass = {
        processed: false,
        created: false,
        season: result.group.season,
        eligiblePlayers: 0,
        reason: buildSeasonPassPendingReason({
          groupEnded: result.group.state === "ended",
          expectedWars: availableWars.length,
          loadedWars: wars.length,
          allWarsEnded,
        }),
      };
    }

    return {
      slug: clanSlug,
      name: selectedClan.name,
      tag: selectedClan.tag,
      success: true,
      available: true,
      archive,
      seasonPass,
    };
  } catch (error) {
    console.error(
      `[Kings of Doom] Erro ao arquivar CWL de ${selectedClan.name}:`,
      error,
    );

    return {
      slug: clanSlug,
      name: selectedClan.name,
      tag: selectedClan.tag,
      success: false,
      available: true,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido durante o arquivamento.",
    };
  }
}

/**
 * Explica por que o Passe ainda não foi congelado.
 */
function buildSeasonPassPendingReason({
  groupEnded,
  expectedWars,
  loadedWars,
  allWarsEnded,
}: {
  groupEnded: boolean;
  expectedWars: number;
  loadedWars: number;
  allWarsEnded: boolean;
}): string {
  if (!groupEnded) {
    return "A temporada CWL ainda não está marcada como encerrada.";
  }

  if (expectedWars === 0) {
    return "Nenhuma guerra disponível foi encontrada para a temporada.";
  }

  if (loadedWars !== expectedWars) {
    return `Snapshot incompleto: ${loadedWars}/${expectedWars} guerras foram carregadas.`;
  }

  if (!allWarsEnded) {
    return "Ainda existe pelo menos uma guerra que não está em warEnded.";
  }

  return "A temporada ainda não atende aos critérios para congelamento do Passe.";
}

/**
 * ==========================================================
 * ENDPOINT
 * ==========================================================
 */
export async function POST(request: Request) {
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
  } catch (error) {
    console.error(
      "[Kings of Doom] Falha de configuração da proteção do archive:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Proteção administrativa não configurada.",
      },
      {
        status: 500,
      },
    );
  }

  const url = new URL(request.url);

  const requestedClan = url.searchParams.get("clan");

  /**
   * ========================================================
   * EXECUÇÃO INDIVIDUAL
   * ========================================================
   */
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

    const result = await archiveClan(requestedClan);

    return NextResponse.json(
      {
        success: result.success,
        mode: "single",
        results: [result],
      },
      {
        status: result.success ? 200 : result.available ? 500 : 404,
      },
    );
  }

  /**
   * ========================================================
   * EXECUÇÃO MULTI-CLÃ
   * ========================================================
   */
  const clanSlugs = Object.keys(supportedClans) as SupportedClanSlug[];

  const results = await Promise.all(
    clanSlugs.map((clanSlug) => archiveClan(clanSlug)),
  );

  const successful = results.filter((result) => result.success);

  const failed = results.filter((result) => !result.success);

  const complete = successful.length === clanSlugs.length;

  return NextResponse.json(
    {
      success: complete,
      complete,
      mode: "all",

      expectedClans: clanSlugs.length,
      archivedClans: successful.length,
      failedClans: failed.length,

      results,
    },
    {
      status:
        successful.length === clanSlugs.length
          ? 200
          : successful.length > 0
            ? 207
            : 503,
    },
  );
}
