/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/raid.service.ts
 *
 * Responsabilidade:
 * Consultar o histórico recente de Raid Weekends dos clãs
 * monitorados pelo Command Center.
 *
 * Estratégia:
 *
 * PRODUÇÃO
 * - consulta diretamente a Clash API;
 * - utiliza CLASH_API_TOKEN;
 *
 * DESENVOLVIMENTO
 * - utiliza o gateway privado hospedado na VPS;
 * - não expõe CLASH_API_TOKEN ao localhost.
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

export type RaidWeekendMember = {
  tag: string;
  name: string;

  attacks: number;

  attackLimit: number;

  bonusAttackLimit: number;

  capitalResourcesLooted: number;
};

export type RaidWeekend = {
  state: string;

  startTime: string;

  endTime: string;

  capitalTotalLoot: number;

  raidsCompleted: number;

  totalAttacks: number;

  enemyDistrictsDestroyed: number;

  offensiveReward: number;

  defensiveReward: number;

  members?: RaidWeekendMember[];
};

type RaidWeekendApiResponse = {
  items?: RaidWeekend[];
};

type DevProxyRaidWeekendResponse = {
  success: boolean;

  items?: RaidWeekend[];

  error?: string;
};

/**
 * ==========================================================
 * CONSULTA PRINCIPAL
 * ==========================================================
 */

export async function getRaidWeekends(
  clanTag: string,
  limit = 3,
): Promise<RaidWeekend[]> {
  if (!clanTag) {
    throw new Error(
      "Nenhuma tag de clã foi informada para consultar Raid Weekend.",
    );
  }

  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getRaidWeekendsThroughDevProxy(clanTag, limit);
  }

  return getRaidWeekendsDirectlyFromClash(clanTag, limit);
}

/**
 * ==========================================================
 * DESENVOLVIMENTO — GATEWAY
 * ==========================================================
 */

async function getRaidWeekendsThroughDevProxy(
  clanTag: string,
  limit: number,
): Promise<RaidWeekend[]> {
  const secret = process.env.KOD_DEV_PROXY_SECRET;

  if (!secret) {
    throw new Error("KOD_DEV_PROXY_SECRET não configurado.");
  }

  const clanSlug =
    supportedClanSlugByTag[clanTag as keyof typeof supportedClanSlugByTag];

  if (!clanSlug) {
    throw new Error(
      `O clã ${clanTag} não está autorizado a utilizar o gateway de Raid Weekend.`,
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
    `${proxyBaseUrl}/api/internal/clash/raid-weekends?${query.toString()}`,
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
      .catch(() => null)) as DevProxyRaidWeekendResponse | null;

    throw new Error(
      body?.error ??
        `Gateway de Raid Weekend respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as DevProxyRaidWeekendResponse;

  return data.items ?? [];
}

/**
 * ==========================================================
 * PRODUÇÃO — CLASH API
 * ==========================================================
 */

async function getRaidWeekendsDirectlyFromClash(
  clanTag: string,
  limit: number,
): Promise<RaidWeekend[]> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error("CLASH_API_TOKEN não configurado.");
  }

  const query = new URLSearchParams({
    limit: String(limit),
  });

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodeURIComponent(
      clanTag,
    )}/capitalraidseasons?${query.toString()}`,
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
        `Raid Weekend respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as RaidWeekendApiResponse;

  return data.items ?? [];
}
