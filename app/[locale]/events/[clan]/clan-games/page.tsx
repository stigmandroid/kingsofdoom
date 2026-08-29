/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/events/[clan]/clan-games/page.tsx
 *
 * Responsabilidade:
 * Apresentar o ranking completo dos Jogos do Clã mais
 * recentes dentro do Event Intelligence.
 *
 * Nesta versão:
 *
 * - exibir todos os participantes com pontuação;
 * - apresentar a posição oficial persistida;
 * - apresentar a pontuação individual;
 * - preservar corretamente a ordem oficial em empates;
 * - apresentar resumo consolidado do evento;
 * - manter a navegação contextual por clã.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 28/08/2026
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

import { getLatestClanGames } from "@/services/clan-games-history.service";

/**
 * ==========================================================
 * CLÃS SUPORTADOS
 * ==========================================================
 */

const clanBySlug = {
  kod: {
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
} as const;

type SupportedClanSlug = keyof typeof clanBySlug;

/**
 * ==========================================================
 * FORMATADORES
 * ==========================================================
 */

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * ==========================================================
 * PÁGINA
 * ==========================================================
 */

export default async function ClanGamesRankingPage({
  params,
}: {
  params: Promise<{
    locale: string;
    clan: string;
  }>;
}) {
  const { locale, clan } = await params;

  if (!(clan in clanBySlug)) {
    notFound();
  }

  const clanData = clanBySlug[clan as SupportedClanSlug];

  const latest = getLatestClanGames(clanData.tag);

  if (!latest) {
    notFound();
  }

  /**
   * O histórico preserva também membros que foram monitorados,
   * mas terminaram o evento sem pontuação.
   *
   * Para o ranking oficial exibimos somente participantes que
   * efetivamente possuem pontuação registrada.
   */
  const ranking = latest.members.filter((member) => member.currentPoints > 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/**
         * ==================================================
         * CABEÇALHO
         * ==================================================
         */}

        <section>
          <Link
            href={`/${locale}/events/${clan}`}
            className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 transition hover:text-white"
          >
            ← Voltar para Eventos
          </Link>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-amber-400">
            Clan Games
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">
                Ranking completo
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Participação individual nos Jogos do Clã mais recentes do{" "}
                {clanData.name}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-black text-slate-300">
                {ranking.length} jogadores
              </div>

              <div
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-black",
                  latest.state === "completed"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-300",
                ].join(" ")}
              >
                {latest.state === "completed" ? "Encerrado" : "Em andamento"}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs font-bold text-slate-600">
            {formatClanGamesSeason(latest.season)}
          </p>
        </section>

        {/**
         * ==================================================
         * RESUMO DO EVENTO
         * ==================================================
         */}

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <SummaryMetric
              label="Pontuação"
              value={numberFormatter.format(latest.totalPoints)}
            />

            <SummaryMetric
              label="Participantes"
              value={numberFormatter.format(latest.positiveParticipantsCount)}
            />

            <SummaryMetric
              label="Média"
              value={numberFormatter.format(
                Math.round(latest.averagePointsPerParticipant),
              )}
            />

            <SummaryMetric
              label="Maior pontuação"
              value={numberFormatter.format(latest.maxPoints)}
            />
          </div>
        </section>

        {/**
         * ==================================================
         * RANKING COMPLETO
         * ==================================================
         */}

        <section className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-[30px_minmax(0,1fr)_82px] items-center gap-2 bg-slate-950/80 px-2 py-2 text-[8px] font-black uppercase tracking-wider text-slate-600 sm:grid-cols-[50px_minmax(0,1fr)_130px] sm:gap-3 sm:px-3 sm:text-[9px]">
              <span>#</span>

              <span>Jogador</span>

              <span className="text-right">Pontuação</span>
            </div>

            <div className="divide-y divide-slate-800">
              {ranking.map((member, index) => {
                /**
                 * Em eventos encerrados com ranking oficial persistido,
                 * finalRank é a fonte de verdade.
                 *
                 * O fallback mantém compatibilidade com eventos antigos
                 * ou ainda em andamento.
                 */
                const position = member.finalRank ?? index + 1;

                return (
                  <div
                    key={member.playerTag}
                    className="grid grid-cols-[30px_minmax(0,1fr)_82px] items-center gap-2 bg-slate-900/30 px-2 py-2 transition hover:bg-slate-900/60 sm:grid-cols-[50px_minmax(0,1fr)_130px] sm:gap-3 sm:px-3"
                  >
                    {/**
                     * Posição oficial.
                     */}
                    <span
                      className={[
                        "text-xs font-black",
                        position === 1
                          ? "text-amber-300"
                          : position === 2
                            ? "text-slate-300"
                            : position === 3
                              ? "text-orange-300"
                              : "text-slate-600",
                      ].join(" ")}
                    >
                      {position}
                    </span>

                    {/**
                     * Jogador.
                     */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {member.playerName}
                      </p>

                      <p className="truncate text-[9px] text-slate-600">
                        {member.playerTag}
                      </p>
                    </div>

                    {/**
                     * Pontuação oficial/final persistida.
                     */}
                    <p className="text-right text-xs font-black text-amber-300 sm:text-sm">
                      {numberFormatter.format(member.currentPoints)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/**
         * ==================================================
         * INFORMAÇÃO HISTÓRICA
         * ==================================================
         *
         * Não exibimos os registros com zero pontos como
         * participantes do ranking.
         *
         * Eles continuam preservados no banco para auditoria
         * e inteligência histórica.
         */}

        {latest.participantsCount > latest.positiveParticipantsCount ? (
          <p className="mt-4 text-center text-[10px] leading-5 text-slate-600">
            {numberFormatter.format(
              latest.participantsCount - latest.positiveParticipantsCount,
            )}{" "}
            registros adicionais foram preservados no histórico do evento sem
            pontuação final.
          </p>
        ) : null}
      </div>
    </main>
  );
}

/**
 * ==========================================================
 * MÉTRICA DE RESUMO
 * ==========================================================
 */

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/45 px-3 py-3 text-center">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-base font-black text-white sm:text-lg">{value}</p>
    </div>
  );
}

/**
 * ==========================================================
 * FORMATAÇÃO DA TEMPORADA
 * ==========================================================
 */

function formatClanGamesSeason(season: string): string {
  const [year, month] = season.split("-").map(Number);

  if (!year || !month) {
    return season;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
