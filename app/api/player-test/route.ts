/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/player-test/route.ts
 *
 * Responsabilidade:
 * Consultar temporariamente os dados individuais de qualquer
 * jogador na API oficial do Clash of Clans para diagnóstico.
 *
 * A tag é recebida pelo parâmetro de URL chamado "tag".
 *
 * Exemplo:
 * /api/player-test?tag=%232PPCU0JV
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Impede que respostas desta rota de diagnóstico sejam
 * armazenadas no cache do Next.js.
 */
export const dynamic = "force-dynamic";

/**
 * Consulta um jogador utilizando a tag informada na URL.
 */
export async function GET(request: NextRequest) {
  /**
   * Recupera o token privado da API.
   *
   * O token permanece exclusivamente no servidor e nunca
   * é enviado para o navegador.
   */
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        error: "CLASH_API_TOKEN não foi configurado.",
      },
      {
        status: 500,
      },
    );
  }

  /**
   * Recupera o parâmetro "tag" da URL.
   *
   * Exemplo recebido:
   * #2PPCU0JV
   */
  const playerTag = request.nextUrl.searchParams.get("tag");

  if (!playerTag) {
    return NextResponse.json(
      {
        error: "Nenhuma tag de jogador foi informada.",
        example: "/api/player-test?tag=%232PPCU0JV",
      },
      {
        status: 400,
      },
    );
  }

  /**
   * Adiciona o caractere # automaticamente caso o usuário
   * tenha informado apenas os caracteres da tag.
   */
  const normalizedPlayerTag = playerTag.startsWith("#")
    ? playerTag
    : `#${playerTag}`;

  /**
   * Converte o caractere # para %23 e protege os demais
   * caracteres antes de montar a URL da API.
   */
  const encodedPlayerTag = encodeURIComponent(normalizedPlayerTag);

  const response = await fetch(
    `https://api.clashofclans.com/v1/players/${encodedPlayerTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },

      /**
       * A rota é apenas para diagnóstico, portanto sempre
       * solicitamos dados atualizados.
       */
      cache: "no-store",
    },
  );

  /**
   * Tenta interpretar a resposta como JSON.
   *
   * Caso a API retorne algo inesperado, devolvemos uma
   * mensagem de diagnóstico em vez de quebrar a página.
   */
  const data = await response.json().catch(() => ({
    reason: "invalidResponse",
    message: "A API retornou uma resposta que não pôde ser interpretada.",
  }));

  /**
   * Mantém o mesmo status HTTP retornado pela Clash API.
   *
   * Assim será possível identificar erros como:
   * 403: token ou IP não autorizado;
   * 404: jogador não encontrado;
   * 429: excesso de requisições.
   */
  return NextResponse.json(
    {
      requestedTag: normalizedPlayerTag,
      apiStatus: response.status,
      data,
    },
    {
      status: response.status,
    },
  );
}
