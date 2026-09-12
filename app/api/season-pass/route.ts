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
 * - o frontend recebe apenas o estado público do evento;
 * - após a CWL desaparecer da Clash API, o evento persistido
 *   continua acessível e pode concluir seu ciclo normalmente.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 12/08/2026
 *
 * Versão:
 * 0.8.6
 *
 * Status:
 * ✅ Correção pós-CWL
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";
import { getLatestCwlPostSeasonSummary } from "@/services/cwl-archive.service";
import {
  getPersistedSeasonPassEventState,
  getSeasonPassEventState,
  ensureSeasonPassEventForEndedCwl,
} from "@/services/season-pass.service";

import { isAvailableCwlWarTag } from "@/types/cwl";

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

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

type SupportedClanSlug = keyof typeof supportedClans;

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clanSlug = url.searchParams.get("clan");

    if (!clanSlug || !isSupportedClanSlug(clanSlug)) {
      return NextResponse.json({ error: "Clã inválido." }, { status: 400 });
    }

    const selectedClan = supportedClans[clanSlug];
    const result = await getCurrentCwlGroup(selectedClan.tag);

    if (!result.available) {
      /**
       * A Clash API já não possui mais a CWL encerrada.
       *
       * Nesse cenário, usamos a última temporada arquivada
       * como fonte oficial da season atual do portal.
       */
      const archivedSeason = getLatestCwlPostSeasonSummary(selectedClan.tag);

      if (archivedSeason) {
        /**
         * Garante que a temporada arquivada possua seu próprio
         * evento de Passe.
         *
         * Isso também corrige temporadas encerradas que foram
         * arquivadas antes da criação do evento do Passe.
         */
        ensureSeasonPassEventForEndedCwl({
          season: archivedSeason.season,
          clanTag: selectedClan.tag,
          wars: archivedSeason.wars,
        });

        /**
         * Busca exclusivamente o Passe da mesma temporada
         * arquivada.
         *
         * Nunca reutiliza vencedor de uma season anterior.
         */
        const persistedEvent = getPersistedSeasonPassEventState({
          clanTag: selectedClan.tag,
          season: archivedSeason.season,
        });

        if (persistedEvent) {
          return NextResponse.json({
            available: true,
            event: persistedEvent,
          });
        }
      }

      return NextResponse.json({
        available: false,
        reason: "Nenhuma temporada da CWL está disponível para este clã.",
      });
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

    const allAvailableWarsLoaded =
      availableWars.length > 0 && wars.length === availableWars.length;

    const allWarsEnded =
      wars.length > 0 && wars.every(({ war }) => war.state === "warEnded");

    const seasonEnded =
      result.group.state === "ended" && allAvailableWarsLoaded && allWarsEnded;

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
      { error: "Não foi possível consultar o evento do Passe de Temporada." },
      { status: 500 },
    );
  }
}
