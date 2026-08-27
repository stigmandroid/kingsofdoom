/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/events/[clan]/page.tsx
 *
 * Responsabilidade:
 * Apresentar a visão global dos eventos do clã dentro do
 * Event Intelligence.
 *
 * Nesta versão:
 *
 * - exibir o Raid Weekend mais recente;
 * - apresentar métricas gerais do evento;
 * - apresentar métricas derivadas de eficiência;
 * - apresentar ranking resumido dos participantes;
 * - apresentar histórico resumido dos Raid Weekends;
 * - preparar a página para Jogos do Clã futuramente.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { notFound } from "next/navigation";

import {
  getLatestRaidWeekend,
  getRaidWeekendHistory,
} from "@/services/raid-history.service";

import Link from "next/link";

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

export default async function EventsPage({
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

  const latest = getLatestRaidWeekend(clanData.tag);

  const history = getRaidWeekendHistory(clanData.tag, 6);

  const historyWithComparison = history.map((weekend, index) => {
    const previous = history[index + 1];

    const lootChange =
      previous && previous.capitalTotalLoot > 0
        ? ((weekend.capitalTotalLoot - previous.capitalTotalLoot) /
            previous.capitalTotalLoot) *
          100
        : null;

    const lootPerAttack =
      weekend.totalAttacks > 0
        ? weekend.capitalTotalLoot / weekend.totalAttacks
        : 0;

    return {
      weekend,

      lootChange,

      lootPerAttack,
    };
  });

  const rankingPreview = latest?.members.slice(0, 10) ?? [];

  const averageLootPerAttack =
    latest && latest.totalAttacks > 0
      ? latest.capitalTotalLoot / latest.totalAttacks
      : 0;

  const averageAttacksPerMember =
    latest && latest.membersCount > 0
      ? latest.totalAttacks / latest.membersCount
      : 0;

  const totalAvailableAttacks = latest
    ? latest.members.reduce(
        (total, member) => total + member.attackLimit + member.bonusAttackLimit,
        0,
      )
    : 0;

  const attackUsageRate =
    latest && totalAvailableAttacks > 0
      ? (latest.totalAttacks / totalAvailableAttacks) * 100
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/**
         * ==================================================
         * CABEÇALHO
         * ==================================================
         */}

        <section>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-400">
            Event Intelligence
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Eventos</h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
            Visão consolidada dos eventos do {clanData.name}, com histórico,
            desempenho coletivo e participação dos jogadores.
          </p>
        </section>

        {/**
         * ==================================================
         * RAID WEEKEND
         * ==================================================
         */}

        <section className="mt-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/45 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                  Raid Weekend
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Raide de Fim de Semana
                </h2>

                {latest ? (
                  <p className="mt-2 text-sm font-bold text-slate-300">
                    {formatRaidPeriod(latest.startTime, latest.endTime)}
                  </p>
                ) : null}

                <p className="mt-2 text-sm text-slate-400">
                  Desempenho coletivo do clã e participação individual dos
                  jogadores.
                </p>
              </div>

              {latest ? (
                <div className="shrink-0 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    {latest.state === "ongoing" ? "Em andamento" : "Concluído"}
                  </span>
                </div>
              ) : null}
            </div>

            {!latest ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-5">
                <p className="text-sm text-slate-400">
                  Nenhum Raid Weekend foi arquivado para este clã.
                </p>
              </div>
            ) : (
              <>
                {/**
                 * ==========================================
                 * MÉTRICAS PRINCIPAIS
                 * ==========================================
                 */}

                <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <RaidMetric
                    label="Capital Gold"
                    value={numberFormatter.format(latest.capitalTotalLoot)}
                  />

                  <RaidMetric
                    label="Ataques"
                    value={numberFormatter.format(latest.totalAttacks)}
                  />

                  <RaidMetric
                    label="Raids"
                    value={numberFormatter.format(latest.raidsCompleted)}
                  />

                  <RaidMetric
                    label="Distritos"
                    value={numberFormatter.format(
                      latest.enemyDistrictsDestroyed,
                    )}
                  />
                </div>

                {/**
                 * ==========================================
                 * MÉTRICAS DERIVADAS
                 * ==========================================
                 */}

                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <RaidMetric
                    label="Participantes"
                    value={numberFormatter.format(latest.membersCount)}
                    secondary
                  />

                  <RaidMetric
                    label="Loot por ataque"
                    value={numberFormatter.format(
                      Math.round(averageLootPerAttack),
                    )}
                    secondary
                  />

                  <RaidMetric
                    label="Ataques por jogador"
                    value={averageAttacksPerMember.toFixed(2)}
                    secondary
                  />

                  <RaidMetric
                    label="Uso dos ataques"
                    value={`${attackUsageRate.toFixed(1)}%`}
                    secondary
                  />
                </div>

                {/**
                 * ==========================================
                 * PARTICIPANTES
                 * ==========================================
                 */}

                <div className="mt-7 border-t border-slate-800 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        Ranking do clã
                      </p>

                      <h3 className="mt-1 text-lg font-black">
                        Top participantes
                      </h3>
                    </div>

                    <p className="text-xs font-bold text-slate-500">
                      {latest.membersCount} jogadores
                    </p>
                  </div>

                  {rankingPreview.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/35 p-4">
                      <p className="text-sm text-slate-500">
                        Os dados individuais deste Raid Weekend não foram
                        preservados.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
                        <div className="grid grid-cols-[36px_1fr_70px_96px] gap-2 bg-slate-950/80 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-600">
                          <span>#</span>

                          <span>Jogador</span>

                          <span className="text-center">Ataques</span>

                          <span className="text-right">Saque</span>
                        </div>

                        <div className="divide-y divide-slate-800">
                          {rankingPreview.map((member, index) => (
                            <div
                              key={member.playerTag}
                              className="grid grid-cols-[36px_1fr_70px_96px] items-center gap-2 bg-slate-900/30 px-3 py-2.5"
                            >
                              <span
                                className={[
                                  "text-xs font-black",
                                  index === 0
                                    ? "text-amber-300"
                                    : index === 1
                                      ? "text-slate-300"
                                      : index === 2
                                        ? "text-orange-300"
                                        : "text-slate-600",
                                ].join(" ")}
                              >
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">
                                  {member.playerName}
                                </p>

                                <p className="truncate text-[9px] text-slate-600">
                                  {member.playerTag}
                                </p>
                              </div>

                              <span className="text-center text-xs font-black text-slate-300">
                                {member.attacks}/
                                {member.attackLimit + member.bonusAttackLimit}
                              </span>

                              <span className="text-right text-sm font-black text-violet-300">
                                {numberFormatter.format(
                                  member.capitalResourcesLooted,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {latest.membersCount > 10 ? (
                        <div className="mt-3 flex justify-center">
                          <Link
                            href={`/${locale}/events/${clan}/raid-weekend`}
                            className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2 text-xs font-black text-slate-300 transition hover:border-slate-700 hover:text-white"
                          >
                            Ver ranking completo
                          </Link>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/**
                 * ==========================================
                 * HISTÓRICO
                 * ==========================================
                 */}

                <div className="mt-7 border-t border-slate-800 pt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Histórico recente
                  </p>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {historyWithComparison.map(
                      ({ weekend, lootChange, lootPerAttack }) => (
                        <div
                          key={weekend.id}
                          className="rounded-xl border border-slate-800 bg-slate-950/45 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-white">
                                {formatRaidPeriod(
                                  weekend.startTime,
                                  weekend.endTime,
                                )}
                              </p>

                              <p className="mt-2 text-lg font-black text-white">
                                {numberFormatter.format(
                                  weekend.capitalTotalLoot,
                                )}
                              </p>

                              <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                                Capital Gold
                              </p>
                            </div>

                            {lootChange !== null ? (
                              <div
                                className={[
                                  "rounded-full border px-2 py-1 text-[9px] font-black",
                                  lootChange > 0
                                    ? "border-emerald-900/70 bg-emerald-950/30 text-emerald-400"
                                    : lootChange < 0
                                      ? "border-rose-900/70 bg-rose-950/30 text-rose-400"
                                      : "border-slate-800 bg-slate-900/40 text-slate-500",
                                ].join(" ")}
                              >
                                {lootChange > 0
                                  ? "▲ "
                                  : lootChange < 0
                                    ? "▼ "
                                    : ""}
                                {Math.abs(lootChange).toFixed(1)}%
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
                            <HistoryMetric
                              label="Ataques"
                              value={numberFormatter.format(
                                weekend.totalAttacks,
                              )}
                            />

                            <HistoryMetric
                              label="Raids"
                              value={numberFormatter.format(
                                weekend.raidsCompleted,
                              )}
                            />

                            <HistoryMetric
                              label="Loot/ataque"
                              value={numberFormatter.format(
                                Math.round(lootPerAttack),
                              )}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/**
         * ==================================================
         * JOGOS DO CLÃ — PLACEHOLDER
         * ==================================================
         */}

        <section className="mt-4">
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/25 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              Jogos do Clã
            </p>

            <h2 className="mt-2 text-xl font-black">Clan Games</h2>

            <p className="mt-2 text-sm text-slate-500">
              Este evento será conectado ao Event Intelligence na próxima etapa.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * ==========================================================
 * MÉTRICA
 * ==========================================================
 */

function RaidMetric({
  label,
  value,
  secondary = false,
}: {
  label: string;
  value: string;
  secondary?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border px-3 py-3 text-center",
        secondary
          ? "border-slate-800/80 bg-slate-950/35"
          : "border-slate-800 bg-slate-950/55",
      ].join(" ")}
    >
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-1 font-black",
          secondary
            ? "text-sm text-slate-200"
            : "text-base text-white sm:text-lg",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function HistoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-xs font-black text-slate-300">{value}</p>
    </div>
  );
}

/**
 * ==========================================================
 * PERÍODO
 * ==========================================================
 */

function formatRaidPeriod(startTime: string, endTime: string): string {
  const start = parseClashTimestamp(startTime);

  const end = parseClashTimestamp(endTime);

  if (!start || !end) {
    return "Raid Weekend";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

/**
 * Converte timestamps da Clash API:
 *
 * 20260821T070000.000Z
 *
 * para uma instância Date válida.
 */
function parseClashTimestamp(value: string): Date | null {
  const match = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/,
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, millisecond] = match;

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond),
    ),
  );
}
