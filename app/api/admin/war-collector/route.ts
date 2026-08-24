/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/war-collector/route.ts
 *
 * Responsabilidade:
 * Executar manualmente o War Collector para diagnóstico
 * e futura automação na VPS.
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

import { collectCurrentWars } from "@/services/war-collector.service";

export async function POST() {
  try {
    const data = await collectCurrentWars();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[Kings of Doom] Erro ao executar War Collector:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Não foi possível executar o War Collector.",
      },
      {
        status: 500,
      },
    );
  }
}
