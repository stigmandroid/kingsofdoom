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
 * O componente identifica o idioma e o clã presentes na URL,
 * lista os clãs cadastrados em config/clans.ts e permite
 * navegar entre eles sem recarregar completamente a página.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
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
 * Como os clãs estão armazenados dentro de um objeto,
 * Object.values permite percorrê-los utilizando map().
 *
 * Qualquer novo clã adicionado em config/clans.ts será
 * incluído automaticamente no seletor.
 */
const clanOptions = Object.values(clans);

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
   *
   * Essa referência será utilizada para identificar
   * cliques realizados fora do componente.
   */
  const selectorRef = useRef<HTMLDivElement>(null);

  /**
   * Recupera os parâmetros dinâmicos da URL.
   *
   * Exemplo:
   * /pt-BR/clans/kod
   *
   * params.locale será "pt-BR".
   * params.slug será "kod".
   */
  const params = useParams();

  /**
   * Recupera o endereço atual da aplicação.
   *
   * Ele será utilizado como apoio para identificar o clã
   * atualmente selecionado.
   */
  const pathname = usePathname();

  /**
   * Garante que o idioma utilizado nos links seja uma string.
   *
   * O pt-BR funciona como fallback defensivo para situações
   * em que o parâmetro locale não estiver disponível.
   */
  const locale = typeof params.locale === "string" ? params.locale : "pt-BR";

  /**
   * Identifica o clã diretamente pelo endereço atual.
   *
   * Exemplos reconhecidos:
   *
   * /pt-BR/clans/kod
   * /pt-BR/clans/kod-rec
   * /pt-BR/war/kod
   * /pt-BR/war/kod-rec
   */
  const routeSlug = clanOptions.find((clan) => {
    return (
      pathname === `/${locale}/clans/${clan.slug}` ||
      pathname.startsWith(`/${locale}/clans/${clan.slug}/`) ||
      pathname === `/${locale}/war/${clan.slug}` ||
      pathname.startsWith(`/${locale}/war/${clan.slug}/`)
    );
  })?.slug;

  /**
   * Procura no catálogo o clã correspondente ao slug atual.
   *
   * Na página inicial e nas páginas que ainda não possuem
   * contexto multi-clã, o K.O.D. é utilizado como padrão.
   */
  const currentClan =
    clanOptions.find((clan) => clan.slug === routeSlug) ?? clans.kod;

  /**
   * Fecha o menu quando o usuário clicar fora do seletor.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      /**
       * event.target representa o elemento clicado.
       *
       * A conversão para Node permite utilizar contains()
       * com segurança no TypeScript.
       */
      const clickedElement = event.target as Node;

      if (
        selectorRef.current &&
        !selectorRef.current.contains(clickedElement)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    /**
     * Remove o listener quando o componente for desmontado,
     * evitando eventos duplicados ou vazamento de memória.
     */
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
   *
   * Sempre que pathname mudar, significa que o usuário
   * acessou outra página ou selecionou outro clã.
   */
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div ref={selectorRef} className="relative">
      {/*
       * Botão principal do seletor.
       *
       * aria-expanded informa aos leitores de tela se
       * o menu está aberto ou fechado.
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

        {/*
         * Seta criada com SVG nativo.
         *
         * Isso evita adicionar uma biblioteca de ícones
         * apenas para exibir esse elemento visual.
         */}
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
       * O menu somente será renderizado quando isOpen
       * possuir o valor true.
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
             * Determina se o item representa o clã aberto.
             */
            const isCurrentClan = clan.slug === currentClan.slug;

            return (
              <Link
                key={clan.slug}
                href={`/${locale}/clans/${clan.slug}`}
                role="menuitem"
                aria-current={isCurrentClan ? "page" : undefined}
                onClick={() => {
                  /**
                   * Fecha imediatamente o menu após o clique.
                   *
                   * O efeito associado ao pathname também atua como
                   * uma segunda garantia depois da navegação.
                   */
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-3 text-sm transition duration-200 ${
                  isCurrentClan
                    ? "bg-amber-400/10 font-semibold text-amber-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex flex-col">
                  <span translate="no" className="notranslate">
                    {clan.name}
                  </span>

                  <span
                    translate="no"
                    className="notranslate text-xs text-slate-500"
                  >
                    {clan.tag}
                  </span>
                </div>

                {isCurrentClan && (
                  <span
                    aria-label="Clã atualmente selecionado"
                    className="text-amber-400"
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
