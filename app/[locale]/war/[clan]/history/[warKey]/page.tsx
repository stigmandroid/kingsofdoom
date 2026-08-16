/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/war/[clan]/history/[warKey]/page.tsx
 *
 * Responsabilidade:
 * Exibir uma guerra histórica completa a partir do snapshot
 * persistido no SQLite.
 *
 * Objetivo:
 * Permitir análise detalhada sem sobrecarregar a Sala de
 * Guerra principal.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 15/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { HistoricalWarDetailTabs } from "@/components/war/HistoricalWarDetailTabs";

import { getClanBySlug } from "@/config/clans";
import { getWarHistoryDetail } from "@/services/war-history.service";

type HistoricalWarPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
    warKey: string;
  }>;
};

export default async function HistoricalWarPage({
  params,
}: HistoricalWarPageProps) {
  const { locale, clan: clanSlug, warKey } = await params;

  /**
   * Valida o clã pela mesma configuração utilizada nas
   * demais rotas do Command Center.
   */
  const clan = getClanBySlug(clanSlug);

  if (!clan) {
    notFound();
  }

  /**
   * Recupera exclusivamente o snapshot persistido.
   *
   * A página histórica não depende da disponibilidade atual
   * da Clash API.
   */
  const detail = getWarHistoryDetail({
    trackedClanTag: clan.tag,
    warKey,
  });

  if (!detail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href={`/${locale}/war/${clanSlug}`}
            className="inline-flex min-h-11 items-center text-sm font-bold text-slate-400 transition hover:text-white"
          >
            ← Voltar para Sala de Guerra
          </Link>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-400">
                Histórico de guerra
              </p>

              <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
                Guerra completa
              </h1>

              <p
                translate="no"
                className="notranslate mt-2 font-black text-red-400"
              >
                {clan.name}
              </p>
            </div>

            <div className="w-fit rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                Resultado
              </p>

              <p className="mt-1 font-black text-white">{detail.statusLabel}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-600">
            Snapshot atualizado em{" "}
            {formatSnapshotDate(detail.snapshotUpdatedAt)}.
          </p>
        </div>
      </section>

      <HistoricalWarDetailTabs result={detail.currentWarResult} />
    </main>
  );
}

function formatSnapshotDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "horário indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
