/**
 * ============================================================================
 * Kings of Doom Command Center
 * Clan Games Collector API
 * ============================================================================
 *
 * Executa a coleta da pontuação atual dos Jogos do Clã.
 *
 * @author stigmandroid
 * @version 0.9.2
 * ============================================================================
 */

import { NextResponse } from "next/server";

import { collectClanGames } from "@/services/clan-games-collector.service";

export async function POST() {
  try {
    const result = await collectClanGames();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Clan Games Collector] Erro:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido.",
      },
      {
        status: 500,
      },
    );
  }
}
