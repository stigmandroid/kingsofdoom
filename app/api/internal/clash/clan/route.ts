/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/clan/route.ts
 *
 * Responsabilidade:
 * Disponibilizar dados de clã ao ambiente local através
 * do gateway privado hospedado na VPS.
 *
 * Segurança:
 * - exige KOD_DEV_PROXY_SECRET;
 * - aceita somente K.O.D. e K.O.D.rec;
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
import { getClan } from "@/services/clan.service";

const supportedClans = {
  kod: { tag: "#2GQ2UC2PV" },
  "kod-rec": { tag: "#2RU9QG9CG" },
} as const;

type SupportedClanSlug = keyof typeof supportedClans;

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

export async function GET(request: Request) {
  try {
    if (!isDevProxyRequestAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Não autorizado." },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("[Kings of Doom] Gateway de clã não configurado:", error);
    return NextResponse.json(
      { success: false, error: "Gateway de clã não configurado." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const clanSlug = url.searchParams.get("clan");

  if (!clanSlug || !isSupportedClanSlug(clanSlug)) {
    return NextResponse.json(
      { success: false, error: "Clã inválido." },
      { status: 400 },
    );
  }

  try {
    const clan = await getClan(supportedClans[clanSlug].tag);
    return NextResponse.json({ success: true, clan });
  } catch (error) {
    console.error("[Kings of Doom] Erro no gateway de clã:", {
      clanSlug,
      error,
    });
    return NextResponse.json(
      { success: false, error: "Não foi possível consultar o clã." },
      { status: 500 },
    );
  }
}
