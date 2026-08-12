/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/cwl-archive/route.ts
 *
 * Responsabilidade:
 * Executar manualmente um snapshot histórico da
 * temporada atual da Clash War League.
 *
 * Objetivo:
 * Permitir arquivar imediatamente os dados da CWL
 * enquanto validamos o mecanismo de persistência.
 *
 * Segurança:
 * Esta rota é temporária e deve ser protegida antes
 * de permanecer disponível em produção.
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

import { archiveCurrentCwl } from "@/services/cwl-archive.service";
import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";

import { isAvailableCwlWarTag } from "@/types/cwl";

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

/**
 * Clãs suportados pelo arquivamento manual.
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
 * POST /api/admin/cwl-archive?clan=kod
 *
 * Executa um snapshot completo da temporada atual.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    const clanSlug = url.searchParams.get("clan");

    /**
     * Valida o parâmetro obrigatório.
     */
    if (!clanSlug || !isSupportedClanSlug(clanSlug)) {
      return NextResponse.json(
        {
          error: "Clã inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const selectedClan = supportedClans[clanSlug];

    /**
     * Consulta o grupo atual da CWL.
     */
    const result = await getCurrentCwlGroup(selectedClan.tag);

    if (!result.available) {
      return NextResponse.json(
        {
          available: false,
          reason: "Nenhuma temporada CWL disponível para arquivamento.",
        },
        {
          status: 404,
        },
      );
    }

    /**
     * Reúne todas as guerras já criadas
     * em todas as rodadas.
     */
    const availableWars = result.group.rounds.flatMap((round, roundIndex) =>
      round.warTags.filter(isAvailableCwlWarTag).map((warTag) => ({
        warTag,
        roundIndex,
      })),
    );

    /**
     * Consulta simultaneamente todas as guerras
     * disponíveis da temporada.
     */
    const warResults = await Promise.all(
      availableWars.map(async ({ warTag, roundIndex }) => ({
        warTag,
        roundIndex,

        result: await getCwlWar(warTag),
      })),
    );

    /**
     * Mantém somente guerras consultadas
     * com sucesso.
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
     * Executa o arquivamento completo.
     */
    const archive = archiveCurrentCwl({
      group: result.group,
      wars,
      trackedClanTag: selectedClan.tag,
    });

    return NextResponse.json({
      success: true,
      archive,
    });
  } catch (error) {
    console.error("[Kings of Doom] Erro ao arquivar CWL:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível arquivar a CWL.",
      },
      {
        status: 500,
      },
    );
  }
}
