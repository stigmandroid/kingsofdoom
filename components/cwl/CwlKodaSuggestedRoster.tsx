/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlKodaSuggestedRoster.tsx
 *
 * Responsabilidade:
 * Exibir a formação competitiva sugerida pela KODA para CWL,
 * incluindo titulares e reservas do clã selecionado.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/10/2026
 *
 * Versão:
 * 0.3.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";

import type {
  CwlRosterAllocation,
  CwlRosterSlot,
} from "@/lib/intelligence/cwl/allocate-cwl-roster";

type CwlKodaSuggestedRosterProps = {
  locale: string;
  clanSlug: "kod" | "kod-rec";
  allocation: CwlRosterAllocation;
};

export function CwlKodaSuggestedRoster({
  locale,
  clanSlug,
  allocation,
}: CwlKodaSuggestedRosterProps) {
  const isKod = clanSlug === "kod";

  const clanName = isKod ? "K.O.D." : "K.O.D.rec";

  const starters = isKod ? allocation.kod : allocation.kodRec;

  const reserves = isKod ? allocation.kodReserves : allocation.kodRecReserves;

  const startersFilled = countFilled(starters);

  const reservesFilled = countFilled(reserves);

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-400/20 bg-slate-900/60 p-5 sm:p-7">
          {/* ==================================================
              CABEÇALHO
          ================================================== */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                KODA Competitive Intelligence
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Escalação sugerida — {clanName}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Formação sugerida a partir dos jogadores elegíveis e do
                desempenho competitivo registrado pela KODA nos últimos 30 dias.
              </p>

              {/* ==================================================
                  LEGENDA DOS INDICADORES
              ================================================== */}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span title="Taxa de PT">
                  <span className="mr-1 text-slate-300">🎯</span>
                  PT — taxa de PT
                </span>

                <span title="Média de estrelas">
                  <span className="mr-1 text-slate-300">★</span>
                  média de estrelas
                </span>

                <span title="Destruição média">
                  <span className="mr-1 text-slate-300">💥</span>
                  destruição média
                </span>

                <span title="Ataques realizados e disponíveis">
                  <span className="mr-1 text-slate-300">⚔</span>
                  ataques realizados / disponíveis
                </span>
              </div>
            </div>

            {/* ==================================================
                RESUMO
            ================================================== */}

            <div className="flex shrink-0 flex-wrap gap-3">
              <Summary label="Titulares" value={`${startersFilled}/15`} />

              <Summary label="Reservas" value={`${reservesFilled}/3`} />

              <Summary
                label="Vagas"
                value={15 - startersFilled + (3 - reservesFilled)}
              />
            </div>
          </div>

          {/* ==================================================
              TITULARES
          ================================================== */}

          <div className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Formação principal
                </p>

                <h3 className="mt-1 text-xl font-black text-white">
                  Titulares
                </h3>
              </div>

              <p className="text-sm font-bold text-slate-500">
                {startersFilled}/15
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {starters.map((slot) => (
                <PlayerSlot
                  key={`${slot.clan}-starter-${slot.slot}`}
                  slot={slot}
                  locale={locale}
                  clanSlug={clanSlug}
                />
              ))}
            </div>
          </div>

          {/* ==================================================
              RESERVAS
          ================================================== */}

          <div className="mt-10 border-t border-slate-800 pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                  Banco competitivo
                </p>

                <h3 className="mt-1 text-xl font-black text-white">Reservas</h3>

                <p className="mt-2 text-sm text-slate-500">
                  Somente jogadores elegíveis podem ocupar uma vaga de reserva.
                </p>
              </div>

              <p className="text-sm font-bold text-slate-500">
                {reservesFilled}/3
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {reserves.map((slot) => (
                <PlayerSlot
                  key={`${slot.clan}-reserve-${slot.slot}`}
                  slot={slot}
                  reserve
                  locale={locale}
                  clanSlug={clanSlug}
                />
              ))}
            </div>
          </div>

          {/* ==================================================
              OBSERVAÇÃO
          ================================================== */}

          <div className="mt-8 border-t border-slate-800 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              A classificação considera apenas jogadores aprovados nos critérios
              competitivos da KODA. Vagas sem jogadores elegíveis permanecem
              abertas. A decisão final da escalação permanece com a liderança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ==========================================================
 * CARD DO JOGADOR
 * ==========================================================
 */

function PlayerSlot({
  slot,
  locale,
  clanSlug,
}: {
  slot: CwlRosterSlot;
  reserve?: boolean;
  locale: string;
  clanSlug: "kod" | "kod-rec";
}) {
  const player = slot.player;

  /**
   * Vaga aberta
   */
  if (!player) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-sm font-black text-slate-500">
            #{String(slot.globalPosition ?? slot.slot).padStart(2, "0")}
          </div>

          <div>
            <p className="font-black text-slate-500">Vaga competitiva aberta</p>

            <p className="mt-1 text-xs text-slate-600">
              Nenhum jogador elegível disponível.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Página individual da análise KODA.
   *
   * Exemplo:
   * /pt-BR/cwl/kod/jogadores/YJY9R9UQY
   */
  const analysisHref =
    `/${locale}/cwl/${clanSlug}/jogadores/` +
    encodeURIComponent(player.playerTag.replace("#", ""));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-700">
      <div className="flex items-start gap-3">
        {/* ==================================================
            POSIÇÃO
        ================================================== */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-sm font-black text-slate-400">
          #{String(slot.globalPosition ?? slot.slot).padStart(2, "0")}
        </div>

        {/* ==================================================
            INFORMAÇÕES DO JOGADOR
        ================================================== */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-black text-white">
                {player.playerName ?? player.playerTag}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {player.playerTag}
              </p>
            </div>

            {/* ==================================================
                ANÁLISE COMPLETA
            ================================================== */}

            <Link
              href={analysisHref}
              className="shrink-0 whitespace-nowrap text-xs font-bold text-amber-300 transition hover:text-amber-200"
              title="Ver análise completa da KODA"
              aria-label={`Ver análise completa de ${
                player.playerName ?? player.playerTag
              }`}
            >
              Análise completa →
            </Link>
          </div>

          {/* ==================================================
              INDICADORES
          ================================================== */}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span title="Taxa de PT">
              <span className="mr-1 text-slate-300">🎯</span>
              {(player.metrics.tripleRate * 100).toFixed(1)}%
            </span>

            <span title="Média de estrelas">
              <span className="mr-1 text-slate-300">★</span>
              {player.metrics.averageStars.toFixed(2)}
            </span>

            <span title="Destruição média">
              <span className="mr-1 text-slate-300">💥</span>
              {player.metrics.averageDestruction.toFixed(1)}%
            </span>

            <span title="Ataques realizados / disponíveis">
              <span className="mr-1 text-slate-300">⚔</span>
              {player.metrics.attacksUsed}/{player.metrics.attacksAvailable}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * RESUMO
 * ==========================================================
 */

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-28 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

/**
 * ==========================================================
 * UTILITÁRIO
 * ==========================================================
 */

function countFilled(slots: CwlRosterSlot[]): number {
  return slots.filter((slot) => slot.status === "filled").length;
}
