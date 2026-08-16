/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/war-history/route.ts
 *
 * Responsabilidade:
 * Disponibilizar para o ambiente local o histórico de guerras
 * persistido no SQLite de produção.
 *
 * Objetivo:
 * Garantir que o localhost utilize a mesma fonte histórica
 * da VPS, evitando divergência entre banco local e produção.
 *
 * Segurança:
 * - exige KOD_DEV_PROXY_SECRET;
 * - aceita somente K.O.D. e K.O.D.rec;
 * - não expõe o banco físico;
 * - não funciona como endpoint genérico.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.8.7
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isDevProxyRequestAuthorized } from "@/lib/security/dev-proxy-auth";
import {
  getRecentWarHistory,
  getWarHistoryDetail,
} from "@/services/war-history.service";

const supportedClans = {
  kod: {
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    tag: "#2RU9QG9CG",
  },
} as const;

type SupportedClanSlug = keyof typeof supportedClans;

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

/**
 * GET /api/internal/clash/war-history?clan=kod
 *
 * Lista o histórico recente.
 *
 * GET /api/internal/clash/war-history?clan=kod&warKey=...
 *
 * Retorna o detalhamento completo de uma guerra arquivada.
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
    console.error("[Kings of Doom] Gateway histórico não configurado:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gateway histórico não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  const url = new URL(request.url);

  const clanSlug = url.searchParams.get("clan");
  const warKey = url.searchParams.get("warKey");

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

  const trackedClanTag = supportedClans[clanSlug].tag;

  try {
    if (warKey) {
      const detail = await getWarHistoryDetail({
        trackedClanTag,
        warKey,
      });

      if (!detail) {
        return NextResponse.json(
          {
            success: false,
            error: "Guerra histórica não encontrada.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        success: true,
        detail,
      });
    }

    const wars = await getRecentWarHistory({
      trackedClanTag,
      limit: 20,
    });

    return NextResponse.json({
      success: true,
      wars,
    });
  } catch (error) {
    console.error("[Kings of Doom] Erro no gateway de histórico de guerras:", {
      clanSlug,
      warKey,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível consultar o histórico de guerras.",
      },
      {
        status: 500,
      },
    );
  }
}
