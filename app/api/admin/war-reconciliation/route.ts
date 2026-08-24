/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/war-reconciliation/route.ts
 *
 * Responsabilidade:
 * Executar manualmente a reconciliação do histórico de
 * guerras durante diagnóstico e validação.
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

import { reconcileWarHistory } from "@/services/war-reconciliation.service";

export async function POST() {
  try {
    const data = await reconcileWarHistory();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[Kings of Doom] Falha na reconciliação das guerras:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Não foi possível reconciliar o histórico de guerras.",
      },
      {
        status: 500,
      },
    );
  }
}
