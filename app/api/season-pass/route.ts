/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/season-pass/route.ts
 *
 * Responsabilidade:
 * Expor ao frontend o estado público do evento automático
 * do Passe de Temporada da CWL.
 *
 * Segurança:
 *
 * - o vencedor nunca é retornado antes de revealAt;
 * - o sorteio é processado exclusivamente no servidor;
 * - a lista congelada vem do SQLite;
 * - o frontend recebe apenas o estado público do evento.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";
import { getSeasonPassEventState } from "@/services/season-pass.service";

import { isAvailableCwlWarTag } from "@/types/cwl";

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

/**
 * Clãs suportados pelo evento do Passe.
 */
const supportedClans = {
  kod: {
    slug: "kod",
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    slug: "kod-rec",
    tag: "#2RU9QG9CG",
  },
} as const;

/**
 * Slugs válidos.
 */
type SupportedClanSlug = keyof typeof supportedClans;

/**
 * Verifica se o slug informado pertence aos clãs
 * suportados pelo evento.
 */
function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

/**
 * GET /api/season-pass?clan=kod
 *
 * Retorna o estado público atual do evento.
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

    /**
     * Sem temporada disponível não existe
     * evento para processar.
     */
    if (!result.available) {
      return NextResponse.json({
        available: false,

        reason: "Nenhuma temporada da CWL está disponível para este clã.",
      });
    }

    /**
     * Identifica todas as guerras já criadas.
     */
    const availableWars = result.group.rounds.flatMap((round, roundIndex) =>
      round.warTags.filter(isAvailableCwlWarTag).map((warTag) => ({
        warTag,
        roundIndex,
      })),
    );

    /**
     * Consulta simultaneamente as guerras da temporada.
     */
    const warResults = await Promise.all(
      availableWars.map(async ({ warTag, roundIndex }) => ({
        warTag,
        roundIndex,

        result: await getCwlWar(warTag),
      })),
    );

    /**
     * Mantém somente guerras disponíveis.
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
     * Consideramos a temporada encerrada somente quando:
     *
     * - o grupo informa estado ended;
     * - não existe nenhuma guerra ainda em preparação
     *   ou em andamento.
     *
     * A segunda verificação funciona como proteção
     * adicional contra inconsistências temporárias.
     */
    const seasonEnded =
      result.group.state === "ended" &&
      wars.every(({ war }) => war.state === "warEnded");

    /**
     * Delega toda a regra de negócio ao service.
     */
    const eventState = getSeasonPassEventState({
      season: result.group.season,

      clanTag: selectedClan.tag,

      wars,

      seasonEnded,
    });

    return NextResponse.json({
      available: true,

      event: eventState,
    });
  } catch (error) {
    console.error(
      "[Kings of Doom] Erro ao consultar evento do Passe de Temporada:",
      error,
    );

    return NextResponse.json(
      {
        error: "Não foi possível consultar o evento do Passe de Temporada.",
      },
      {
        status: 500,
      },
    );
  }
}
