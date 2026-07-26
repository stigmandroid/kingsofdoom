/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/layout/Navbar.tsx
 *
 * Responsabilidade:
 * Renderizar a barra principal de navegação do portal,
 * incluindo identidade visual, links principais, seletor
 * de clãs, histórico de atualizações e acesso rápido à
 * sala de guerra.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { clans } from "@/config/clans";

import { ClanSelector } from "./ClanSelector";

/**
 * Representa um item da navegação principal.
 *
 * A tipagem evita que a estrutura dos links seja alterada
 * de forma inconsistente dentro do componente.
 */
type NavigationItem = {
  /**
   * Texto apresentado ao usuário.
   */
  label: string;

  /**
   * Endereço localizado da página.
   */
  href: string;
};

/**
 * Renderiza a barra principal de navegação do portal.
 */
export function Navbar() {
  /**
   * Recupera os parâmetros presentes na URL atual.
   */
  const params = useParams();

  /**
   * Recupera o caminho atual para permitir o destaque
   * visual do item ativo da navegação.
   */
  const pathname = usePathname();

  /**
   * Garante que o idioma seja preservado nos links.
   *
   * Quando o locale não estiver disponível na URL,
   * pt-BR será utilizado como valor padrão.
   */
  const locale = typeof params.locale === "string" ? params.locale : "pt-BR";

  /**
   * Recupera o slug do clã atualmente aberto.
   *
   * Quando a Navbar estiver em uma página sem slug,
   * o K.O.D. será considerado o clã padrão.
   */
  const currentClanSlug =
    typeof params.slug === "string" ? params.slug : clans.kod.slug;

  /**
   * Define os itens da navegação principal.
   *
   * Os links incluem explicitamente o locale para impedir
   * que o usuário saia da versão localizada do portal.
   */
  const navigationItems: NavigationItem[] = [
    {
      label: "Painel",
      href: `/${locale}/clans/${currentClanSlug}`,
    },

    {
      label: "Guerra",
      href: `/${locale}/war`,
    },

    {
      label: "CWL",
      href: `/${locale}/cwl`,
    },

    {
      label: "Membros",
      href: `/${locale}/members`,
    },

    {
      /**
       * Histórico público de versões e melhorias do portal.
       */
      label: "Novidades",
      href: `/${locale}/releases`,
    },
  ];

  /**
   * Verifica se um item da navegação representa a rota atual.
   *
   * A comparação exata é utilizada para impedir que páginas
   * diferentes sejam marcadas como ativas ao mesmo tempo.
   */
  function isNavigationItemActive(href: string) {
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      {/*
       * O contêiner utiliza a mesma largura máxima adotada
       * pelas principais seções do portal.
       *
       * Isso mantém a identidade visual alinhada entre
       * Navbar, dashboard e listagem de membros.
       */}
      <div className="mx-auto flex min-h-24 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/*
         * Identidade visual do portal.
         *
         * O link preserva o idioma atual e direciona para
         * a página inicial localizada.
         */}
        <Link
          href={`/${locale}`}
          className="flex shrink-0 items-center gap-3"
          aria-label="Ir para a página inicial"
        >
          <Image
            src="/kod-logo.png"
            alt="Logotipo do clã K.O.D."
            width={64}
            height={64}
            priority
            className="h-14 w-14 object-contain sm:h-16 sm:w-16"
          />

          <div translate="no" className="notranslate hidden flex-col sm:flex">
            <span className="text-xl font-bold tracking-wide text-white sm:text-2xl">
              K.O.D.
            </span>

            <span className="text-xs text-slate-400 sm:text-sm">
              Kings of Doom
            </span>
          </div>
        </Link>

        {/*
         * Navegação principal exibida em telas médias
         * e grandes.
         *
         * O espaçamento é reduzido em telas menores para
         * acomodar o novo item "Novidades".
         */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-5 text-sm font-medium text-slate-300 lg:flex xl:gap-8"
        >
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-amber-400"
                    : "transition-colors duration-200 hover:text-amber-400"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/*
         * Área de ações da Navbar.
         *
         * O seletor de clãs mantém toda a sua própria
         * lógica encapsulada em ClanSelector.tsx.
         */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ClanSelector />

          <Link
            href={`/${locale}/war`}
            className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-sm font-semibold text-amber-300 transition duration-200 hover:border-amber-300 hover:bg-amber-400/20 sm:px-4"
          >
            <span className="hidden xl:inline">Sala de Guerra</span>

            <span className="xl:hidden">Guerra</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
