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
 * A visualização apresenta:
 *
 * • quantidade de participações;
 * • melhor pontuação;
 * • média de pontos;
 * • pontos acumulados;
 * • melhor posição;
 * • histórico individual por temporada.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/09/2026
 *
 * Versão:
 * 0.9.4
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { PlayerClanGamesHistory } from "@/services/player-clan-games-history.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type PlayerClanGamesHistoryPanelProps = {
  history: PlayerClanGamesHistory;
};

/**
 * ==========================================================
 * FORMATADORES
 * ==========================================================
 */

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

/**
 * ==========================================================
 * COMPONENTE
 * ==========================================================
 */

export function PlayerClanGamesHistoryPanel({
  history,
}: PlayerClanGamesHistoryPanelProps) {
  /**
   * ========================================================
   * ESTADO SEM HISTÓRICO
   * ========================================================
   */

  if (history.totalParticipations === 0) {
    return (
      <section className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
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
    <section className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      {/*
       * ======================================================
       * CABEÇALHO
       * ======================================================
       */}

      <div className="border-b border-slate-800 px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">
          Jogos do Clã
        </p>

        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
          <h2 className="text-lg font-black leading-tight text-white">
            Histórico individual
          </h2>

          <span className="rounded-full border border-slate-700 bg-slate-950/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
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
       *
       * Todos os indicadores utilizam duas linhas estruturais:
       *
       * 1. espaço fixo para o título;
       * 2. espaço para o valor.
       *
       * Isso mantém todos os números na mesma linha de base,
       * mesmo quando alguns títulos ocupam duas linhas.
       */}

      <div className="grid grid-cols-2 border-b border-slate-800 sm:grid-cols-4">
        <div className="grid grid-rows-[2rem_auto] border-b border-r border-slate-800 px-3 py-2.5 sm:border-b-0 sm:py-3">
          <p className="self-end text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[10px]">
            Melhor pontuação
          </p>

          <p className="mt-1 text-base font-black leading-none text-white sm:text-lg">
            {numberFormatter.format(history.bestPoints)}
          </p>
        </div>

        <div className="grid grid-rows-[2rem_auto] border-b border-slate-800 px-3 py-2.5 sm:border-b-0 sm:border-r sm:py-3">
          <p className="self-end text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[10px]">
            Média
          </p>

          <p className="mt-1 text-base font-black leading-none text-white sm:text-lg">
            {numberFormatter.format(history.averagePoints)}
          </p>
        </div>

        <div className="grid grid-rows-[2rem_auto] border-r border-slate-800 px-3 py-2.5 sm:py-3">
          <p className="self-end text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[10px]">
            Pontos acumulados
          </p>

          <p className="mt-1 text-base font-black leading-none text-white sm:text-lg">
            {numberFormatter.format(history.totalPoints)}
          </p>
        </div>

        <div className="grid grid-rows-[2rem_auto] px-3 py-2.5 sm:py-3">
          <p className="self-end text-[9px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[10px]">
            Melhor posição
          </p>

          <p className="mt-1 text-base font-black leading-none text-white sm:text-lg">
            {history.bestRank !== null ? `#${history.bestRank}` : "—"}
          </p>
        </div>
      </div>

      {/*
       * ======================================================
       * PARTICIPAÇÕES
       * ======================================================
       *
       * O card apresenta somente as três participações mais
       * recentes para impedir crescimento vertical ilimitado.
       *
       * O histórico completo permanece preservado no banco
       * para futuras telas de consulta e análise.
       */}

      <div>
        {history.participations.slice(0, 3).map((participation) => (
          <div
            key={participation.eventId}
            className="flex flex-col gap-2.5 border-b border-slate-800/80 px-4 py-3 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:px-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black leading-tight text-white">
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

            <div className="flex w-full items-end justify-between border-t border-slate-800/60 pt-2 sm:w-auto sm:items-center sm:justify-start sm:gap-5 sm:border-t-0 sm:pt-0 sm:text-right">
              <div>
                <p className="text-sm font-black leading-tight text-white">
                  {numberFormatter.format(participation.points)}
                </p>

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">
                  pontos
                </p>
              </div>

              <div className="text-right sm:w-10">
                <p className="text-sm font-black leading-tight text-amber-400">
                  {participation.finalRank !== null
                    ? `#${participation.finalRank}`
                    : "—"}
                </p>

                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[10px]">
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
