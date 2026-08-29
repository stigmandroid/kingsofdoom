/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/security/clan-games-auth.ts
 *
 * Responsabilidade:
 * Proteger rotas administrativas relacionadas aos Jogos do Clã.
 *
 * Segurança:
 *
 * - segredo mantido exclusivamente no servidor;
 * - segredo enviado por header HTTP;
 * - comparação em tempo constante;
 * - configuração ausente gera erro explícito.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 29/08/2026
 *
 * Versão:
 * 0.9.3
 *
 * Status:
 * Produção
 * ==========================================================
 */

import { timingSafeEqual } from "node:crypto";

const CLAN_GAMES_SECRET_HEADER = "x-kod-clan-games-secret";

export function isClanGamesRequestAuthorized(request: Request): boolean {
  const expectedSecret = process.env.CLAN_GAMES_ADMIN_SECRET;

  if (!expectedSecret) {
    throw new Error(
      "A variável CLAN_GAMES_ADMIN_SECRET não foi configurada no servidor.",
    );
  }

  const providedSecret = request.headers.get(CLAN_GAMES_SECRET_HEADER);

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
