/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player-competitive-snapshot-collector.service.ts
 *
 * Responsabilidade:
 * Coletar o estado competitivo das contas Clash
 * monitoradas permanentemente pela KODA.
 *
 * Funcionalidades:
 * - consulta somente contas com tracking ativo;
 * - busca cada conta diretamente pela Player API;
 * - captura snapshots competitivos quando houver mudança;
 * - atualiza a última consulta bem-sucedida;
 * - isola falhas por jogador;
 * - mantém o acompanhamento independente do clã atual.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { getPlayer } from "@/services/player.service";

import { getActiveTrackedClashAccounts } from "@/services/tracked-clash-account.service";

import { capturePlayerCompetitiveSnapshot } from "@/services/player-competitive-snapshot.service";

import { updateTrackedClashAccountAfterCheck } from "@/repositories/tracked-clash-account.repository";

export type PlayerCompetitiveSnapshotCollectorResult = {
  startedAt: string;
  finishedAt: string;

  accountsProcessed: number;
  snapshotsSaved: number;
  snapshotsUnchanged: number;
  errors: number;
};

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Executa uma coleta das contas Clash atualmente
 * monitoradas pela KODA.
 *
 * Uma falha em uma conta não interrompe a coleta
 * das demais.
 */
export async function collectPlayerCompetitiveSnapshots(): Promise<PlayerCompetitiveSnapshotCollectorResult> {
  const startedAt = new Date().toISOString();

  const accounts = getActiveTrackedClashAccounts();

  let accountsProcessed = 0;
  let snapshotsSaved = 0;
  let snapshotsUnchanged = 0;
  let errors = 0;

  for (const account of accounts) {
    try {
      const player = await getPlayer(account.playerTag);

      const captureResult = capturePlayerCompetitiveSnapshot(player, {
        captureReason: "scheduled_tracking",
      });

      const checkedAt = new Date().toISOString();

      updateTrackedClashAccountAfterCheck(
        account.playerTag,
        player.name,
        checkedAt,
      );

      accountsProcessed += 1;

      if (captureResult.saved) {
        snapshotsSaved += 1;
      } else {
        snapshotsUnchanged += 1;
      }
    } catch (error) {
      errors += 1;

      console.error(
        "[PLAYER COMPETITIVE SNAPSHOT COLLECTOR] Erro ao processar conta",
        {
          playerTag: account.playerTag,
          playerName: account.playerName,
          error,
        },
      );
    }

    await sleep(150);
  }

  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,

    accountsProcessed,
    snapshotsSaved,
    snapshotsUnchanged,
    errors,
  };
}
