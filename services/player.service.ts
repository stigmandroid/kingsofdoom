/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player.service.ts
 *
 * Responsabilidade:
 * Consultar dados detalhados dos jogadores.
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

import type { Player } from "@/types/player";

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";
const DEFAULT_DEV_PROXY_BASE_URL = "https://kingsofdoom.com";

type ClashApiError = {
  reason?: string;
  message?: string;
};

type DevProxyPlayerResponse = {
  success: boolean;
  player?: Player;
  error?: string;
};

export async function getPlayer(playerTag: string): Promise<Player> {
  if (!playerTag) {
    throw new Error("Nenhuma tag de jogador foi informada.");
  }

  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getPlayerThroughDevProxy(playerTag);
  }

  return getPlayerDirectlyFromClash(playerTag);
}

async function getPlayerThroughDevProxy(playerTag: string): Promise<Player> {
  const secret = process.env.KOD_DEV_PROXY_SECRET;

  if (!secret) {
    throw new Error(
      "A variável KOD_DEV_PROXY_SECRET não foi configurada no .env.local.",
    );
  }

  const proxyBaseUrl = (
    process.env.KOD_DEV_PROXY_BASE_URL ?? DEFAULT_DEV_PROXY_BASE_URL
  ).replace(/\/+$/, "");

  const response = await fetch(
    `${proxyBaseUrl}/api/internal/clash/player?tag=${encodeURIComponent(playerTag)}`,
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
      .catch(() => null)) as DevProxyPlayerResponse | null;

    throw new Error(
      body?.error ??
        `Gateway de jogador respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as DevProxyPlayerResponse;

  if (!data.success || !data.player) {
    throw new Error(
      data.error ?? "O gateway de jogador retornou uma resposta inválida.",
    );
  }

  return data.player;
}

async function getPlayerDirectlyFromClash(playerTag: string): Promise<Player> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  const encodedPlayerTag = encodeURIComponent(playerTag);

  const response = await fetch(
    `${CLASH_API_BASE_URL}/players/${encodedPlayerTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
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

    throw new Error(
      `Não foi possível carregar o jogador ${playerTag}: ${reason}`,
    );
  }

  return response.json() as Promise<Player>;
}
