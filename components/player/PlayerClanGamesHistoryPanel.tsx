/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/PlayerClanGamesHistoryPanel.tsx
 *
 * Responsabilidade:
 * Exibir o histórico individual de participação de um jogador
 * nos Jogos do Clã.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 29/08/2026
 *
 * Versão:
 * 0.9.3
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { PlayerClanGamesHistory } from "@/services/player-clan-games-history.service";

type PlayerClanGamesHistoryPanelProps = {
  history: PlayerClanGamesHistory;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Converte a temporada persistida no formato YYYY-MM
 * para uma representação amigável.
 */
function formatSeason(season: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(season);

  if (!match) {
    return season;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  const date = new Date(Date.UTC(year, month - 1, 1));

  const formatted = monthFormatter.format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function PlayerClanGamesHistoryPanel({
  history,
}: PlayerClanGamesHistoryPanelProps) {
  if (history.totalParticipations === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">
            Jogos do Clã
          </p>

          <h2 className="mt-1 text-lg font-black text-white">
            Histórico individual
          </h2>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Ainda não há participações registradas para este jogador.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      {/*
       * ======================================================
       * CABEÇALHO
       * ======================================================
       */}

      <div className="border-b border-slate-800 px-4 py-4 sm:px-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">
          Jogos do Clã
        </p>

        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-black text-white">
            Histórico individual
          </h2>

          <span className="text-xs font-bold text-slate-500">
            {history.totalParticipations}{" "}
            {history.totalParticipations === 1
              ? "participação"
              : "participações"}
          </span>
        </div>
      </div>

      {/*
       * ======================================================
       * INDICADORES
       * ======================================================
       */}

      <div className="grid grid-cols-2 border-b border-slate-800 sm:grid-cols-4">
        <div className="border-b border-r border-slate-800 p-3 sm:border-b-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Melhor pontuação
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {numberFormatter.format(history.bestPoints)}
          </p>
        </div>

        <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Média
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {numberFormatter.format(history.averagePoints)}
          </p>
        </div>

        <div className="border-r border-slate-800 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Pontos acumulados
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {numberFormatter.format(history.totalPoints)}
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Melhor posição
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {history.bestRank !== null ? `#${history.bestRank}` : "—"}
          </p>
        </div>
      </div>

      {/*
       * ======================================================
       * PARTICIPAÇÕES
       * ======================================================
       */}

      <div>
        {history.participations.map((participation) => (
          <div
            key={participation.eventId}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-slate-800/80 px-4 py-3 last:border-b-0 sm:px-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-black text-white">
                  {formatSeason(participation.season)}
                </p>

                {participation.state === "active" && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400">
                    Em andamento
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {participation.clanTag}
              </p>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-sm font-black text-white">
                  {numberFormatter.format(participation.points)}
                </p>

                <p className="text-[10px] font-bold uppercase text-slate-500">
                  pontos
                </p>
              </div>

              <div className="w-10">
                <p className="text-sm font-black text-amber-400">
                  {participation.finalRank !== null
                    ? `#${participation.finalRank}`
                    : "—"}
                </p>

                <p className="text-[10px] font-bold uppercase text-slate-500">
                  rank
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
