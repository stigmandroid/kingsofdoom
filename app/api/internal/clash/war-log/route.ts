/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/war-log/route.ts
 *
 * Responsabilidade:
 * Disponibilizar o War Log dos clãs monitorados ao ambiente
 * local através do gateway privado hospedado na VPS.
 *
 * A rota:
 *
 * • exige KOD_DEV_PROXY_SECRET;
 * • aceita somente K.O.D. e K.O.D.rec;
 * • consulta diretamente a Clash API a partir da VPS;
 * • não expõe CLASH_API_TOKEN;
 * • retorna somente os itens do War Log.
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

const supportedClans = {
  kod: {
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    tag: "#2RU9QG9CG",
  },
} as const;

type SupportedClanSlug = keyof typeof supportedClans;

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type ClashApiError = {
  reason?: string;

  message?: string;
};

type ClashWarLogResponse = {
  items?: unknown[];
};

/**
 * ==========================================================
 * HELPERS
 * ==========================================================
 */

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
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
    console.error("[Kings of Doom] Gateway do War Log não configurado:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Gateway do War Log não configurado.",
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

  const clanSlug = url.searchParams.get("clan");

  const limitRaw = url.searchParams.get("limit");

  if (!clanSlug || !isSupportedClanSlug(clanSlug)) {
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

  const limit = Math.max(1, Math.min(100, Number(limitRaw ?? "20") || 20));

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
   * CONSULTA WAR LOG
   * ========================================================
   */

  const clanTag = supportedClans[clanSlug].tag;

  const query = new URLSearchParams({
    limit: String(limit),
  });

  try {
    const response = await fetch(
      `${CLASH_API_BASE_URL}/clans/${encodeURIComponent(
        clanTag,
      )}/warlog?${query.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,

          Accept: "application/json",
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => null)) as ClashApiError | null;

      console.error("[Kings of Doom] Erro ao consultar War Log:", {
        clanSlug,

        clanTag,

        status: response.status,

        reason: error?.reason,

        message: error?.message,
      });

      return NextResponse.json(
        {
          success: false,

          error:
            error?.message ??
            error?.reason ??
            "Não foi possível consultar o War Log.",
        },
        {
          status: response.status,
        },
      );
    }

    const data = (await response.json()) as ClashWarLogResponse;

    return NextResponse.json({
      success: true,

      items: data.items ?? [],
    });
  } catch (error) {
    console.error("[Kings of Doom] Falha ao consultar War Log:", {
      clanSlug,

      clanTag,

      error,
    });

    return NextResponse.json(
      {
        success: false,

        error: "Não foi possível consultar o War Log.",
      },
      {
        status: 500,
      },
    );
  }
}
