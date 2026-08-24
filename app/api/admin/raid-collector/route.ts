/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/raid-collector/route.ts
 *
 * Responsabilidade:
 * Executar manualmente o coletor de Raid Weekends para
 * diagnóstico e validação da persistência.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 24/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🧪 Diagnóstico
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { collectRaidWeekends } from "@/services/raid-collector.service";

/**
 * ==========================================================
 * POST
 * ==========================================================
 */

export async function POST() {
  try {
    const data = await collectRaidWeekends();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[Kings of Doom] Falha ao executar Raid Collector:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível executar o Raid Collector.",
      },
      {
        status: 500,
      },
    );
  }
}
