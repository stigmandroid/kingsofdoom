/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * clan.service.ts
 *
 * Responsabilidade:
 * Realizar consultas à API oficial do Clash of Clans.
 *
 * Este serviço é responsável por:
 * • autenticar as requisições utilizando o token privado;
 * • consultar informações de qualquer clã;
 * • tratar erros retornados pela API;
 * • devolver os dados tipados para o restante da aplicação.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { Clan } from "@/types/clan";

/**
 * URL base da API oficial do Clash of Clans.
 *
 * Todas as consultas deste serviço utilizam este endereço.
 */
const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * Estrutura simplificada dos erros retornados pela API.
 *
 * Nem todos os campos são obrigatórios, por isso
 * eles foram definidos como opcionais.
 */
type ClashApiError = {
  reason?: string;
  message?: string;
};

/**
 * Consulta qualquer clã utilizando sua tag oficial.
 *
 * Exemplo:
 *
 * await getClan("#2GQ2UC2PV");
 * await getClan("#2RU9QG9CG");
 *
 * @param clanTag Tag oficial do clã.
 * @returns Dados completos do clã.
 */
export async function getClan(clanTag: string): Promise<Clan> {
  /**
   * Token privado utilizado para autenticar a aplicação
   * junto à API oficial do Clash of Clans.
   *
   * Esta variável existe apenas no servidor.
   */
  const token = process.env.CLASH_API_TOKEN;

  /**
   * Garante que o token foi configurado corretamente.
   */
  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  /**
   * Garante que uma tag foi informada.
   */
  if (!clanTag) {
    throw new Error("Nenhuma tag de clã foi informada.");
  }

  /**
   * A API utiliza "%23" no lugar do caractere "#".
   *
   * encodeURIComponent realiza essa conversão automaticamente.
   */
  const encodedClanTag = encodeURIComponent(clanTag);

  /**
   * Consulta o clã na API oficial.
   *
   * O Next.js armazenará a resposta em cache durante
   * 60 segundos para reduzir chamadas desnecessárias.
   */
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

  /**
   * Caso a API retorne erro,
   * tentamos apresentar uma mensagem amigável.
   */
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

  /**
   * Converte a resposta JSON para o tipo Clan
   * utilizado pelo restante da aplicação.
   */
  return response.json() as Promise<Clan>;
}
