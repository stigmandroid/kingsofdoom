/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/player.service.ts
 *
 * Responsabilidade:
 * Consultar os dados detalhados de jogadores na API oficial
 * do Clash of Clans.
 *
 * Diferentemente do endpoint de clãs, este serviço retorna:
 * • liga ranqueada atual;
 * • estatísticas da Liga Lendária;
 * • heróis;
 * • recordes individuais;
 * • demais informações detalhadas do jogador.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { Player } from "@/types/player";

/**
 * URL base da API oficial do Clash of Clans.
 */
const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * Estrutura simplificada dos erros retornados pela API.
 */
type ClashApiError = {
  reason?: string;
  message?: string;
};

/**
 * Consulta os dados detalhados de um jogador utilizando
 * sua tag oficial.
 *
 * Exemplo:
 *
 * await getPlayer("#2PPQCU0JY");
 *
 * @param playerTag Tag oficial do jogador.
 * @returns Dados detalhados do jogador.
 */
export async function getPlayer(playerTag: string): Promise<Player> {
  /**
   * Token privado de autenticação.
   *
   * Como este serviço é executado no servidor, o token não
   * será enviado para o navegador do usuário.
   */
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  /**
   * Impede consultas sem uma tag válida.
   */
  if (!playerTag) {
    throw new Error("Nenhuma tag de jogador foi informada.");
  }

  /**
   * Converte o caractere "#" para "%23", formato exigido
   * pela API na URL.
   */
  const encodedPlayerTag = encodeURIComponent(playerTag);

  /**
   * Consulta o endpoint individual do jogador.
   *
   * Cada perfil ficará armazenado no cache do Next.js
   * durante cinco minutos.
   */
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

  /**
   * Transforma erros da API em mensagens compreensíveis.
   */
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
