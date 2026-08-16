/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/clash/player/route.ts
 *
 * Responsabilidade:
 * Disponibilizar perfis individuais ao ambiente local através
 * do gateway privado hospedado na VPS.
 *
 * Segurança:
 * - exige KOD_DEV_PROXY_SECRET;
 * - não expõe CLASH_API_TOKEN;
 * - a consulta continua exclusivamente server-side.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isDevProxyRequestAuthorized } from "@/lib/security/dev-proxy-auth";
import { getPlayer } from "@/services/player.service";

export async function GET(request: Request) {
  try {
    if (!isDevProxyRequestAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Não autorizado." },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("[Kings of Doom] Gateway de jogador não configurado:", error);
    return NextResponse.json(
      { success: false, error: "Gateway de jogador não configurado." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const playerTag = url.searchParams.get("tag");

  if (!playerTag || !playerTag.startsWith("#")) {
    return NextResponse.json(
      { success: false, error: "Tag de jogador inválida." },
      { status: 400 },
    );
  }

  try {
    const player = await getPlayer(playerTag);
    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error("[Kings of Doom] Erro no gateway de jogador:", {
      playerTag,
      error,
    });
    return NextResponse.json(
      { success: false, error: "Não foi possível consultar o jogador." },
      { status: 500 },
    );
  }
}
