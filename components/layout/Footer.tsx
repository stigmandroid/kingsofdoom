/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/layout/Footer.tsx
 *
 * Responsabilidade:
 * Exibir o rodapé global do portal.
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";

/**
 * Propriedades recebidas pelo rodapé.
 */
type FooterProps = {
  /**
   * Idioma atual da aplicação.
   */
  locale: string;

  /**
   * Versão pública atualmente publicada.
   */
  version?: string;
};

/**
 * Renderiza o rodapé global do Command Center.
 */
export function Footer({ locale, version = "0.8.0" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p
              translate="no"
              className="notranslate text-lg font-black text-white"
            >
              K.O.D. Command Center
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Plataforma de inteligência para acompanhamento de clãs, jogadores
              e guerras de Clash of Clans.
            </p>

            <p className="mt-4 text-xs text-slate-600">
              Dados obtidos por meio da API oficial do Clash of Clans.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <nav
              aria-label="Links do rodapé"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"
            >
              <Link
                href={`/${locale}/releases`}
                className="text-slate-400 transition hover:text-amber-300"
              >
                Releases
              </Link>

              <a
                href={`/${locale}/releases#roadmap`}
                className="text-slate-400 transition hover:text-amber-300"
              >
                Roadmap
              </a>
            </nav>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>v{version}</span>

              <span aria-hidden="true">•</span>

              <span>© {currentYear} Kings of Doom</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
