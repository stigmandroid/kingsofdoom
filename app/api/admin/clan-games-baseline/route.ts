/**
 * ============================================================================
 * Kings of Doom Command Center
 * Clan Games Baseline API
 * ============================================================================
 *
 * Responsabilidade:
 * Criar o snapshot inicial de uma edição dos Jogos do Clã.
 *
 * Recebe:
 * - clanTag
 * - season
 *
 * O serviço captura automaticamente:
 * - roster atual do clã;
 * - player tags;
 * - player names;
 * - achievement "Games Champion".
 *
 * Nenhuma pontuação manual é necessária para edições iniciadas
 * corretamente antes dos Jogos do Clã.
 *
 * @author stigmandroid
 * @version 0.9.3
 * ============================================================================
 */

import { NextRequest, NextResponse } from "next/server";

import { captureClanGamesBaseline } from "@/services/clan-games-baseline.service";

/**
 * ============================================================================
 * TIPOS
 * ============================================================================
 */

interface ClanGamesBaselineRequest {
  clanTag?: string;
  season?: string;
}

/**
 * ============================================================================
 * POST
 * ============================================================================
 */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClanGamesBaselineRequest;

    const clanTag = body.clanTag?.trim();
    const season = body.season?.trim();

    /**
     * ----------------------------------------------------------
     * Validação
     * ----------------------------------------------------------
     */

    if (!clanTag) {
      return NextResponse.json(
        {
          success: false,
          error: "clanTag é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!season) {
      return NextResponse.json(
        {
          success: false,
          error: "season é obrigatória.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^#[A-Z0-9]+$/i.test(clanTag)) {
      return NextResponse.json(
        {
          success: false,
          error: "clanTag inválida.",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^\d{4}-\d{2}$/.test(season)) {
      return NextResponse.json(
        {
          success: false,
          error: "season deve utilizar o formato YYYY-MM.",
        },
        {
          status: 400,
        },
      );
    }

    /**
     * ----------------------------------------------------------
     * Captura
     * ----------------------------------------------------------
     */

    const data = await captureClanGamesBaseline(clanTag.toUpperCase(), season);

    return NextResponse.json({
      success: data.success,
      data,
    });
  } catch (error) {
    console.error(
      "[Kings of Doom] Falha ao capturar baseline de Clan Games:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível capturar o baseline de Clan Games.",
      },
      {
        status: 500,
      },
    );
  }
}
