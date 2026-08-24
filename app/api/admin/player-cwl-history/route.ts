/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/player-cwl-history/route.ts
 *
 * Responsabilidade:
 * Disponibilizar uma visão de diagnóstico do histórico
 * individual de CWL persistido no CWL Archive.
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

import { getPlayerCwlHistory } from "@/services/player-cwl-history.service";

export async function GET(request: Request) {
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
    const data = getPlayerCwlHistory(playerTag);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[PLAYER CWL HISTORY] Erro ao consultar histórico do jogador:",
      {
        playerTag,
        error,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível consultar o histórico de CWL do jogador.",
      },
      {
        status: 500,
      },
    );
  }
}
