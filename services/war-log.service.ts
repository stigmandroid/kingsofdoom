/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war-log.service.ts
 *
 * Responsabilidade:
 * Consultar o War Log dos clãs monitorados para permitir a
 * reconciliação de guerras persistidas pelo Command Center.
 *
 * Estratégia:
 *
 * PRODUÇÃO
 * • consulta diretamente a Clash API através da VPS;
 *
 * DESENVOLVIMENTO
 * • utiliza o gateway privado hospedado na VPS;
 * • não expõe CLASH_API_TOKEN ao ambiente local.
 *
 * Uso principal:
 *
 * • localizar guerras antigas;
 * • identificar o resultado final;
 * • reconciliar registros que permaneceram como "ongoing".
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

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

const DEFAULT_DEV_PROXY_BASE_URL = "https://kingsofdoom.com";

const supportedClanSlugByTag = {
  "#2GQ2UC2PV": "kod",
  "#2RU9QG9CG": "kod-rec",
} as const;

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type WarLogClan = {
  tag: string;
  name: string;

  clanLevel?: number;

  stars: number;

  destructionPercentage: number;
};

export type WarLogEntry = {
  result: "win" | "lose" | "tie";

  endTime?: string;

  teamSize?: number;

  attacksPerMember?: number;

  clan: WarLogClan;

  opponent: WarLogClan;
};

type WarLogApiResponse = {
  items?: WarLogEntry[];
};

type DevProxyWarLogResponse = {
  success: boolean;

  items?: WarLogEntry[];

  error?: string;
};

/**
 * ==========================================================
 * CONSULTA PRINCIPAL
 * ==========================================================
 */

export async function getWarLog(
  clanTag: string,
  limit = 20,
): Promise<WarLogEntry[]> {
  if (!clanTag) {
    throw new Error(
      "Nenhuma tag de clã foi informada para consultar o War Log.",
    );
  }

  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getWarLogThroughDevProxy(clanTag, limit);
  }

  return getWarLogDirectlyFromClash(clanTag, limit);
}

/**
 * ==========================================================
 * DESENVOLVIMENTO — GATEWAY
 * ==========================================================
 */

async function getWarLogThroughDevProxy(
  clanTag: string,
  limit: number,
): Promise<WarLogEntry[]> {
  const secret = process.env.KOD_DEV_PROXY_SECRET;

  if (!secret) {
    throw new Error(
      "A variável KOD_DEV_PROXY_SECRET não foi configurada no .env.local.",
    );
  }

  const clanSlug =
    supportedClanSlugByTag[clanTag as keyof typeof supportedClanSlugByTag];

  if (!clanSlug) {
    throw new Error(
      `O clã ${clanTag} não está autorizado a utilizar o gateway do War Log.`,
    );
  }

  const proxyBaseUrl = (
    process.env.KOD_DEV_PROXY_BASE_URL ?? DEFAULT_DEV_PROXY_BASE_URL
  ).replace(/\/+$/, "");

  const query = new URLSearchParams({
    clan: clanSlug,
    limit: String(limit),
  });

  const response = await fetch(
    `${proxyBaseUrl}/api/internal/clash/war-log?${query.toString()}`,
    {
      headers: {
        Accept: "application/json",

        "x-kod-dev-proxy-secret": secret,
      },

      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as DevProxyWarLogResponse | null;

    throw new Error(
      body?.error ??
        `Gateway do War Log respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as DevProxyWarLogResponse;

  if (!data.success || !data.items) {
    return [];
  }

  return data.items;
}

/**
 * ==========================================================
 * PRODUÇÃO — CLASH API
 * ==========================================================
 */

async function getWarLogDirectlyFromClash(
  clanTag: string,
  limit: number,
): Promise<WarLogEntry[]> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error("A variável CLASH_API_TOKEN não foi configurada.");
  }

  const query = new URLSearchParams({
    limit: String(limit),
  });

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodeURIComponent(
      clanTag,
    )}/warlog?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      reason?: string;
      message?: string;
    } | null;

    throw new Error(
      error?.message ??
        error?.reason ??
        `War Log respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as WarLogApiResponse;

  return data.items ?? [];
}
