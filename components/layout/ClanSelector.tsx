/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/layout/ClanSelector.tsx
 *
 * Responsabilidade:
 * Renderizar o seletor de clãs disponível na navegação
 * principal do portal.
 *
 * O componente identifica o idioma, o clã e o módulo
 * presentes na URL, permitindo trocar de clã sem perder
 * o contexto atual da navegação.
 *
 * Rotas contextuais suportadas:
 *
 * /pt-BR/clans/kod
 * /pt-BR/clans/kod-rec
 * /pt-BR/war/kod
 * /pt-BR/war/kod-rec
 * /pt-BR/cwl/kod
 * /pt-BR/cwl/kod-rec
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { clans } from "@/config/clans";

/**
 * Converte o catálogo central de clãs em uma lista.
 *
 * Qualquer novo clã adicionado em config/clans.ts será
 * incluído automaticamente no seletor.
 */
const clanOptions = Object.values(clans);

/**
 * Módulos que possuem navegação contextual por clã.
 */
type ClanContextModule = "clans" | "war" | "cwl" | "members";

/**
 * Renderiza o seletor responsável pela troca de clãs.
 */
export function ClanSelector() {
  /**
   * Controla se o menu suspenso está aberto ou fechado.
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Guarda uma referência para a área completa do seletor.
   */
  const selectorRef = useRef<HTMLDivElement>(null);

  /**
   * Recupera os parâmetros dinâmicos da URL.
   */
  const params = useParams();

  /**
   * Recupera o caminho atual da aplicação.
   */
  const pathname = usePathname();

  /**
   * Preserva o idioma atual nos links.
   */
  const locale = typeof params.locale === "string" ? params.locale : "pt-BR";

  /**
   * Identifica o clã diretamente pelos parâmetros dinâmicos.
   *
   * Nas páginas de clã, o parâmetro é chamado "slug".
   * Nas páginas de Guerra e CWL, o parâmetro é chamado "clan".
   */
  const parameterClanSlug =
    typeof params.slug === "string"
      ? params.slug
      : typeof params.clan === "string"
        ? params.clan
        : undefined;

  /**
   * Valida se o slug presente nos parâmetros realmente
   * pertence a um clã cadastrado.
   */
  const currentClan =
    clanOptions.find((clan) => clan.slug === parameterClanSlug) ?? clans.kod;

  /**
   * Identifica o módulo atual para preservar o contexto
   * durante a troca de clã.
   */
  const currentModule = getCurrentClanModule(pathname, locale);

  /**
   * Fecha o menu quando o usuário clicar fora do seletor.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedElement = event.target as Node;

      if (
        selectorRef.current &&
        !selectorRef.current.contains(clickedElement)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Fecha o menu quando a tecla Escape for pressionada.
   */
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  /**
   * Fecha o menu automaticamente depois de uma navegação.
   */
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div ref={selectorRef} className="relative">
      {/*
       * Botão principal do seletor.
       */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="clan-selector-menu"
        onClick={() => {
          setIsOpen((currentState) => !currentState);
        }}
        className="flex min-w-28 items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 transition duration-200 hover:border-amber-400/60 hover:text-amber-300 sm:min-w-36"
      >
        <span translate="no" className="notranslate truncate">
          {currentClan.name}
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/*
       * Menu suspenso com os clãs cadastrados.
       */}
      {isOpen && (
        <div
          id="clan-selector-menu"
          role="menu"
          aria-label="Selecionar clã"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/40"
        >
          <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Selecionar clã
          </div>

          {clanOptions.map((clan) => {
            /**
             * Verifica se o item representa o clã aberto.
             */
            const isCurrentClan = clan.slug === currentClan.slug;

            /**
             * Preserva o módulo atual.
             *
             * Exemplos:
             *
             * /war/kod     → /war/kod-rec
             * /cwl/kod     → /cwl/kod-rec
             * /clans/kod   → /clans/kod-rec
             */
            const destination = buildClanDestination({
              locale,
              module: currentModule,
              clanSlug: clan.slug,
            });

            return (
              <Link
                key={clan.slug}
                href={destination}
                role="menuitem"
                aria-current={isCurrentClan ? "page" : undefined}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition duration-200 ${
                  isCurrentClan
                    ? "bg-amber-400/10 font-semibold text-amber-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex min-w-0 flex-col">
                  <span translate="no" className="notranslate truncate">
                    {clan.name}
                  </span>

                  <span
                    translate="no"
                    className="notranslate truncate text-xs text-slate-500"
                  >
                    {clan.tag}
                  </span>
                </div>

                {isCurrentClan && (
                  <span
                    aria-label="Clã atualmente selecionado"
                    className="shrink-0 text-amber-400"
                  >
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Identifica em qual módulo contextual o usuário está.
 *
 * Nas páginas que não possuem contexto específico de clã,
 * o seletor direciona para o painel do clã escolhido.
 */
function getCurrentClanModule(
  pathname: string,
  locale: string,
): ClanContextModule {
  if (pathname === `/${locale}/war` || pathname.startsWith(`/${locale}/war/`)) {
    return "war";
  }

  if (pathname === `/${locale}/cwl` || pathname.startsWith(`/${locale}/cwl/`)) {
    return "cwl";
  }

  if (
    pathname === `/${locale}/members` ||
    pathname.startsWith(`/${locale}/members/`)
  ) {
    return "members";
  }

  return "clans";
}

/**
 * Monta o endereço de destino preservando o módulo atual.
 */
function buildClanDestination({
  locale,
  module,
  clanSlug,
}: {
  locale: string;
  module: ClanContextModule;
  clanSlug: string;
}): string {
  return `/${locale}/${module}/${clanSlug}`;
}
