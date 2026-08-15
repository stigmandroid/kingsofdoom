/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/security/cwl-archive-auth.ts
 *
 * Responsabilidade:
 * Proteger rotas administrativas relacionadas ao archive
 * histórico da CWL.
 *
 * Segurança:
 *
 * - segredo mantido exclusivamente no servidor;
 * - segredo enviado por header HTTP;
 * - comparação em tempo constante;
 * - configuração ausente gera erro explícito.
 *
 * ==========================================================
 */

import { timingSafeEqual } from "node:crypto";

const ARCHIVE_SECRET_HEADER = "x-kod-cwl-secret";

export function isCwlArchiveRequestAuthorized(request: Request): boolean {
  const expectedSecret = process.env.CWL_ARCHIVE_SECRET;

  if (!expectedSecret) {
    throw new Error(
      "A variável CWL_ARCHIVE_SECRET não foi configurada no servidor.",
    );
  }

  const providedSecret = request.headers.get(ARCHIVE_SECRET_HEADER);

  if (!providedSecret) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSecret);
  const providedBuffer = Buffer.from(providedSecret);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
