/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war-reconciliation.service.ts
 *
 * Responsabilidade:
 * Reconciliar guerras persistidas que permaneceram em estado
 * "ongoing" utilizando o War Log oficial do clã.
 *
 * Estratégia:
 *
 * • localiza guerras abertas no SQLite;
 * • consulta o War Log dos clãs monitorados;
 * • procura correspondência por:
 *   - tracked clan;
 *   - opponent tag;
 *   - endTime;
 * • converte o resultado do War Log:
 *   - win  -> win;
 *   - lose -> loss;
 *   - tie  -> draw;
 * • atualiza state para warEnded;
 * • preserva membros e ataques já persistidos.
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

import { database } from "@/lib/db/database";

import { getWarLog, type WarLogEntry } from "@/services/war-log.service";

/**
 * ==========================================================
 * CLÃS MONITORADOS
 * ==========================================================
 */

const monitoredClans = [
  {
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },
  {
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
] as const;

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type OpenWarRow = {
  id: number;

  tracked_clan_tag: string;

  opponent_tag: string;

  end_time: string | null;

  result: "preparation" | "ongoing" | "win" | "loss" | "draw";
};

export type WarReconciliationClanResult = {
  clanName: string;

  clanTag: string;

  openWars: number;

  matchedWars: number;

  updatedWars: number;

  unmatchedWars: number;

  errors: number;
};

export type WarReconciliationResult = {
  startedAt: string;

  finishedAt: string;

  totalOpenWars: number;

  totalMatchedWars: number;

  totalUpdatedWars: number;

  totalUnmatchedWars: number;

  totalErrors: number;

  clans: WarReconciliationClanResult[];
};

/**
 * ==========================================================
 * HELPERS
 * ==========================================================
 */

function mapWarLogResult(
  result: WarLogEntry["result"],
): "win" | "loss" | "draw" {
  switch (result) {
    case "win":
      return "win";

    case "lose":
      return "loss";

    default:
      return "draw";
  }
}

function normalizeTime(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/**
 * ==========================================================
 * CONSULTA DAS GUERRAS ABERTAS
 * ==========================================================
 */

function getOpenWars(trackedClanTag: string): OpenWarRow[] {
  return database
    .prepare(
      `
      SELECT
        id,
        tracked_clan_tag,
        opponent_tag,
        end_time,
        result

      FROM war_history

      WHERE tracked_clan_tag = ?
        AND result IN ('preparation', 'ongoing')

      ORDER BY id ASC
    `,
    )
    .all(trackedClanTag) as OpenWarRow[];
}

/**
 * ==========================================================
 * ATUALIZAÇÃO
 * ==========================================================
 */

function finalizeWar({
  warId,
  result,
}: {
  warId: number;

  result: "win" | "loss" | "draw";
}): void {
  const now = new Date().toISOString();

  database
    .prepare(
      `
      UPDATE war_history

      SET
        state = 'warEnded',
        result = ?,
        updated_at = ?

      WHERE id = ?
    `,
    )
    .run(result, now, warId);
}

/**
 * ==========================================================
 * MATCH
 * ==========================================================
 */

function findMatchingWarLogEntry(
  openWar: OpenWarRow,
  warLog: WarLogEntry[],
): WarLogEntry | null {
  const targetOpponentTag = openWar.opponent_tag;

  const targetEndTime = normalizeTime(openWar.end_time);

  const match = warLog.find(
    (entry) =>
      entry.opponent?.tag === targetOpponentTag &&
      normalizeTime(entry.endTime) === targetEndTime,
  );

  return match ?? null;
}

/**
 * ==========================================================
 * RECONCILIAÇÃO PRINCIPAL
 * ==========================================================
 */

export async function reconcileWarHistory(): Promise<WarReconciliationResult> {
  const startedAt = new Date().toISOString();

  const clans: WarReconciliationClanResult[] = [];

  for (const clan of monitoredClans) {
    const result: WarReconciliationClanResult = {
      clanName: clan.name,

      clanTag: clan.tag,

      openWars: 0,

      matchedWars: 0,

      updatedWars: 0,

      unmatchedWars: 0,

      errors: 0,
    };

    try {
      const openWars = getOpenWars(clan.tag);

      result.openWars = openWars.length;

      /**
       * Sem guerras abertas, não precisamos consultar
       * o War Log.
       */
      if (openWars.length === 0) {
        clans.push(result);

        continue;
      }

      /**
       * Buscamos até 100 registros para aumentar a chance
       * de encontrar guerras antigas ainda abertas no banco.
       */
      const warLog = await getWarLog(clan.tag, 100);

      for (const openWar of openWars) {
        try {
          const match = findMatchingWarLogEntry(openWar, warLog);

          if (!match) {
            result.unmatchedWars += 1;

            continue;
          }

          result.matchedWars += 1;

          const finalResult = mapWarLogResult(match.result);

          finalizeWar({
            warId: openWar.id,

            result: finalResult,
          });

          result.updatedWars += 1;
        } catch (error) {
          result.errors += 1;

          console.error("[Kings of Doom] Erro ao reconciliar guerra:", {
            clanTag: clan.tag,

            warId: openWar.id,

            opponentTag: openWar.opponent_tag,

            endTime: openWar.end_time,

            error,
          });
        }
      }
    } catch (error) {
      result.errors += 1;

      console.error("[Kings of Doom] Erro na reconciliação do clã:", {
        clanName: clan.name,

        clanTag: clan.tag,

        error,
      });
    }

    clans.push(result);
  }

  const finishedAt = new Date().toISOString();

  return {
    startedAt,

    finishedAt,

    totalOpenWars: clans.reduce((total, clan) => total + clan.openWars, 0),

    totalMatchedWars: clans.reduce(
      (total, clan) => total + clan.matchedWars,
      0,
    ),

    totalUpdatedWars: clans.reduce(
      (total, clan) => total + clan.updatedWars,
      0,
    ),

    totalUnmatchedWars: clans.reduce(
      (total, clan) => total + clan.unmatchedWars,
      0,
    ),

    totalErrors: clans.reduce((total, clan) => total + clan.errors, 0),

    clans,
  };
}
