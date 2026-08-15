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
 * 15/08/2026
 *
 * Versão:
 * 0.8.7
 *
 * Status:
 * ✅ Arquivamento multi-clã
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isCwlArchiveRequestAuthorized } from "@/lib/security/cwl-archive-auth";

import {
  archiveCurrentCwl,
  type CwlArchiveResult,
} from "@/services/cwl-archive.service";

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

type ClanArchiveSuccess = {
  slug: SupportedClanSlug;
  name: string;
  tag: string;
  success: true;
  available: true;
  archive: CwlArchiveResult;
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

async function archiveClan(
  clanSlug: SupportedClanSlug,
): Promise<ClanArchiveExecutionResult> {
  const selectedClan = supportedClans[clanSlug];

  try {
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

    const availableWars = result.group.rounds.flatMap((round, roundIndex) =>
      round.warTags.filter(isAvailableCwlWarTag).map((warTag) => ({
        warTag,
        roundIndex,
      })),
    );

    const warResults = await Promise.all(
      availableWars.map(async ({ warTag, roundIndex }) => ({
        warTag,
        roundIndex,
        result: await getCwlWar(warTag),
      })),
    );

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

    const archive = archiveCurrentCwl({
      group: result.group,
      wars,
      trackedClanTag: selectedClan.tag,
    });

    return {
      slug: clanSlug,
      name: selectedClan.name,
      tag: selectedClan.tag,
      success: true,
      available: true,
      archive,
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
