/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/layout/LocaleShell.tsx
 *
 * Responsabilidade:
 * Controlar a estrutura visual das páginas localizadas,
 * permitindo que rotas especiais, como as páginas públicas
 * do COC Bot, sejam exibidas sem a navegação e o rodapé
 * principais do Command Center.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 06/09/2026
 *
 * Versão:
 * 0.1.0
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
   * Detecta páginas pertencentes ao COC Bot.
   *
   * Exemplos:
   * /pt-BR/cocbot/verify/...
   * /en/cocbot/verify/...
   */
  const isCocBotRoute = /^\/[^/]+\/cocbot(?:\/|$)/.test(pathname);

  /**
   * As páginas do COC Bot possuem experiência visual
   * própria e não devem herdar a navegação do portal K.O.D.
   */
  if (isCocBotRoute) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {navbar}

      <main className="flex-1">{children}</main>

      {footer}
    </div>
  );
}
