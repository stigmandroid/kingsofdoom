/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/trophy-league-snapshot/route.ts
 *
 * Responsabilidade:
 * Disparar manualmente a coleta dos snapshots da Liga de
 * Troféus para os clãs acompanhados pelo Command Center.
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
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { getClanBySlug } from "@/config/clans";
import { collectTrophyLeagueSnapshots } from "@/services/trophy-league-collector.service";

export async function POST() {
  try {
    const kod = getClanBySlug("kod");
    const kodRec = getClanBySlug("kod-rec");

    if (!kod || !kodRec) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível localizar as configurações dos clãs acompanhados.",
        },
        {
          status: 500,
        },
      );
    }

    const result = await collectTrophyLeagueSnapshots([
      {
        tag: kod.tag,
        name: kod.name,
      },
      {
        tag: kodRec.tag,
        name: kodRec.name,
      },
    ]);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[TROPHY LEAGUE SNAPSHOT API]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível executar a coleta da Liga de Troféus.",
      },
      {
        status: 500,
      },
    );
  }
}
