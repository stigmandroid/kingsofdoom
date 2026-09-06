/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/cocbot/verification/[token]/route.ts
 *
 * Responsabilidade:
 * Consultar uma sessão de verificação do COC Bot e
 * retornar somente os dados públicos necessários para
 * a página de verificação.
 *
 * Segurança:
 * A comunicação com o COC Bot utiliza autenticação privada.
 * Nenhum segredo interno é enviado ao navegador.
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
 * GET /api/cocbot/verification/[token]
 * ==========================================================
 */

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      token: string;
    }>;
  },
) {
  try {
    const { token } = await context.params;

    const baseUrl = process.env.COCBOT_PRIVATE_API_URL;

    const privateSecret = process.env.COCBOT_PRIVATE_API_SECRET;

    if (!baseUrl || !privateSecret) {
      throw new Error("COC Bot private API configuration is missing.");
    }

    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/verification/${encodeURIComponent(token)}`,
      {
        headers: {
          Accept: "application/json",
          "x-cocbot-private-secret": privateSecret,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("[COC Bot Verification GET] Erro:", error);

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
