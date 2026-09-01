/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/run-raid-collector.ts
 *
 * Responsabilidade:
 * Executar o Raid Collector fora do Next.js para permitir
 * agendamento automático no servidor.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 31/08/2026
 *
 * Versão:
 * 0.9.4
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const { collectRaidWeekends } =
    await import("../services/raid-collector.service");

  const result = await collectRaidWeekends();

  console.log(
    JSON.stringify(
      {
        collector: "raid-weekend",
        ...result,
      },
      null,
      2,
    ),
  );

  if (result.errors > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[Raid Collector] Falha fatal:", error);

  process.exitCode = 1;
});
