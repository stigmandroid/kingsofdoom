/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/cocbot/verify/route.ts
 *
 * Responsabilidade:
 * Receber solicitações da página pública de verificação
 * do COC Bot e encaminhá-las para a API privada do bot.
 *
 * Segurança:
 * O site não persiste o API Token do jogador.
 * O token é apenas encaminhado para o serviço privado
 * responsável pela validação.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 06/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type VerificationRequestBody = {
  sessionToken?: string;
  playerApiToken?: string;
};

type CocBotVerificationResponse = {
  success?: boolean;
  error?: string;
  player?: {
    tag?: string;
    name?: string | null;
  };
};

/**
 * ==========================================================
 * CONFIGURAÇÃO
 * ==========================================================
 */

function getCocBotApiBaseUrl(): string {
  const baseUrl = process.env.COCBOT_PRIVATE_API_URL;

  if (!baseUrl) {
    throw new Error("A variável COCBOT_PRIVATE_API_URL não foi configurada.");
  }

  return baseUrl.replace(/\/+$/, "");
}

/**
 * ==========================================================
 * POST /api/cocbot/verify
 * ==========================================================
 */

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerificationRequestBody;

    const sessionToken = body.sessionToken?.trim();

    const playerApiToken = body.playerApiToken?.trim();

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification session not provided.",
        },
        {
          status: 400,
        },
      );
    }

    if (!playerApiToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Player API Token not provided.",
        },
        {
          status: 400,
        },
      );
    }

    const cocBotApiBaseUrl = getCocBotApiBaseUrl();

    const privateSecret = process.env.COCBOT_PRIVATE_API_SECRET;

    if (!privateSecret) {
      throw new Error(
        "A variável COCBOT_PRIVATE_API_SECRET não foi configurada.",
      );
    }

    const response = await fetch(
      `${cocBotApiBaseUrl}/verification/${encodeURIComponent(sessionToken)}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-cocbot-private-secret": privateSecret,
        },
        body: JSON.stringify({
          playerApiToken,
        }),
        cache: "no-store",
      },
    );

    const data = (await response.json().catch(() => ({
      success: false,
      error: "Invalid response from COC Bot.",
    }))) as CocBotVerificationResponse;

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[COC Bot Verify Proxy] Erro:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Verification service unavailable.",
      },
      {
        status: 500,
      },
    );
  }
}
