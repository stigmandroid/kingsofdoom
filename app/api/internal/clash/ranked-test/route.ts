/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/ranked-test/route.ts
 *
 * Responsabilidade:
 * Investigar possíveis endpoints públicos relacionados ao
 * sistema Ranked / Liga de Troféus diretamente a partir do
 * ambiente autorizado da VPS.
 *
 * Segurança:
 * • exige KOD_DEV_PROXY_SECRET;
 * • não expõe CLASH_API_TOKEN;
 * • executa somente requisições GET;
 * • utiliza uma lista fechada de endpoints candidatos;
 * • não funciona como proxy genérico.
 *
 * Objetivo:
 * verificar se o currentLeagueGroupTag retornado pela
 * Player API pode ser utilizado para consultar informações
 * adicionais da Liga de Troféus, incluindo a possibilidade
 * de histórico de batalhas.
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
 * 🧪 Diagnóstico
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isDevProxyRequestAuthorized } from "@/lib/security/dev-proxy-auth";

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * ==========================================================
 * ENDPOINTS CANDIDATOS
 * ==========================================================
 *
 * Essas rotas ainda não são consideradas parte da
 * arquitetura do Command Center.
 *
 * São utilizadas exclusivamente para diagnóstico.
 */
function buildCandidatePaths(encodedGroupTag: string): string[] {
  return [
    `/leaguegroups/${encodedGroupTag}`,
    `/leaguegroup/${encodedGroupTag}`,

    `/ranked/leaguegroups/${encodedGroupTag}`,
    `/ranked/leaguegroup/${encodedGroupTag}`,

    `/leagues/groups/${encodedGroupTag}`,

    `/players/leaguegroups/${encodedGroupTag}`,

    `/ranked/groups/${encodedGroupTag}`,
  ];
}

/**
 * ==========================================================
 * GET
 * ==========================================================
 */

export async function GET(request: Request) {
  /**
   * ========================================================
   * AUTORIZAÇÃO
   * ========================================================
   */

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
    console.error("[Kings of Doom] Gateway Ranked não configurado:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gateway Ranked não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  /**
   * ========================================================
   * GROUP TAG
   * ========================================================
   */

  const url = new URL(request.url);

  const groupTag = url.searchParams.get("groupTag");

  if (!groupTag) {
    return NextResponse.json(
      {
        success: false,
        error: "Nenhuma League Group Tag foi informada.",
      },
      {
        status: 400,
      },
    );
  }

  /**
   * ========================================================
   * TOKEN
   * ========================================================
   */

  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "CLASH_API_TOKEN não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  const encodedGroupTag = encodeURIComponent(groupTag);

  const candidates = buildCandidatePaths(encodedGroupTag);

  /**
   * ========================================================
   * TESTES
   * ========================================================
   */

  const results = [];

  for (const path of candidates) {
    try {
      const response = await fetch(`${CLASH_API_BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },

        cache: "no-store",
      });

      const rawBody = await response.text();

      let body: unknown | string = rawBody;

      try {
        body = JSON.parse(rawBody);
      } catch {
        // Mantém resposta textual.
      }

      results.push({
        path,

        status: response.status,

        statusText: response.statusText,

        body,
      });
    } catch (error) {
      results.push({
        path,

        status: null,

        statusText: "FETCH_ERROR",

        body: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * ========================================================
   * RESPOSTA
   * ========================================================
   */

  return NextResponse.json({
    success: true,

    data: {
      groupTag,
      testedAt: new Date().toISOString(),

      results,
    },
  });
}
