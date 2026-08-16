/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war.service.ts
 *
 * Responsabilidade:
 * Consultar a guerra atual de qualquer clã suportado pelo
 * Kings of Doom Command Center.
 *
 * Estratégia por ambiente:
 *
 * PRODUÇÃO
 * - a VPS consulta diretamente a Clash API;
 * - utiliza CLASH_API_TOKEN;
 * - a Supercell enxerga somente o IP autorizado da VPS.
 *
 * DESENVOLVIMENTO
 * - o localhost não consulta mais a Clash API diretamente;
 * - utiliza o gateway privado hospedado na VPS;
 * - o gateway consulta a Supercell utilizando o IP da VPS;
 * - mudanças no IP residencial deixam de quebrar o ambiente local.
 *
 * Segurança:
 *
 * - CLASH_API_TOKEN continua exclusivamente server-side;
 * - KOD_DEV_PROXY_SECRET autentica somente o gateway privado;
 * - componentes da interface não conhecem nenhuma das chaves;
 * - somente K.O.D. e K.O.D.rec podem utilizar o gateway.
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

import type { CurrentWar, CurrentWarResult } from "@/types/war";

/**
 * URL base da API oficial do Clash of Clans.
 */
const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * Endereço público utilizado pelo localhost para chegar
 * ao gateway privado da VPS.
 *
 * A variável permite trocar domínio/ambiente sem alterar
 * o código-fonte.
 */
const DEFAULT_DEV_PROXY_BASE_URL = "https://kingsofdoom.com";

/**
 * Mapeamento restrito das tags aceitas pelo gateway.
 *
 * Não encaminhamos tags arbitrárias para a VPS.
 */
const supportedClanSlugByTag = {
  "#2GQ2UC2PV": "kod",
  "#2RU9QG9CG": "kod-rec",
} as const;

/**
 * Estrutura retornada pelo gateway privado da VPS.
 */
type DevProxyCurrentWarResponse = {
  success: boolean;

  result?: CurrentWarResult;

  error?: string;
};

/**
 * Consulta a guerra atual do clã.
 *
 * O restante da aplicação continua utilizando a mesma função,
 * independentemente do ambiente em que estiver rodando.
 */
export async function getCurrentWar(
  clanTag: string,
): Promise<CurrentWarResult> {
  if (!clanTag) {
    throw new Error(
      "Nenhuma tag de clã foi informada para a consulta da guerra.",
    );
  }

  /**
   * Em desenvolvimento, o IP residencial não deve mais
   * participar da comunicação com a Supercell.
   */
  if (process.env.KOD_USE_DEV_PROXY === "true") {
    return getCurrentWarThroughDevProxy(clanTag);
  }

  /**
   * Em produção, a VPS continua consultando diretamente
   * a Clash API como já fazia anteriormente.
   */
  return getCurrentWarDirectlyFromClash(clanTag);
}

/**
 * ==========================================================
 * DESENVOLVIMENTO — GATEWAY DA VPS
 * ==========================================================
 */

/**
 * Consulta o gateway privado publicado na VPS.
 */
async function getCurrentWarThroughDevProxy(
  clanTag: string,
): Promise<CurrentWarResult> {
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

  /**
   * Pode ser sobrescrito no .env.local quando necessário.
   */
  const proxyBaseUrl = (
    process.env.KOD_DEV_PROXY_BASE_URL ?? DEFAULT_DEV_PROXY_BASE_URL
  ).replace(/\/+$/, "");

  const response = await fetch(
    `${proxyBaseUrl}/api/internal/clash/current-war?clan=${encodeURIComponent(
      clanSlug,
    )}`,
    {
      headers: {
        Accept: "application/json",
        "x-kod-dev-proxy-secret": secret,
      },

      /**
       * Guerra é informação dinâmica.
       */
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as DevProxyCurrentWarResponse | null;

    console.error(
      "[Kings of Doom] Erro ao consultar gateway de desenvolvimento:",
      {
        clanTag,
        status: response.status,
        error: body?.error,
      },
    );

    return {
      available: false,
      reason: "unavailable",
    };
  }

  const data = (await response.json()) as DevProxyCurrentWarResponse;

  if (!data.success || !data.result) {
    console.error("[Kings of Doom] Gateway retornou uma resposta inválida:", {
      clanTag,
      success: data.success,
      error: data.error,
    });

    return {
      available: false,
      reason: "unavailable",
    };
  }

  return data.result;
}

/**
 * ==========================================================
 * PRODUÇÃO — CLASH API DIRETA
 * ==========================================================
 */

/**
 * Consulta diretamente a API oficial.
 *
 * Esta função deve ser executada normalmente somente na VPS,
 * onde o IP está autorizado na chave da Supercell.
 */
async function getCurrentWarDirectlyFromClash(
  clanTag: string,
): Promise<CurrentWarResult> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  const encodedClanTag = encodeURIComponent(clanTag);

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodedClanTag}/currentwar`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },

      cache: "no-store",
    },
  );

  /**
   * Trata respostas de erro da Clash API.
   */
  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      reason?: string;
      message?: string;
    } | null;

    console.error("[Kings of Doom] Erro ao consultar guerra:", {
      clanTag,
      status: response.status,
      reason: errorData?.reason,
      message: errorData?.message,
    });

    const apiErrorText = [errorData?.reason, errorData?.message]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (response.status === 403 && apiErrorText.includes("private")) {
      return {
        available: false,
        reason: "privateWarLog",
      };
    }

    return {
      available: false,
      reason: "unavailable",
    };
  }

  const war = (await response.json()) as CurrentWar;

  /**
   * A API pode responder corretamente mesmo quando
   * o clã não está participando de guerra.
   */
  if (war.state === "notInWar") {
    return {
      available: false,
      reason: "notInWar",
    };
  }

  return {
    available: true,
    war,
  };
}
