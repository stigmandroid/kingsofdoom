/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/current-war/route.ts
 *
 * Responsabilidade:
 * Servir como gateway privado entre o ambiente local de
 * desenvolvimento e a Clash API.
 *
 * Fluxo:
 *
 * localhost
 *   ↓
 * VPS /api/internal/clash/current-war
 *   ↓
 * Clash API
 *
 * Objetivo:
 * Eliminar a dependência do IP residencial na chave da
 * Supercell. A Clash API passa a enxergar somente o IP
 * autorizado da VPS.
 *
 * Segurança:
 *
 * - exige KOD_DEV_PROXY_SECRET;
 * - aceita somente os clãs oficialmente suportados;
 * - não expõe CLASH_API_TOKEN;
 * - não funciona como proxy genérico.
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
import { getCurrentWar } from "@/services/war.service";

/**
 * Clãs que podem ser consultados através do gateway.
 *
 * Nenhuma tag arbitrária recebida do cliente será encaminhada
 * para a Clash API.
 */
const supportedClans = {
  kod: {
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
} as const;

type SupportedClanSlug = keyof typeof supportedClans;

/**
 * Valida o slug recebido pela URL.
 */
function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

/**
 * GET /api/internal/clash/current-war?clan=kod
 *
 * Retorna a mesma estrutura utilizada por getCurrentWar(),
 * permitindo que o ambiente local consuma o resultado sem
 * conhecer a chave privada da Supercell utilizada pela VPS.
 */
export async function GET(request: Request) {
  /**
   * A autorização é verificada antes de qualquer chamada
   * externa.
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
      "[Kings of Doom] Gateway de desenvolvimento não configurado:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Gateway de desenvolvimento não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  const url = new URL(request.url);

  const clanSlug = url.searchParams.get("clan");

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

  const selectedClan = supportedClans[clanSlug];

  try {
    /**
     * Na VPS, NODE_ENV é production.
     *
     * Portanto getCurrentWar() consulta a Clash API
     * diretamente utilizando o CLASH_API_TOKEN da VPS.
     */
    const result = await getCurrentWar(selectedClan.tag);

    return NextResponse.json({
      success: true,

      clan: {
        slug: clanSlug,
        name: selectedClan.name,
        tag: selectedClan.tag,
      },

      result,
    });
  } catch (error) {
    console.error(
      `[Kings of Doom] Erro no gateway de guerra para ${selectedClan.name}:`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível consultar a guerra.",
      },
      {
        status: 500,
      },
    );
  }
}
