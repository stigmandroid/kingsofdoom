/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/security/dev-proxy-auth.ts
 *
 * Responsabilidade:
 * Validar requisições destinadas ao gateway privado utilizado
 * pelo ambiente local de desenvolvimento.
 *
 * Objetivo:
 * Permitir que o localhost consulte dados da Clash API através
 * da VPS sem expor o CLASH_API_TOKEN e sem transformar o
 * servidor em um proxy público.
 *
 * Segurança:
 *
 * - utiliza segredo independente do CWL Archive;
 * - compara os valores em tempo constante;
 * - nunca devolve o segredo ao cliente;
 * - falha quando a variável de ambiente não está configurada.
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

import { timingSafeEqual } from "node:crypto";

/**
 * Header privado enviado pelo ambiente local.
 */
const DEV_PROXY_SECRET_HEADER = "x-kod-dev-proxy-secret";

/**
 * Valida a autorização de uma requisição destinada ao
 * gateway de desenvolvimento.
 *
 * @param request Requisição HTTP recebida pela rota interna.
 * @returns true quando o segredo informado é válido.
 */
export function isDevProxyRequestAuthorized(request: Request): boolean {
  const configuredSecret = process.env.KOD_DEV_PROXY_SECRET;

  if (!configuredSecret) {
    throw new Error("A variável KOD_DEV_PROXY_SECRET não foi configurada.");
  }

  const receivedSecret = request.headers.get(DEV_PROXY_SECRET_HEADER);

  if (!receivedSecret) {
    return false;
  }

  const configuredBuffer = Buffer.from(configuredSecret, "utf8");

  const receivedBuffer = Buffer.from(receivedSecret, "utf8");

  /**
   * timingSafeEqual exige buffers com o mesmo tamanho.
   */
  if (configuredBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(configuredBuffer, receivedBuffer);
}
