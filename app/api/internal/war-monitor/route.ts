/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/internal/war-monitor/route.ts
 *
 * Responsabilidade:
 * Executar o ciclo automático de monitoramento das guerras
 * acompanhadas pelo Command Center.
 *
 * Ciclo:
 *
 * 1. coleta o estado atual das guerras;
 * 2. persiste membros e ataques no War Archive;
 * 3. reconcilia guerras antigas com o War Log;
 * 4. finaliza registros encontrados como encerrados.
 *
 * Segurança:
 *
 * • exige KOD_DEV_PROXY_SECRET;
 * • não expõe CLASH_API_TOKEN;
 * • executa somente a rotina oficial do War Monitor;
 * • não funciona como proxy genérico.
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
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { NextResponse } from "next/server";

import { isDevProxyRequestAuthorized } from "@/lib/security/dev-proxy-auth";
import { collectCurrentWars } from "@/services/war-collector.service";
import { reconcileWarHistory } from "@/services/war-reconciliation.service";

/**
 * ==========================================================
 * POST
 * ==========================================================
 */

export async function POST(request: Request) {
  /**
   * ========================================================
   * AUTORIZAÇÃO
   * ========================================================
   */

  try {
    if (!isDevProxyRequestAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Não autorizado.",
        },
        {
          status: 401,
        },
      );
    }
  } catch (error) {
    console.error("[WAR MONITOR] Gateway não configurado:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gateway do War Monitor não configurado.",
      },
      {
        status: 500,
      },
    );
  }

  /**
   * ========================================================
   * EXECUÇÃO
   * ========================================================
   */

  try {
    const startedAt = new Date().toISOString();

    const collector = await collectCurrentWars();

    const reconciliation = await reconcileWarHistory();

    const finishedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,

      data: {
        startedAt,

        finishedAt,

        collector,

        reconciliation,
      },
    });
  } catch (error) {
    console.error("[WAR MONITOR] Falha na execução:", error);

    return NextResponse.json(
      {
        success: false,

        error: "Não foi possível executar o War Monitor.",
      },
      {
        status: 500,
      },
    );
  }
}
