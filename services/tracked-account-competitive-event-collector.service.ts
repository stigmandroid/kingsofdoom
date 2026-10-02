/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/tracked-account-competitive-event-collector.service.ts
 *
 * Responsabilidade:
 * Descobrir e arquivar eventos competitivos das contas
 * Clash atualmente monitoradas pela KODA.
 *
 * Estratégia:
 *
 * - utiliza somente contas com tracking ativo;
 * - consulta a conta pela TAG;
 * - descobre o clã atual da conta;
 * - consulta guerra normal do clã atual;
 * - consulta CWL do clã atual;
 * - reutiliza os arquivadores existentes;
 * - não depende dos clãs fixos da organização;
 * - uma falha individual não interrompe as demais contas.
 *
 * ==========================================================
 */

import { getPlayer } from "@/services/player.service";

import { getActiveTrackedClashAccounts } from "@/services/tracked-clash-account.service";

import { getCurrentWar } from "@/services/war.service";
import { archiveCurrentWar } from "@/services/war-archive.service";

import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";

import { archiveCurrentCwl } from "@/services/cwl-archive.service";

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

export type TrackedAccountCompetitiveEventResult = {
  playerTag: string;
  playerName: string | null;

  clanTag: string | null;

  regularWar: {
    checked: boolean;
    archived: boolean;
    reason?: string;
  };

  cwl: {
    checked: boolean;
    archived: boolean;
    season?: string;
    warsChecked: number;
    warsAvailable: number;
    reason?: string;
  };

  error?: string;
};

export type TrackedAccountCompetitiveEventCollectorResult = {
  startedAt: string;
  finishedAt: string;

  accountsProcessed: number;

  accountsWithClan: number;

  regularWarsArchived: number;

  cwlSeasonsArchived: number;

  cwlWarsArchived: number;

  errors: number;

  accounts: TrackedAccountCompetitiveEventResult[];
};

/**
 * Pequena pausa entre contas para reduzir pressão sobre
 * a Clash API.
 */
function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Coleta guerra normal + CWL do clã atualmente pertencente
 * a cada conta rastreada.
 *
 * A TAG da conta é a identidade permanente.
 * O clã é descoberto dinamicamente a cada execução.
 */
export async function collectTrackedAccountCompetitiveEvents(): Promise<TrackedAccountCompetitiveEventCollectorResult> {
  const startedAt = new Date().toISOString();

  const accounts = getActiveTrackedClashAccounts();

  const results: TrackedAccountCompetitiveEventResult[] = [];

  let accountsProcessed = 0;
  let accountsWithClan = 0;

  let regularWarsArchived = 0;

  let cwlSeasonsArchived = 0;
  let cwlWarsArchived = 0;

  let errors = 0;

  for (const account of accounts) {
    const result: TrackedAccountCompetitiveEventResult = {
      playerTag: account.playerTag,
      playerName: account.playerName ?? null,

      clanTag: null,

      regularWar: {
        checked: false,
        archived: false,
      },

      cwl: {
        checked: false,
        archived: false,
        warsChecked: 0,
        warsAvailable: 0,
      },
    };

    try {
      /**
       * ======================================================
       * 1. DESCOBRIR O CLÃ ATUAL DA CONTA
       * ======================================================
       */

      const player = await getPlayer(account.playerTag);

      result.playerName = player.name;

      const clanTag = player.clan?.tag ?? null;

      result.clanTag = clanTag;

      if (!clanTag) {
        results.push(result);

        accountsProcessed += 1;

        await sleep(150);

        continue;
      }

      accountsWithClan += 1;

      /**
       * ======================================================
       * 2. GUERRA NORMAL
       * ======================================================
       */

      try {
        result.regularWar.checked = true;

        const currentWar = await getCurrentWar(clanTag);

        if (currentWar.available) {
          const archive = archiveCurrentWar({
            war: currentWar.war,
            trackedClanTag: clanTag,
          });

          result.regularWar.archived = true;

          regularWarsArchived += 1;

          console.log(
            "[TRACKED ACCOUNT COMPETITIVE COLLECTOR] Guerra arquivada",
            {
              playerTag: account.playerTag,
              clanTag,
              warKey: archive.warKey,
              result: archive.result,
            },
          );
        } else {
          result.regularWar.reason = currentWar.reason;
        }
      } catch (error) {
        result.regularWar.reason =
          error instanceof Error
            ? error.message
            : "Erro desconhecido na guerra normal.";

        console.error(
          "[TRACKED ACCOUNT COMPETITIVE COLLECTOR] Erro na guerra normal",
          {
            playerTag: account.playerTag,
            clanTag,
            error,
          },
        );
      }

      /**
       * ======================================================
       * 3. CWL
       * ======================================================
       */

      try {
        result.cwl.checked = true;

        const cwlGroupResult = await getCurrentCwlGroup(clanTag);

        if (!cwlGroupResult.available) {
          result.cwl.reason = cwlGroupResult.reason;
        } else {
          const group = cwlGroupResult.group;

          result.cwl.season = group.season;

          /**
           * Cada rodada do grupo aponta para guerras.
           *
           * O arquivador espera CwlRoundWar[].
           */
          const wars: CwlRoundWar[] = [];

          for (
            let roundIndex = 0;
            roundIndex < group.rounds.length;
            roundIndex += 1
          ) {
            const round = group.rounds[roundIndex];

            /**
             * O formato de CwlRoundWar existente no projeto
             * precisa carregar a guerra junto do roundIndex.
             *
             * Rodadas ainda sem warTag são ignoradas aqui.
             */
            for (const warReference of round.warTags ?? []) {
              if (!warReference || warReference === "#0") {
                continue;
              }

              result.cwl.warsChecked += 1;

              const warResult = await getCwlWar(warReference);

              if (!warResult.available) {
                continue;
              }

              result.cwl.warsAvailable += 1;

              wars.push({
                roundIndex,
                warTag: warReference,
                war: warResult.war,
              });
            }
          }

          /**
           * Mesmo que nenhuma guerra esteja disponível,
           * a temporada ainda pode ser arquivada.
           *
           * Isso preserva a estrutura da temporada e suas
           * rodadas futuras.
           */
          const archive = archiveCurrentCwl({
            group,
            wars,
            trackedClanTag: clanTag,
          });

          result.cwl.archived = true;

          cwlSeasonsArchived += 1;

          cwlWarsArchived += archive.wars;

          console.log("[TRACKED ACCOUNT COMPETITIVE COLLECTOR] CWL arquivada", {
            playerTag: account.playerTag,
            clanTag,
            season: archive.season,
            wars: archive.wars,
          });
        }
      } catch (error) {
        result.cwl.reason =
          error instanceof Error ? error.message : "Erro desconhecido na CWL.";

        console.error("[TRACKED ACCOUNT COMPETITIVE COLLECTOR] Erro na CWL", {
          playerTag: account.playerTag,
          clanTag,
          error,
        });
      }

      accountsProcessed += 1;
    } catch (error) {
      errors += 1;

      result.error =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao processar conta.";

      console.error(
        "[TRACKED ACCOUNT COMPETITIVE COLLECTOR] Erro ao processar conta",
        {
          playerTag: account.playerTag,
          playerName: account.playerName,
          error,
        },
      );
    }

    results.push(result);

    await sleep(150);
  }

  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,

    accountsProcessed,

    accountsWithClan,

    regularWarsArchived,

    cwlSeasonsArchived,

    cwlWarsArchived,

    errors,

    accounts: results,
  };
}
