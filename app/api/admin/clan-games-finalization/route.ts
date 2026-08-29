/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/clan-games-finalization/route.ts
 *
 * Responsabilidade:
 * Expor operações administrativas de reconciliação e
 * finalização dos Jogos do Clã.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 29/08/2026
 *
 * Versão:
 * 0.9.3
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextRequest, NextResponse } from "next/server";

import {
  finalizeClanGamesEvent,
  getClanGamesFinalizationReadiness,
  prepareClanGamesFinalization,
} from "@/services/clan-games-lifecycle.service";

type FinalizationAction = "prepare" | "status" | "finalize";

interface FinalizationRequest {
  eventId?: number;
  action?: FinalizationAction;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FinalizationRequest;

    const eventId = Number(body.eventId);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "eventId inválido.",
        },
        { status: 400 },
      );
    }

    switch (body.action) {
      case "prepare": {
        const result = await prepareClanGamesFinalization(eventId);

        return NextResponse.json(result);
      }

      case "status": {
        const result = getClanGamesFinalizationReadiness(eventId);

        return NextResponse.json({
          success: true,
          eventId,
          ...result,
        });
      }

      case "finalize": {
        const result = finalizeClanGamesEvent(eventId);

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação inválida. Use "prepare", "status" ou "finalize".',
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[Clan Games Finalization] Erro:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido.",
      },
      { status: 500 },
    );
  }
}
