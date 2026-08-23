/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/ranked-battle-test/route.ts
 *
 * Responsabilidade:
 * Testar endpoints relacionados ao histórico de batalhas da
 * Liga de Troféus utilizando a Clash API diretamente a partir
 * da VPS autorizada.
 *
 * O endpoint verifica:
 *
 * • battle log individual do jogador;
 * • league group da temporada atual;
 * • attackLogs;
 * • defenseLogs;
 * • estrelas;
 * • percentual de destruição;
 * • adversário;
 * • horário da batalha.
 *
 * Importante:
 *
 * Esta rota é somente diagnóstica e deve ser removida ou
 * protegida definitivamente após a validação dos endpoints.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🧪 Diagnóstico
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isDevProxyRequestAuthorized } from "@/lib/security/dev-proxy-auth";
import { getPlayer } from "@/services/player.service";

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type ClashApiResponse = {
  status: number;
  statusText: string;
  body: unknown;
};

/**
 * ==========================================================
 * FETCH AUXILIAR
 * ==========================================================
 */

async function testClashEndpoint(path: string): Promise<ClashApiResponse> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error("CLASH_API_TOKEN não configurado.");
  }

  const response = await fetch(`${CLASH_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,

      Accept: "application/json",
    },

    cache: "no-store",
  });

  const text = await response.text();

  let body: unknown = text;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return {
    status: response.status,

    statusText: response.statusText,

    body,
  };
}

/**
 * ==========================================================
 * GET
 * ==========================================================
 */

export async function GET(request: Request) {
  try {
    if (!isDevProxyRequestAuthorized(request)) {
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
    console.error("[RANKED BATTLE TEST] Gateway não configurado", error);

    return NextResponse.json(
      {
        success: false,

        error: "Gateway não configurado.",
      },
      {
        status: 500,
      },
    );
  }

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

        error: "playerTag não informado.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    /**
     * ======================================================
     * PLAYER
     * ======================================================
     */

    const player = await getPlayer(playerTag);

    const groupTag = player.currentLeagueGroupTag;

    const seasonId = player.currentLeagueSeasonId;

    /**
     * ======================================================
     * TESTE 1 — BATTLE LOG
     * ======================================================
     */

    const battleLogPath = `/players/${encodeURIComponent(
      player.tag,
    )}/battlelog`;

    const battleLog = await testClashEndpoint(battleLogPath);

    /**
     * ======================================================
     * TESTE 2 — LEAGUE GROUP
     * ======================================================
     */

    let leagueGroup: ClashApiResponse | null = null;

    let leagueGroupPath: string | null = null;

    if (groupTag && seasonId) {
      leagueGroupPath = `/leaguegroup/${encodeURIComponent(
        groupTag,
      )}/${seasonId}?playerTag=${encodeURIComponent(player.tag)}`;

      leagueGroup = await testClashEndpoint(leagueGroupPath);
    }

    /**
     * ======================================================
     * RESULTADO
     * ======================================================
     */

    return NextResponse.json({
      success: true,

      data: {
        player: {
          name: player.name,

          tag: player.tag,

          trophies: player.trophies,

          leagueTier: player.leagueTier?.name ?? null,

          currentLeagueGroupTag: groupTag ?? null,

          currentLeagueSeasonId: seasonId ?? null,
        },

        battleLog: {
          path: battleLogPath,

          result: battleLog,
        },

        leagueGroup: {
          path: leagueGroupPath,

          result: leagueGroup,
        },
      },
    });
  } catch (error) {
    console.error("[RANKED BATTLE TEST] Erro", {
      playerTag,
      error,
    });

    return NextResponse.json(
      {
        success: false,

        error: "Não foi possível executar o teste da Ranked League.",
      },
      {
        status: 500,
      },
    );
  }
}
