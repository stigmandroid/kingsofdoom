/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cocbot/layout.tsx
 *
 * Responsabilidade:
 * Fornecer um layout isolado para as páginas públicas
 * relacionadas ao COC Bot, sem utilizar a navegação
 * principal do Kings of Doom Command Center.
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

import type { ReactNode } from "react";

type CocBotLayoutProps = {
  children: ReactNode;
};

export default function CocBotLayout({ children }: CocBotLayoutProps) {
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}
