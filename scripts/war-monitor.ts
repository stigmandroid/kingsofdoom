/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/war-monitor.ts
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

import { collectCurrentWars } from "../services/war-collector.service";
import { reconcileWarHistory } from "../services/war-reconciliation.service";

/**
 * ==========================================================
 * EXECUÇÃO
 * ==========================================================
 */

async function main() {
  const startedAt = new Date().toISOString();

  console.log(`[WAR MONITOR] Início ${startedAt}`);

  /**
   * ========================================================
   * COLETA
   * ========================================================
   */

  const collector = await collectCurrentWars();

  console.log("[WAR MONITOR] Collector:", {
    clansProcessed: collector.clansProcessed,

    warsArchived: collector.warsArchived,

    errors: collector.errors,
  });

  /**
   * ========================================================
   * RECONCILIAÇÃO
   * ========================================================
   */

  const reconciliation = await reconcileWarHistory();

  console.log("[WAR MONITOR] Reconciliation:", {
    openWars: reconciliation.totalOpenWars,

    matchedWars: reconciliation.totalMatchedWars,

    updatedWars: reconciliation.totalUpdatedWars,

    unmatchedWars: reconciliation.totalUnmatchedWars,

    errors: reconciliation.totalErrors,
  });

  console.log(`[WAR MONITOR] Finalizado ${new Date().toISOString()}`);
}

main().catch((error) => {
  console.error("[WAR MONITOR] Falha fatal:", error);

  process.exitCode = 1;
});
