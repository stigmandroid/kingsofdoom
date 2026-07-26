/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * war.service.ts
 *
 * Responsabilidade:
 * Consultar a guerra atual de qualquer clã na API oficial
 * do Clash of Clans.
 *
 * Este serviço:
 * • autentica a requisição utilizando o token privado;
 * • recebe a tag do clã como argumento;
 * • identifica guerras indisponíveis ou privadas;
 * • retorna os dados tipados para a aplicação.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { CurrentWar, CurrentWarResult } from "@/types/war";

/**
 * URL base utilizada para acessar a API oficial
 * do Clash of Clans.
 */
const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * Consulta a guerra atual de um clã utilizando sua tag.
 *
 * Exemplos:
 *
 * await getCurrentWar("#2GQ2UC2PV");
 * await getCurrentWar("#2RU9QG9CG");
 *
 * @param clanTag Tag oficial do clã consultado.
 * @returns Resultado da consulta da guerra atual.
 */
export async function getCurrentWar(
  clanTag: string,
): Promise<CurrentWarResult> {
  /**
   * Token privado utilizado para autenticar as requisições.
   *
   * Ele deve permanecer somente no servidor e nunca deve
   * ser enviado para componentes executados no navegador.
   */
  const token = process.env.CLASH_API_TOKEN;

  /**
   * Interrompe a execução quando o token não está configurado.
   */
  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  /**
   * Impede a realização de uma consulta sem tag de clã.
   */
  if (!clanTag) {
    throw new Error(
      "Nenhuma tag de clã foi informada para a consulta da guerra.",
    );
  }

  /**
   * Converte caracteres especiais da tag para um formato
   * seguro para utilização dentro da URL.
   *
   * Exemplo:
   * #2GQ2UC2PV → %232GQ2UC2PV
   */
  const encodedClanTag = encodeURIComponent(clanTag);

  /**
   * Realiza a consulta da guerra atual.
   *
   * A opção "no-store" impede o armazenamento da resposta
   * em cache, pois os dados da guerra podem mudar rapidamente
   * durante o período de ataques.
   */
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
   * A API retorna 403 quando o histórico de guerra do clã
   * está configurado como privado.
   */
  if (response.status === 403) {
    return {
      available: false,
      reason: "privateWarLog",
    };
  }

  /**
   * Para qualquer outro erro da API, devolvemos um resultado
   * controlado para que a página continue funcionando.
   */
  if (!response.ok) {
    return {
      available: false,
      reason: "unavailable",
    };
  }

  /**
   * Converte a resposta para o tipo CurrentWar utilizado
   * pelo restante da aplicação.
   */
  const war = (await response.json()) as CurrentWar;

  /**
   * A API pode responder corretamente, mas informar que
   * o clã não participa de nenhuma guerra neste momento.
   */
  if (war.state === "notInWar") {
    return {
      available: false,
      reason: "notInWar",
    };
  }

  /**
   * Quando existe uma guerra ativa ou em preparação,
   * devolvemos os dados completos para o Dashboard.
   */
  return {
    available: true,
    war,
  };
}
