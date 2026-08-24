/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/player-war-history/route.ts
 *
 * Responsabilidade:
 * Disponibilizar uma visão de diagnóstico do histórico
 * individual de guerras persistido no War Archive.
 *
 * A rota permite validar:
 *
 * • guerras participadas;
 * • ataques realizados;
 * • ataques não utilizados;
 * • estrelas;
 * • média de estrelas;
 * • média de destruição;
 * • triples;
 * • taxa de triples;
 * • histórico cronológico por guerra.
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

import { getPlayerWarHistory } from "@/services/player-war-history.service";

/**
 * ==========================================================
 * GET
 * ==========================================================
 */

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
    const data = getPlayerWarHistory(playerTag);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[PLAYER WAR HISTORY] Erro ao consultar histórico do jogador",
      {
        playerTag,
        error,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível consultar o histórico de guerras do jogador.",
      },
      {
        status: 500,
      },
    );
  }
}
