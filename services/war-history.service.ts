/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war-history.service.ts
 *
 * Responsabilidade:
 * Preparar o histórico de guerras para consumo pela interface
 * e reconstruir guerras completas a partir do SQLite.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 15/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import {
  findRecentWarHistory,
  findWarHistoryByKey,
  type WarHistoryRecord,
} from "@/repositories/war-history.repository";

import type { CurrentWar, CurrentWarResult } from "@/types/war";

export type WarHistoryListItem = Omit<WarHistoryRecord, "rawJson"> & {
  statusLabel: string;
};

export type WarHistoryDetail = {
  warKey: string;
  result: WarHistoryRecord["result"];
  statusLabel: string;
  snapshotUpdatedAt: string;
  currentWarResult: CurrentWarResult;
};

/**
 * Recupera as guerras recentes sem expor raw_json para a
 * camada visual da listagem.
 */
export function getRecentWarHistory({
  trackedClanTag,
  limit = 20,
}: {
  trackedClanTag: string;
  limit?: number;
}): WarHistoryListItem[] {
  return findRecentWarHistory({
    trackedClanTag,
    limit,
  }).map(({ rawJson: _rawJson, ...war }) => ({
    ...war,
    statusLabel: getWarStatusLabel(war.result),
  }));
}

/**
 * Reconstrói a guerra completa exatamente a partir do snapshot
 * preservado no SQLite.
 *
 * Isso permite reutilizar WarOverview, WarMap e
 * WarPendingAttacks sem consultar novamente a Clash API.
 */
export function getWarHistoryDetail({
  trackedClanTag,
  warKey,
}: {
  trackedClanTag: string;
  warKey: string;
}): WarHistoryDetail | null {
  const record = findWarHistoryByKey({
    trackedClanTag,
    warKey,
  });

  if (!record) {
    return null;
  }

  try {
    const war = JSON.parse(record.rawJson) as CurrentWar;

    return {
      warKey: record.warKey,
      result: record.result,
      statusLabel: getWarStatusLabel(record.result),
      snapshotUpdatedAt: record.updatedAt,
      currentWarResult: {
        available: true,
        war,
      },
    };
  } catch (error) {
    console.error(
      "[Kings of Doom] Não foi possível reconstruir a guerra histórica:",
      {
        trackedClanTag,
        warKey,
        error,
      },
    );

    return null;
  }
}

/**
 * Converte o resultado persistido em um rótulo amigável
 * para a interface.
 */
function getWarStatusLabel(result: WarHistoryRecord["result"]): string {
  switch (result) {
    case "win":
      return "Vitória";

    case "loss":
      return "Derrota";

    case "draw":
      return "Empate";

    case "preparation":
      return "Preparação";

    default:
      return "Em andamento";
  }
}
