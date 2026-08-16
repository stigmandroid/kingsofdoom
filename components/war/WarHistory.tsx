/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/war/WarHistory.tsx
 *
 * Responsabilidade:
 * Exibir o histórico recente de guerras em formato compacto,
 * com composição específica para desktop e dispositivos móveis.
 *
 * Princípio:
 * resumo primeiro, aprofundamento sob demanda.
 *
 * Estratégia responsiva:
 *
 * - desktop mantém a leitura horizontal em uma única linha;
 * - mobile utiliza uma composição própria, mais curta e equilibrada;
 * - resultado e data ficam no topo do card;
 * - placar ocupa o centro visual;
 * - botão de detalhes recebe largura total para facilitar o toque;
 * - métricas secundárias permanecem compactas no rodapé.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.8.7
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";

import type { WarHistoryListItem } from "@/services/war-history.service";

type WarHistoryProps = {
  wars: WarHistoryListItem[];
  locale: string;
  clanSlug: string;
};

const INITIAL_VISIBLE_WARS = 5;

export function WarHistory({ wars, locale, clanSlug }: WarHistoryProps) {
  const visibleWars = wars.slice(0, INITIAL_VISIBLE_WARS);

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-400">
              Histórico
            </p>

            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Guerras recentes
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-5 text-slate-500 sm:text-right sm:leading-6">
            Consulte os últimos confrontos e abra a guerra completa somente
            quando precisar.
          </p>
        </div>

        {wars.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:mt-6">
            <p className="font-black text-white">
              Nenhuma guerra arquivada ainda.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              O histórico será preenchido automaticamente conforme novas guerras
              forem monitoradas.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 sm:mt-6">
              {visibleWars.map((war, index) => (
                <WarHistoryRow
                  key={war.warKey}
                  war={war}
                  locale={locale}
                  clanSlug={clanSlug}
                  isLast={index === visibleWars.length - 1}
                />
              ))}
            </div>

            {wars.length > INITIAL_VISIBLE_WARS && (
              <div className="mt-4 flex justify-center">
                <span className="rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-bold text-slate-400">
                  + {wars.length - INITIAL_VISIBLE_WARS} guerras arquivadas
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function WarHistoryRow({
  war,
  locale,
  clanSlug,
  isLast,
}: {
  war: WarHistoryListItem;
  locale: string;
  clanSlug: string;
  isLast: boolean;
}) {
  const appearance = getResultAppearance(war.result);

  const detailsHref = `/${locale}/war/${clanSlug}/history/${war.warKey}`;

  return (
    <article
      className={[
        "relative",
        appearance.background,
        !isLast ? "border-b border-slate-800" : "",
      ].join(" ")}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${appearance.bar}`}
        aria-hidden="true"
      />

      <div className="px-4 py-4 pl-5 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-500">
            {formatWarDate(war)}
          </p>

          <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${appearance.badge}`}
          >
            {war.statusLabel}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="min-w-0">
            <p
              translate="no"
              className="notranslate truncate text-sm font-black text-white"
            >
              {war.clanName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap text-xl font-black text-white">
            <span>{war.clanStars}</span>
            <span className="text-slate-600">×</span>
            <span>{war.opponentStars}</span>
          </div>

          <div className="min-w-0 text-right">
            <p
              translate="no"
              className="notranslate truncate text-sm font-black text-white"
            >
              {war.opponentName}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <CompactMetric
            label="Destruição"
            value={`${formatPercentage(war.clanDestruction)} × ${formatPercentage(
              war.opponentDestruction,
            )}`}
          />

          <CompactMetric
            label="Ataques"
            value={`${war.clanAttacks} × ${war.opponentAttacks}`}
          />
        </div>

        <Link
          href={detailsHref}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-200 transition hover:border-amber-400/50 hover:text-amber-300"
        >
          Ver detalhes
        </Link>
      </div>

      <div className="hidden gap-4 px-5 py-4 pl-6 sm:grid sm:grid-cols-[92px_minmax(140px,1fr)_auto_minmax(140px,1fr)_140px_auto] sm:items-center">
        <div className="text-xs font-bold text-slate-500">
          {formatWarDate(war)}
        </div>

        <div className="min-w-0">
          <p
            translate="no"
            className="notranslate truncate font-black text-white"
          >
            {war.clanName}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-lg font-black text-white">
          <span>{war.clanStars}</span>
          <span className="text-slate-600">×</span>
          <span>{war.opponentStars}</span>
        </div>

        <div className="min-w-0 text-right">
          <p
            translate="no"
            className="notranslate truncate font-black text-white"
          >
            {war.opponentName}
          </p>
        </div>

        <div>
          <span
            className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${appearance.badge}`}
          >
            {war.statusLabel}
          </span>
        </div>

        <div className="text-right">
          <Link
            href={detailsHref}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 transition hover:border-amber-400/50 hover:text-amber-300"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5">
      <p className="truncate text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-slate-300">{value}</p>
    </div>
  );
}

function getResultAppearance(result: WarHistoryListItem["result"]): {
  background: string;
  bar: string;
  badge: string;
} {
  switch (result) {
    case "win":
      return {
        background: "bg-emerald-950/20",
        bar: "bg-emerald-400",
        badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      };

    case "loss":
      return {
        background: "bg-red-950/20",
        bar: "bg-red-400",
        badge: "border-red-400/25 bg-red-400/10 text-red-300",
      };

    case "draw":
      return {
        background: "bg-amber-950/20",
        bar: "bg-amber-400",
        badge: "border-amber-400/25 bg-amber-400/10 text-amber-300",
      };

    case "preparation":
      return {
        background: "bg-violet-950/15",
        bar: "bg-violet-400",
        badge: "border-violet-400/25 bg-violet-400/10 text-violet-300",
      };

    default:
      return {
        background: "bg-sky-950/15",
        bar: "bg-sky-400",
        badge: "border-sky-400/25 bg-sky-400/10 text-sky-300",
      };
  }
}

function formatWarDate(war: WarHistoryListItem): string {
  const value = war.startTime ?? war.preparationStartTime ?? war.createdAt;

  const parsed = parseClashDate(value);

  if (!parsed) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(parsed);
}

function parseClashDate(value: string): Date | null {
  if (/^\d{8}T\d{6}\.\d{3}Z$/.test(value)) {
    const normalized = value.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\.\d{3}Z)$/,
      "$1-$2-$3T$4:$5:$6$7",
    );

    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
