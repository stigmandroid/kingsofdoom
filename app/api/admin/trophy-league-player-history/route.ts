/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/trophy-league-player-history/route.ts
 *
 * Responsabilidade:
 * Disponibilizar, em ambiente administrativo, o histórico
 * observado da Liga de Troféus de um jogador.
 *
 * A rota:
 *
 * • recebe a playerTag;
 * • consulta os snapshots persistidos;
 * • monta a linha do tempo cronológica;
 * • calcula deltas entre capturas consecutivas;
 * • devolve o resumo observado da evolução do jogador.
 *
 * Importante:
 *
 * Os deltas representam somente variações observadas entre
 * snapshots. Eles não devem ser interpretados como ataques
 * ou defesas individuais confirmados.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { getTrophyLeaguePlayerHistory } from "@/services/trophy-league-history.service";

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
   * HISTÓRICO
   * ========================================================
   */

  try {
    const history = getTrophyLeaguePlayerHistory(playerTag);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("[TROPHY LEAGUE PLAYER HISTORY]", {
      playerTag,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível consultar o histórico da Liga de Troféus.",
      },
      {
        status: 500,
      },
    );
  }
}
