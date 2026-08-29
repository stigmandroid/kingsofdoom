/**
 * ============================================================================
 * Kings of Doom Command Center
 * Clan Games Collector API
 * ============================================================================
 *
 * Responsabilidade:
 * Executar a coleta da pontuação atual dos Jogos do Clã.
 *
 * Segurança:
 * A execução é restrita às chamadas administrativas autorizadas
 * através do segredo interno dos Jogos do Clã.
 *
 * @author stigmandroid
 * @version 0.9.3
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";

import { isClanGamesRequestAuthorized } from "@/lib/security/clan-games-auth";
import { collectClanGames } from "@/services/clan-games-collector.service";

/**
 * ============================================================================
 * POST
 * ============================================================================
 */

export async function POST(request: NextRequest) {
  try {
    /**
     * ------------------------------------------------------------------------
     * Autorização administrativa
     * ------------------------------------------------------------------------
     */

    if (!isClanGamesRequestAuthorized(request)) {
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

    /**
     * ------------------------------------------------------------------------
     * Coleta
     * ------------------------------------------------------------------------
     */

    const result = await collectClanGames();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Clan Games Collector] Erro:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido.",
      },
      {
        status: 500,
      },
    );
  }
}
