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
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 31/08/2026
 *
 * Versão:
 * 0.9.4
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { PlayerRaidHistory } from "@/services/player-raid-history.service";

type PlayerRaidHistoryPanelProps = {
  history: PlayerRaidHistory;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

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

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function PlayerRaidHistoryPanel({
  history,
}: PlayerRaidHistoryPanelProps) {
  if (history.totalParticipations === 0) {
    return (
      <section className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
          Raid Weekend
        </p>

        <h2 className="mt-1 text-lg font-black text-white">Capital do Clã</h2>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          Ainda não há participações de Raid Weekend registradas para este
          jogador.
        </p>
      </section>
    );
  }

  return (
    <section className="self-start overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 px-4 py-4 sm:px-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
          Raid Weekend
        </p>

        <div className="mt-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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

          <p className="mt-1 text-xs text-slate-500">
            Desempenho individual nos finais de semana de ataque.
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Média por Raid
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {numberFormatter.format(history.averageCapitalResourcesLooted)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Média por ataque
          </p>

          <p className="mt-1 text-lg font-black text-emerald-300">
            {numberFormatter.format(history.averageCapitalResourcesPerAttack)}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Finais de semana recentes
          </p>

          <span className="text-[10px] font-medium text-slate-600">
            Últimos {Math.min(history.participations.length, 3)}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {history.participations.slice(0, 3).map((participation) => (
            <div
              key={participation.raidWeekendId}
              className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">
                    {formatRaidPeriod(
                      participation.startTime,
                      participation.endTime,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
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
                  <p className="text-sm font-black text-emerald-300">
                    {numberFormatter.format(
                      participation.capitalResourcesLooted,
                    )}
                  </p>

                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
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
        "border-b border-slate-800 px-3 py-3 sm:border-b-0",
        last ? "" : "sm:border-r",
      ].join(" ")}
    >
      <p className="flex min-h-8 items-end text-[10px] font-black uppercase leading-tight tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black leading-none text-white">{value}</p>
    </div>
  );
}
