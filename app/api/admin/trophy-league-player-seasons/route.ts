/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/trophy-league-player-seasons/route.ts
 *
 * Responsabilidade:
 * Disponibilizar, em ambiente administrativo, o histórico
 * observado da Liga de Troféus agrupado por temporada.
 *
 * A rota:
 *
 * • recebe a playerTag;
 * • consulta o histórico persistido do jogador;
 * • separa os snapshots por leagueSeasonId;
 * • devolve o resumo de cada temporada;
 * • preserva a timeline observada de cada período.
 *
 * Importante:
 *
 * Os movimentos retornados continuam sendo inferências
 * baseadas em snapshots e não representam battle log
 * oficial da Clash API.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { getTrophyLeaguePlayerSeasonHistory } from "@/services/trophy-league-season-history.service";

/**
 * ==========================================================
 * GET
 * ==========================================================
 */

export async function GET(request: Request) {
  /**
   * ========================================================
   * PLAYER TAG
   * ========================================================
   */

  const url = new URL(request.url);

  const playerTag = url.searchParams.get("playerTag");

  if (!playerTag) {
    return NextResponse.json(
      {
        success: false,
        error: "Nenhuma tag de jogador foi informada.",
      },
      {
        status: 400,
      },
    );
  }

  /**
   * ========================================================
   * HISTÓRICO POR TEMPORADA
   * ========================================================
   */

  try {
    const history = getTrophyLeaguePlayerSeasonHistory(playerTag);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("[TROPHY LEAGUE PLAYER SEASONS]", {
      playerTag,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível consultar o histórico por temporada da Liga de Troféus.",
      },
      {
        status: 500,
      },
    );
  }
}
