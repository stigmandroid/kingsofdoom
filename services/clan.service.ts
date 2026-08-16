/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/clan.service.ts
 *
 * Responsabilidade:
 * Consultar os dados de clãs utilizados pelo Command Center.
 *
 * Estratégia:
 * - produção consulta diretamente a Clash API;
 * - desenvolvimento consulta o gateway privado da VPS.
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

import type { Clan } from "@/types/clan";

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";
const DEFAULT_DEV_PROXY_BASE_URL = "https://kingsofdoom.com";

const supportedClanSlugByTag = {
  "#2GQ2UC2PV": "kod",
  "#2RU9QG9CG": "kod-rec",
} as const;

type ClashApiError = {
  reason?: string;
  message?: string;
};

type DevProxyClanResponse = {
  success: boolean;
  clan?: Clan;
  error?: string;
};

export async function getClan(clanTag: string): Promise<Clan> {
  if (!clanTag) {
    throw new Error("Nenhuma tag de clã foi informada.");
  }

  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getClanThroughDevProxy(clanTag);
  }

  return getClanDirectlyFromClash(clanTag);
}

async function getClanThroughDevProxy(clanTag: string): Promise<Clan> {
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
      `O clã ${clanTag} não está autorizado a utilizar o gateway de desenvolvimento.`,
    );
  }

  const proxyBaseUrl = (
    process.env.KOD_DEV_PROXY_BASE_URL ?? DEFAULT_DEV_PROXY_BASE_URL
  ).replace(/\/+$/, "");

  const response = await fetch(
    `${proxyBaseUrl}/api/internal/clash/clan?clan=${encodeURIComponent(clanSlug)}`,
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
      .catch(() => null)) as DevProxyClanResponse | null;

    throw new Error(
      body?.error ?? `Gateway de clã respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as DevProxyClanResponse;

  if (!data.success || !data.clan) {
    throw new Error(
      data.error ?? "O gateway de clã retornou uma resposta inválida.",
    );
  }

  return data.clan;
}

async function getClanDirectlyFromClash(clanTag: string): Promise<Clan> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  const encodedClanTag = encodeURIComponent(clanTag);

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodedClanTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => null)) as ClashApiError | null;

    const reason =
      error?.message ??
      error?.reason ??
      `A API respondeu com o status ${response.status}.`;

    throw new Error(`Não foi possível carregar o clã: ${reason}`);
  }

  return response.json() as Promise<Clan>;
}
