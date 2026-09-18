/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/layout/Navbar.tsx
 *
 * Responsabilidade:
 * Renderizar a barra principal de navegaÃ§Ã£o do portal,
 * incluindo identidade visual, links principais, seletor
 * de clÃ£s, acesso Ã  sala de guerra e menu lateral mobile.
 *
 * Autor:
 * stigmandroid
 *
 * Ãšltima atualizaÃ§Ã£o:
 * 26/07/2026
 * ==========================================================
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";

import { clans } from "@/config/clans";

import { ClanSelector } from "./ClanSelector";

/**
 * Representa um item disponÃ­vel na navegaÃ§Ã£o principal.
 */
type NavigationItem = {
  /**
   * Texto exibido no menu.
   */
  label: string;

  /**
   * EndereÃ§o localizado da pÃ¡gina.
   */
  href: string;
};

/**
 * Renderiza a barra principal de navegaÃ§Ã£o do portal.
 */
export function Navbar() {
  /**
   * Controla a abertura do painel lateral em dispositivos
   * mÃ³veis e tablets.
   */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Recupera os parÃ¢metros dinÃ¢micos presentes na URL.
   */
  const params = useParams();

  /**
   * Recupera o caminho atual para destacar o item ativo.
   */
  const pathname = usePathname();

  /**
   * Preserva o idioma atual em todos os links da Navbar.
   *
   * Caso o locale nÃ£o esteja disponÃ­vel, pt-BR serÃ¡
   * utilizado como idioma padrÃ£o.
   */
  const locale = typeof params.locale === "string" ? params.locale : "pt-BR";

  /**
   * Recupera o clÃ£ atualmente selecionado.
   *
   * Em pÃ¡ginas que nÃ£o possuem um slug de clÃ£, como
   * Releases, o K.O.D. serÃ¡ considerado o clÃ£ padrÃ£o.
   */
  const currentClanSlug =
    typeof params.slug === "string"
      ? params.slug
      : typeof params.clan === "string"
        ? params.clan
        : clans.kod.slug;

  /**
   * Links compartilhados entre a navegaÃ§Ã£o desktop
   * e o menu lateral mobile.
   */
  const navigationItems: NavigationItem[] = [
    {
      label: "Painel",
      href: `/${locale}/clans/${currentClanSlug}`,
    },
    {
      label: "Guerra",
      href: `/${locale}/war/${currentClanSlug}`,
    },
    {
      label: "CWL",
      href: `/${locale}/cwl/${currentClanSlug}`,
    },
    {
      label: "Eventos",
      href: `/${locale}/events/${currentClanSlug}`,
    },
    {
      label: "Membros",
      href: `/${locale}/members/${currentClanSlug}`,
    },
    {
      label: "Novidades",
      href: `/${locale}/releases`,
    },
    {
      label: "KODA",
      href: `/${locale}/cocbot`,
    },
  ];

  /**
   * Fecha o menu mobile sempre que o usuÃ¡rio navega
   * para uma nova pÃ¡gina.
   */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  /**
   * Permite fechar o menu lateral pressionando Escape.
   */
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  /**
   * Impede que o conteÃºdo da pÃ¡gina seja movimentado
   * enquanto o menu lateral estiver aberto.
   */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /**
   * Verifica se determinado item representa a rota atual.
   *
   * A pÃ¡gina Ã© considerada ativa tanto na rota principal
   * quanto em possÃ­veis subpÃ¡ginas.
   */
  function isNavigationItemActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-24 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/*
           * Identidade visual do portal.
           *
           * Em dispositivos mÃ³veis apenas o logotipo fica
           * visÃ­vel, economizando espaÃ§o horizontal.
           */}
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center gap-3"
            aria-label="Ir para a pÃ¡gina inicial"
          >
            <Image
              src="/kod-logo.png"
              alt="Logotipo do clÃ£ K.O.D."
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
           * NavegaÃ§Ã£o horizontal utilizada apenas em telas
           * grandes, onde hÃ¡ espaÃ§o suficiente para todos
           * os itens.
           */}
          <nav
            aria-label="NavegaÃ§Ã£o principal"
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
           * Ãrea de aÃ§Ãµes.
           *
           * No mobile sÃ£o exibidos apenas o seletor de clÃ£s
           * e o botÃ£o que abre o menu lateral.
           */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ClanSelector />

            {/*
             * Acesso rÃ¡pido Ã  sala de guerra exibido somente
             * em telas grandes.
             *
             * No celular esse link estarÃ¡ dentro do menu.
             */}
            <Link
              href={`/${locale}/war/${currentClanSlug}`}
              className="hidden rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition duration-200 hover:border-amber-300 hover:bg-amber-400/20 lg:inline-flex"
            >
              Sala de Guerra
            </Link>

            {/*
             * BotÃ£o do menu mobile.
             */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((currentState) => !currentState);
              }}
              aria-label={
                isMobileMenuOpen
                  ? "Fechar menu de navegaÃ§Ã£o"
                  : "Abrir menu de navegaÃ§Ã£o"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200 transition duration-200 hover:border-amber-400/50 hover:text-amber-400 lg:hidden"
            >
              {isMobileMenuOpen ? (
                /*
                 * Ãcone de fechamento.
                 */
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                /*
                 * Ãcone de menu hambÃºrguer.
                 */
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                >
                  <path
                    d="M4 7H20M4 12H20M4 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/*
       * Camada escura exibida atrÃ¡s do painel mobile.
       *
       * TambÃ©m permite fechar o menu ao tocar fora dele.
       */}
      <button
        type="button"
        aria-label="Fechar menu de navegaÃ§Ã£o"
        onClick={() => {
          setIsMobileMenuOpen(false);
        }}
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/*
       * Painel lateral da navegaÃ§Ã£o mobile.
       */}
      <aside
        id="mobile-navigation"
        aria-label="Menu de navegaÃ§Ã£o mobile"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed right-0 top-0 z-[70] flex h-dvh w-[85%] max-w-sm flex-col border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/*
         * CabeÃ§alho do painel lateral.
         */}
        <div className="flex min-h-24 items-center justify-between border-b border-slate-800 px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
              Command Center
            </p>

            <p className="mt-1 text-lg font-bold text-white">NavegaÃ§Ã£o</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
            aria-label="Fechar menu de navegaÃ§Ã£o"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-amber-400/50 hover:text-amber-400"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {/*
         * Links principais do menu mobile.
         */}
        <nav
          aria-label="NavegaÃ§Ã£o mobile"
          className="flex flex-1 flex-col gap-2 overflow-y-auto p-5"
        >
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-14 items-center rounded-xl border px-4 text-base font-semibold transition duration-200 ${
                  isActive
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                    : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        v
      </aside>
    </>
  );
}

