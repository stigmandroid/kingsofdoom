/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/debug-ip/route.ts
 *
 * Responsabilidade:
 * Identificar temporariamente o endereço IP utilizado pela
 * aplicação ao realizar requisições externas.
 *
 * Esta rota será usada somente para diagnóstico da conexão
 * entre a Vercel e a Clash of Clans API.
 *
 * IMPORTANTE:
 * Remover esta rota após concluir o diagnóstico.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 29/07/2026
 * ==========================================================
 */

import { NextResponse } from "next/server";

/**
 * Impede que a resposta seja armazenada no cache do Next.js.
 *
 * Como o objetivo é descobrir o IP utilizado em cada execução,
 * precisamos sempre realizar uma nova requisição.
 */
export const dynamic = "force-dynamic";

/**
 * Retorna o endereço IP público utilizado pela aplicação
 * para realizar requisições externas.
 */
export async function GET() {
  try {
    /**
     * Consulta um serviço público que retorna o endereço IP
     * de origem da requisição.
     */
    const response = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
    });

    /**
     * Interrompe o processamento caso o serviço externo
     * retorne um status HTTP de erro.
     */
    if (!response.ok) {
      throw new Error(
        `Não foi possível identificar o IP de saída. Status: ${response.status}`,
      );
    }

    /**
     * Estrutura esperada da resposta:
     *
     * {
     *   "ip": "123.123.123.123"
     * }
     */
    const data = (await response.json()) as {
      ip: string;
    };

    return NextResponse.json({
      ip: data.ip,
      environment: process.env.VERCEL_ENV ?? "local",
      message: "Este é o endereço IP utilizado nesta execução da função.",
    });
  } catch (error) {
    /**
     * Registra o erro nos logs da Vercel sem expor tokens,
     * variáveis privadas ou outras informações sensíveis.
     */
    console.error("Erro ao identificar o IP de saída:", error);

    return NextResponse.json(
      {
        error: "Não foi possível identificar o IP de saída da aplicação.",
      },
      {
        status: 500,
      },
    );
  }
}
