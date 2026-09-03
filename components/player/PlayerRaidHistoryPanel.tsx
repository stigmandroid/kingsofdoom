/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/PlayerRaidHistoryPanel.tsx
 *
 * Responsabilidade:
 * Exibir o histórico individual de participação de um jogador
 * nos Raid Weekends.
 *
 * A visualização apresenta:
 *
 * • quantidade de participações;
 * • Capital Gold acumulado;
 * • ataques utilizados e disponíveis;
 * • taxa de utilização dos ataques;
 * • melhor saque;
 * • médias históricas;
 * • participações recentes.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/09/2026
 *
 * Versão:
 * 0.9.5
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { PlayerRaidHistory } from "@/services/player-raid-history.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type PlayerRaidHistoryPanelProps = {
  history: PlayerRaidHistory;
};

/**
 * ==========================================================
 * FORMATADORES
 * ==========================================================
 */

const numberFormatter = new Intl.NumberFormat("pt-BR");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

/**
 * Converte o formato de data utilizado pela Clash API
 * para uma instância Date válida.
 */
function parseClashDate(value: string): Date | null {
  const match =
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d{3}))?Z$/.exec(value);

  if (!match) {
    const fallback = new Date(value);

    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, year, month, day, hour, minute, second, milliseconds = "000"] =
    match;

  return new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}Z`,
  );
}

/**
 * Formata o período de um Raid Weekend para exibição.
 */
function formatRaidPeriod(startTime: string, endTime: string): string {
  const startDate = parseClashDate(startTime);
  const endDate = parseClashDate(endTime);

  if (!startDate || !endDate) {
    return "Raid Weekend";
  }

  return `${dateFormatter.format(startDate)} – ${dateFormatter.format(
    endDate,
  )}`;
}

/**
 * Formata valores percentuais com uma casa decimal.
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * ==========================================================
 * COMPONENTE
 * ==========================================================
 */

export function PlayerRaidHistoryPanel({
  history,
}: PlayerRaidHistoryPanelProps) {
  /**
   * ========================================================
   * ESTADO SEM HISTÓRICO
   * ========================================================
   */

  if (history.totalParticipations === 0) {
    return (
      <section className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
          Raid Weekend
        </p>

        <h2 className="mt-1 text-lg font-black text-white">Capital do Clã</h2>

        <p className="mt-3 text-sm leading-6 text-slate-400 sm:mt-4">
          Ainda não há participações de Raid Weekend registradas para este
          jogador.
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
       *
       * No mobile o cabeçalho utiliza espaçamento vertical
       * reduzido para aproveitar melhor a altura disponível.
       *
       * A partir de sm o espaçamento original é restaurado.
       */}

      <div className="border-b border-slate-800 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
          Raid Weekend
        </p>

        <div className="mt-1">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="text-lg font-black leading-tight text-white">
              Capital do Clã
            </h2>

            <span className="w-fit shrink-0 rounded-full border border-slate-700 bg-slate-950/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {history.totalParticipations}{" "}
              {history.totalParticipations === 1
                ? "participação"
                : "participações"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-tight text-slate-500 sm:leading-normal">
            Desempenho individual nos finais de semana de ataque.
          </p>
        </div>
      </div>

      {/*
       * ======================================================
       * INDICADORES
       * ======================================================
       *
       * Os títulos reservam uma altura uniforme para manter
       * todos os valores alinhados.
       *
       * No mobile os indicadores utilizam uma altura um pouco
       * menor para reduzir o crescimento vertical do card.
       */}

      <div className="grid grid-cols-2 border-b border-slate-800 sm:grid-cols-4">
        <Metric
          label="Capital Gold"
          value={numberFormatter.format(history.totalCapitalResourcesLooted)}
        />

        <Metric
          label="Ataques"
          value={`${history.totalAttacks}/${history.totalAttacksAvailable}`}
        />

        <Metric
          label="Uso dos ataques"
          value={formatPercentage(history.attackUsageRate)}
        />

        <Metric
          label="Melhor saque"
          value={numberFormatter.format(history.bestCapitalResourcesLooted)}
          last
        />
      </div>

      {/*
       * ======================================================
       * MÉDIAS HISTÓRICAS
       * ======================================================
       */}

      <div className="grid grid-cols-2 gap-2.5 border-b border-slate-800 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 sm:p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Média por Raid
          </p>

          <p className="mt-1 text-lg font-black leading-none text-white">
            {numberFormatter.format(history.averageCapitalResourcesLooted)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 sm:p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Média por ataque
          </p>

          <p className="mt-1 text-lg font-black leading-none text-emerald-300">
            {numberFormatter.format(history.averageCapitalResourcesPerAttack)}
          </p>
        </div>
      </div>

      {/*
       * ======================================================
       * RAID WEEKENDS RECENTES
       * ======================================================
       *
       * O perfil apresenta somente as três participações mais
       * recentes para evitar crescimento vertical ilimitado.
       *
       * O histórico completo permanece preservado no SQLite.
       */}

      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Finais de semana recentes
          </p>

          <span className="shrink-0 text-[10px] font-medium text-slate-600">
            Últimos {Math.min(history.participations.length, 3)}
          </span>
        </div>

        <div className="mt-2.5 space-y-2 sm:mt-3">
          {history.participations.slice(0, 3).map((participation) => (
            <div
              key={participation.raidWeekendId}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 sm:py-3"
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black leading-tight text-white">
                    {formatRaidPeriod(
                      participation.startTime,
                      participation.endTime,
                    )}
                  </p>

                  <p className="mt-0.5 text-xs leading-tight text-slate-500 sm:mt-1 sm:leading-normal">
                    {participation.attacks}/{participation.attacksAvailable}{" "}
                    ataques
                    {participation.attacksMissed > 0
                      ? ` · ${participation.attacksMissed} não utilizado${
                          participation.attacksMissed === 1 ? "" : "s"
                        }`
                      : " · todos utilizados"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-black leading-tight text-emerald-300">
                    {numberFormatter.format(
                      participation.capitalResourcesLooted,
                    )}
                  </p>

                  <p className="text-[9px] font-black uppercase leading-tight tracking-wider text-slate-600">
                    Capital Gold
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * ==========================================================
 * COMPONENTES AUXILIARES
 * ==========================================================
 */

/**
 * Indicador resumido utilizado na área superior do painel.
 *
 * No mobile utiliza espaçamento vertical mais compacto.
 * No desktop mantém a densidade visual original.
 */
function Metric({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={[
        "grid grid-rows-[1.75rem_auto] border-b border-slate-800 px-3 py-2.5",
        "sm:grid-rows-[2rem_auto] sm:border-b-0 sm:py-3",
        last ? "" : "sm:border-r",
      ].join(" ")}
    >
      <p className="self-end text-[10px] font-black uppercase leading-tight tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black leading-none text-white">{value}</p>
    </div>
  );
}
