/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/trophy-league-battles/route.ts
 *
 * Responsabilidade:
 * Disponibilizar os dados reais de ataques e defesas da
 * Liga de Troféus ao ambiente local através do gateway
 * privado hospedado na VPS.
 *
 * A rota:
 *
 * • exige KOD_DEV_PROXY_SECRET;
 * • recebe playerTag;
 * • recebe leagueGroupTag;
 * • recebe leagueSeasonId;
 * • consulta diretamente o endpoint leagueGroup da Clash API;
 * • retorna attackLogs e defenseLogs;
 * • não expõe CLASH_API_TOKEN.
 *
 * Segurança:
 *
 * • não funciona como proxy genérico;
 * • aceita somente os parâmetros necessários para a Ranked;
 * • executa apenas requisições GET;
 * • mantém o token da Clash API exclusivamente na VPS.
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
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isDevProxyRequestAuthorized } from "@/lib/security/dev-proxy-auth";

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

type ClashApiError = {
  reason?: string;
  message?: string;
};

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
    console.error(
      "[Kings of Doom] Gateway da Liga de Troféus não configurado:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Gateway da Liga de Troféus não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  /**
   * ========================================================
   * PARÂMETROS
   * ========================================================
   */

  const url = new URL(request.url);

  const playerTag = url.searchParams.get("playerTag");

  const leagueGroupTag = url.searchParams.get("leagueGroupTag");

  const leagueSeasonIdRaw = url.searchParams.get("leagueSeasonId");

  if (!playerTag || !leagueGroupTag || !leagueSeasonIdRaw) {
    return NextResponse.json(
      {
        success: false,
        error: "playerTag, leagueGroupTag e leagueSeasonId são obrigatórios.",
      },
      {
        status: 400,
      },
    );
  }

  const leagueSeasonId = Number(leagueSeasonIdRaw);

  if (!Number.isFinite(leagueSeasonId)) {
    return NextResponse.json(
      {
        success: false,
        error: "leagueSeasonId inválido.",
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

  /**
   * ========================================================
   * LEAGUE GROUP
   * ========================================================
   */

  const path =
    `/leaguegroup/${encodeURIComponent(leagueGroupTag)}/${leagueSeasonId}` +
    `?playerTag=${encodeURIComponent(playerTag)}`;

  try {
    const response = await fetch(`${CLASH_API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },

      cache: "no-store",
    });

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => null)) as ClashApiError | null;

      console.error(
        "[Kings of Doom] Erro ao consultar League Group da Ranked:",
        {
          playerTag,
          leagueGroupTag,
          leagueSeasonId,
          status: response.status,
          reason: error?.reason,
          message: error?.message,
        },
      );

      return NextResponse.json(
        {
          success: false,

          error:
            error?.message ??
            error?.reason ??
            "Não foi possível consultar a Liga de Troféus.",
        },
        {
          status: response.status,
        },
      );
    }

    const data = await response.json();

    /**
     * ======================================================
     * RESPOSTA
     * ======================================================
     *
     * Retornamos somente o payload necessário para o
     * ambiente local.
     */

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[Kings of Doom] Falha ao consultar League Group da Ranked:",
      {
        playerTag,
        leagueGroupTag,
        leagueSeasonId,
        error,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível consultar a Liga de Troféus.",
      },
      {
        status: 500,
      },
    );
  }
}
