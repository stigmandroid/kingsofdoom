/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/war/WarHistory.tsx
 *
 * Responsabilidade:
 * Exibir o histórico recente em formato compacto e direcionar
 * cada guerra para sua página completa de detalhes.
 *
 * Princípio:
 * resumo primeiro, aprofundamento sob demanda.
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

import type { WarHistoryListItem } from "@/services/war-history.service";

type WarHistoryProps = {
  wars: WarHistoryListItem[];
  locale: string;
  clanSlug: string;
};

const INITIAL_VISIBLE_WARS = 5;

/**
 * Exibe somente as guerras mais recentes na Sala de Guerra.
 *
 * O objetivo é manter a página principal compacta, principalmente
 * em dispositivos móveis.
 */
export function WarHistory({ wars, locale, clanSlug }: WarHistoryProps) {
  const visibleWars = wars.slice(0, INITIAL_VISIBLE_WARS);

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-400">
              Histórico
            </p>

            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Guerras recentes
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-500 sm:text-right">
            Consulte os últimos confrontos e abra a guerra completa somente
            quando precisar.
          </p>
        </div>

        {wars.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
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
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
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

/**
 * Linha compacta de uma guerra.
 *
 * Desktop:
 * data | clã | placar | adversário | status | botão
 *
 * Mobile:
 * o conteúdo quebra em poucas linhas e mantém o botão
 * com tamanho confortável para toque.
 */
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

      <div className="grid gap-3 px-4 py-4 pl-5 sm:grid-cols-[92px_minmax(140px,1fr)_auto_minmax(140px,1fr)_140px_auto] sm:items-center sm:gap-4 sm:px-5 sm:pl-6">
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

        <div className="flex items-center gap-2 text-lg font-black text-white sm:justify-center">
          <span>{war.clanStars}</span>
          <span className="text-slate-600">×</span>
          <span>{war.opponentStars}</span>
        </div>

        <div className="min-w-0 sm:text-right">
          <p
            translate="no"
            className="notranslate truncate font-black text-white"
          >
            {war.opponentName}
          </p>
        </div>

        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${appearance.badge}`}
          >
            {war.statusLabel}
          </span>
        </div>

        <div className="sm:text-right">
          <Link
            href={`/${locale}/war/${clanSlug}/history/${war.warKey}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 transition hover:border-amber-400/50 hover:text-amber-300"
          >
            Ver detalhes
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-slate-800 bg-slate-800 sm:hidden">
        <CompactMetric
          label="Destruição"
          value={`${formatPercentage(war.clanDestruction)} × ${formatPercentage(war.opponentDestruction)}`}
        />

        <CompactMetric
          label="Ataques"
          value={`${war.clanAttacks} × ${war.opponentAttacks}`}
        />
      </div>
    </article>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/80 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-xs font-black text-slate-300">{value}</p>
    </div>
  );
}

/**
 * Diferencia visualmente o estado da guerra.
 */
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
