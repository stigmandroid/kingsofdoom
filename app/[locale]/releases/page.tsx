/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/releases/page.tsx
 *
 * Responsabilidade:
 * Apresentar publicamente o histórico de versões e
 * atualizações do Kings of Doom Command Center.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { Metadata } from "next";

import { releases, type ReleaseChangeType } from "@/config/releases";

/**
 * Metadados utilizados pelo navegador e pelos mecanismos
 * de busca.
 */
export const metadata: Metadata = {
  title: "Atualizações | Kings of Doom Command Center",
  description:
    "Histórico de versões e atualizações do Kings of Doom Command Center.",
};

/**
 * Formata a data da versão seguindo a convenção brasileira.
 */
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Define os textos e as classes visuais de cada categoria
 * de alteração.
 */
const changeTypeConfiguration: Record<
  ReleaseChangeType,
  {
    label: string;
    className: string;
  }
> = {
  feature: {
    label: "Novidade",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },

  improvement: {
    label: "Melhoria",
    className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },

  fix: {
    label: "Correção",
    className: "border-red-400/30 bg-red-400/10 text-red-300",
  },

  technical: {
    label: "Técnico",
    className: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },
};

/**
 * Renderiza a página pública de histórico de versões.
 */
export default function ReleasesPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      {/*
       * Cabeçalho principal da página.
       */}
      <section className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Kings of Doom
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Atualizações
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Acompanhe a evolução do Command Center, conheça as novas
            funcionalidades e veja as melhorias realizadas em cada versão.
          </p>
        </div>
      </section>

      {/*
       * Linha do tempo das versões.
       */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {releases.map((release) => {
            /**
             * A data utiliza meio-dia para evitar mudanças
             * indesejadas causadas por diferenças de fuso.
             */
            const formattedDate = dateFormatter.format(
              new Date(`${release.date}T12:00:00Z`),
            );

            return (
              <article
                key={release.version}
                className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/10"
              >
                {/*
                 * Destaque superior aplicado somente à versão
                 * atualmente publicada.
                 */}
                {release.current && (
                  <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
                )}

                <div className="p-6 sm:p-8">
                  <header className="flex flex-col justify-between gap-5 border-b border-slate-800 pb-6 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-300">
                          v{release.version}
                        </span>

                        {release.current && (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                            Versão atual
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                        {release.title}
                      </h2>

                      <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                        {release.summary}
                      </p>
                    </div>

                    <time
                      dateTime={release.date}
                      className="shrink-0 text-sm font-medium capitalize text-slate-500"
                    >
                      {formattedDate}
                    </time>
                  </header>

                  <div className="mt-6 space-y-4">
                    {release.changes.map((change) => {
                      const typeConfiguration =
                        changeTypeConfiguration[change.type];

                      return (
                        <div
                          key={`${release.version}-${change.title}`}
                          className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <span
                              className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${typeConfiguration.className}`}
                            >
                              {typeConfiguration.label}
                            </span>

                            <div>
                              <h3 className="font-bold text-slate-100">
                                {change.title}
                              </h3>

                              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                                {change.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
