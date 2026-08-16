/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war-history.service.ts
 *
 * Responsabilidade:
 * Preparar o histórico de guerras para consumo pela interface.
 *
 * Estratégia por ambiente:
 *
 * PRODUÇÃO
 * - lê diretamente o SQLite persistente da VPS.
 *
 * DESENVOLVIMENTO
 * - consulta o gateway privado da VPS;
 * - utiliza o mesmo histórico disponível em produção;
 * - evita depender do banco SQLite local para validar a UI.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.8.7
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

const DEFAULT_DEV_PROXY_BASE_URL = "https://kingsofdoom.com";

const supportedClanSlugByTag = {
  "#2GQ2UC2PV": "kod",
  "#2RU9QG9CG": "kod-rec",
} as const;

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

type WarHistoryProxyListResponse = {
  success: boolean;
  wars?: WarHistoryListItem[];
  error?: string;
};

type WarHistoryProxyDetailResponse = {
  success: boolean;
  detail?: WarHistoryDetail;
  error?: string;
};

/**
 * Lista guerras encerradas recentes.
 */
export async function getRecentWarHistory({
  trackedClanTag,
  limit = 20,
}: {
  trackedClanTag: string;
  limit?: number;
}): Promise<WarHistoryListItem[]> {
  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getRecentWarHistoryThroughDevProxy({
      trackedClanTag,
      limit,
    });
  }

  return getRecentWarHistoryFromDatabase({
    trackedClanTag,
    limit,
  });
}

/**
 * Recupera uma guerra histórica completa.
 */
export async function getWarHistoryDetail({
  trackedClanTag,
  warKey,
}: {
  trackedClanTag: string;
  warKey: string;
}): Promise<WarHistoryDetail | null> {
  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getWarHistoryDetailThroughDevProxy({
      trackedClanTag,
      warKey,
    });
  }

  return getWarHistoryDetailFromDatabase({
    trackedClanTag,
    warKey,
  });
}

/**
 * ==========================================================
 * PRODUÇÃO — SQLITE LOCAL DA VPS
 * ==========================================================
 */

function getRecentWarHistoryFromDatabase({
  trackedClanTag,
  limit,
}: {
  trackedClanTag: string;
  limit: number;
}): WarHistoryListItem[] {
  return findRecentWarHistory({
    trackedClanTag,
    limit,
  }).map(({ rawJson: _rawJson, ...war }) => ({
    ...war,
    statusLabel: getWarStatusLabel(war.result),
  }));
}

function getWarHistoryDetailFromDatabase({
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
 * ==========================================================
 * DESENVOLVIMENTO — GATEWAY DA VPS
 * ==========================================================
 */

async function getRecentWarHistoryThroughDevProxy({
  trackedClanTag,
  limit,
}: {
  trackedClanTag: string;
  limit: number;
}): Promise<WarHistoryListItem[]> {
  const response = await fetchWarHistoryProxy({
    trackedClanTag,
  });

  if (!response.ok) {
    console.error("[Kings of Doom] Gateway histórico retornou erro:", {
      trackedClanTag,
      status: response.status,
    });

    return [];
  }

  const data = (await response.json()) as WarHistoryProxyListResponse;

  if (!data.success || !data.wars) {
    return [];
  }

  return data.wars.slice(0, limit);
}

async function getWarHistoryDetailThroughDevProxy({
  trackedClanTag,
  warKey,
}: {
  trackedClanTag: string;
  warKey: string;
}): Promise<WarHistoryDetail | null> {
  const response = await fetchWarHistoryProxy({
    trackedClanTag,
    warKey,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error(
      "[Kings of Doom] Gateway de detalhe histórico retornou erro:",
      {
        trackedClanTag,
        warKey,
        status: response.status,
      },
    );

    return null;
  }

  const data = (await response.json()) as WarHistoryProxyDetailResponse;

  return data.success && data.detail ? data.detail : null;
}

async function fetchWarHistoryProxy({
  trackedClanTag,
  warKey,
}: {
  trackedClanTag: string;
  warKey?: string;
}): Promise<Response> {
  const secret = process.env.KOD_DEV_PROXY_SECRET;

  if (!secret) {
    throw new Error(
      "A variável KOD_DEV_PROXY_SECRET não foi configurada no .env.local.",
    );
  }

  const clanSlug =
    supportedClanSlugByTag[
      trackedClanTag as keyof typeof supportedClanSlugByTag
    ];

  if (!clanSlug) {
    throw new Error(
      `O clã ${trackedClanTag} não está autorizado a utilizar o gateway histórico.`,
    );
  }

  const proxyBaseUrl = (
    process.env.KOD_DEV_PROXY_BASE_URL ?? DEFAULT_DEV_PROXY_BASE_URL
  ).replace(/\/+$/, "");

  const searchParams = new URLSearchParams({
    clan: clanSlug,
  });

  if (warKey) {
    searchParams.set("warKey", warKey);
  }

  return fetch(
    `${proxyBaseUrl}/api/internal/clash/war-history?${searchParams.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "x-kod-dev-proxy-secret": secret,
      },

      cache: "no-store",
    },
  );
}

/**
 * Rótulo amigável do resultado.
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
