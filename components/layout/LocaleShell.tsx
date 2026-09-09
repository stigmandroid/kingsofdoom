/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/layout/LocaleShell.tsx
 *
 * Responsabilidade:
 * Controlar a estrutura visual das páginas localizadas,
 * permitindo que rotas especiais, como a verificação pública
 * do COC Bot, sejam exibidas sem a navegação e o rodapé
 * principais do Command Center.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * Desenvolvimento
 * ==========================================================
 */

"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

type LocaleShellProps = {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
};

/**
 * ==========================================================
 * SHELL LOCALIZADO
 * ==========================================================
 */

export function LocaleShell({ children, navbar, footer }: LocaleShellProps) {
  const pathname = usePathname();

  /**
   * Detecta exclusivamente as páginas públicas de
   * verificação/vinculação do COC Bot.
   *
   * Exemplos:
   *
   * /pt-BR/cocbot/verify/abc123
   * /en/cocbot/verify/abc123
   *
   * A landing principal:
   *
   * /pt-BR/cocbot
   *
   * deve continuar usando Navbar e Footer normalmente.
   */

  const isCocBotVerificationRoute = /^\/[^/]+\/cocbot\/verify(?:\/|$)/.test(
    pathname,
  );

  /**
   * A página de verificação possui experiência própria,
   * sem navegação institucional do portal.
   */

  if (isCocBotVerificationRoute) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  /**
   * Estrutura padrão do Command Center.
   */

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {navbar}

      <main className="flex-1">{children}</main>

      {footer}
    </div>
  );
}
