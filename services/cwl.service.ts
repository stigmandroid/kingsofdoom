/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/cwl.service.ts
 *
 * Responsabilidade:
 * Consultar o grupo atual da Clash War League de qualquer
 * clã utilizando a API oficial do Clash of Clans.
 *
 * Este serviço:
 *
 * - autentica a requisição com o token privado;
 * - recebe a tag do clã como argumento;
 * - consulta o grupo atual da CWL;
 * - diferencia ausência de temporada e erros da API;
 * - mantém o token apenas no servidor.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CwlGroup } from "@/types/cwl";
import type { CurrentWar } from "@/types/war";

/**
 * URL base da API oficial do Clash of Clans.
 */
const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * Resultado possível da consulta do grupo atual da CWL.
 */
export type CurrentCwlGroupResult =
  | {
      available: true;
      group: CwlGroup;
    }
  | {
      available: false;
      reason: "notInCwl" | "privateWarLog" | "invalidIp" | "unavailable";
    };

/**
 * Estrutura básica de uma resposta de erro da Clash API.
 */
type ClashApiError = {
  reason?: string;
  message?: string;
};

/**
 * Resultado possível da consulta de uma guerra da CWL.
 */
export type CwlWarResult =
  | {
      available: true;
      war: CurrentWar;
    }
  | {
      available: false;
      reason: "warNotCreated" | "invalidIp" | "privateWarLog" | "unavailable";
    };

/**
 * Consulta o grupo atual da Liga de Guerras de um clã.
 *
 * @param clanTag Tag oficial do clã.
 * @returns Grupo atual da CWL ou motivo de indisponibilidade.
 */
export async function getCurrentCwlGroup(
  clanTag: string,
): Promise<CurrentCwlGroupResult> {
  /**
   * Token privado utilizado pela API.
   */
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  if (!clanTag) {
    throw new Error("Nenhuma tag de clã foi informada para a consulta da CWL.");
  }

  /**
   * Codifica o caractere # da tag para uso seguro na URL.
   *
   * Exemplo:
   * #2GQ2UC2PV → %232GQ2UC2PV
   */
  const encodedClanTag = encodeURIComponent(clanTag);

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodedClanTag}/currentwar/leaguegroup`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },

      /**
       * A CWL muda durante as rodadas, por isso evitamos
       * utilizar uma resposta antiga nesta primeira versão.
       */
      cache: "no-store",
    },
  );

  /**
   * Trata respostas de erro da API.
   */
  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ClashApiError | null;

    console.error("[Kings of Doom] Erro ao consultar grupo da CWL:", {
      clanTag,
      status: response.status,
      reason: errorData?.reason,
      message: errorData?.message,
    });

    const apiErrorText = [errorData?.reason, errorData?.message]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    /**
     * Chave válida, mas IP atual não autorizado.
     */
    if (response.status === 403 && apiErrorText.includes("invalidip")) {
      return {
        available: false,
        reason: "invalidIp",
      };
    }

    /**
     * Registro de guerra privado.
     */
    if (response.status === 403 && apiErrorText.includes("private")) {
      return {
        available: false,
        reason: "privateWarLog",
      };
    }

    /**
     * A API costuma indicar que o clã não participa
     * da temporada atual por meio de uma resposta 404.
     */
    if (response.status === 404) {
      return {
        available: false,
        reason: "notInCwl",
      };
    }

    return {
      available: false,
      reason: "unavailable",
    };
  }

  /**
   * Converte a resposta para o modelo interno da aplicação.
   */
  const group = (await response.json()) as CwlGroup;

  /**
   * Segurança contra respostas válidas, porém sem grupo
   * ou sem rodadas disponíveis.
   */
  if (!group.clans?.length || !group.rounds?.length) {
    return {
      available: false,
      reason: "notInCwl",
    };
  }

  return {
    available: true,
    group,
  };
}

/**
 * Consulta os detalhes de uma guerra pertencente à CWL.
 *
 * Diferentemente da guerra normal, esta consulta utiliza
 * a tag individual da guerra retornada pelo grupo da liga.
 *
 * @param warTag Tag oficial da guerra da CWL.
 * @returns Dados completos da guerra ou motivo de indisponibilidade.
 */
export async function getCwlWar(warTag: string): Promise<CwlWarResult> {
  /**
   * Token privado utilizado para autenticar a consulta.
   */
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  if (!warTag) {
    throw new Error(
      "Nenhuma tag de guerra foi informada para a consulta da CWL.",
    );
  }

  /**
   * A API utiliza "#0" enquanto uma guerra futura
   * ainda não foi criada.
   */
  if (warTag === "#0") {
    return {
      available: false,
      reason: "warNotCreated",
    };
  }

  /**
   * Codifica o caractere # para uso seguro na URL.
   */
  const encodedWarTag = encodeURIComponent(warTag);

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clanwarleagues/wars/${encodedWarTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },

      /**
       * Durante a CWL, os resultados podem mudar
       * conforme novos ataques são realizados.
       */
      cache: "no-store",
    },
  );

  /**
   * Trata respostas de erro da Clash API.
   */
  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => null)) as ClashApiError | null;

    console.error("[Kings of Doom] Erro ao consultar guerra da CWL:", {
      warTag,
      status: response.status,
      reason: errorData?.reason,
      message: errorData?.message,
    });

    const apiErrorText = [errorData?.reason, errorData?.message]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (response.status === 403 && apiErrorText.includes("invalidip")) {
      return {
        available: false,
        reason: "invalidIp",
      };
    }

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

  /**
   * O formato retornado pela guerra da CWL é compatível
   * com os dados utilizados pela Sala de Guerra.
   */
  const war = (await response.json()) as CurrentWar;

  return {
    available: true,
    war,
  };
}
