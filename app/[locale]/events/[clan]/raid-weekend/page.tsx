/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/events/[clan]/raid-weekend/page.tsx
 *
 * Responsabilidade:
 * Apresentar o ranking completo do Raid Weekend mais recente
 * dentro do Event Intelligence.
 *
 * Nesta versão:
 *
 * - exibir todos os participantes persistidos;
 * - apresentar posição no ranking;
 * - apresentar ataques realizados;
 * - apresentar limite total de ataques;
 * - apresentar Capital Gold saqueado;
 * - manter a navegação contextual por clã.
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

import Link from "next/link";
import { notFound } from "next/navigation";

import { getLatestRaidWeekend } from "@/services/raid-history.service";

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

export default async function RaidWeekendRankingPage({
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

  if (!latest) {
    notFound();
  }

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

          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-violet-400">
            Raid Weekend
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">
                Ranking completo
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Participação individual no Raid Weekend mais recente do{" "}
                {clanData.name}.
              </p>
            </div>

            <div className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-black text-slate-300">
              {latest.membersCount} jogadores
            </div>
          </div>
        </section>

        {/**
         * ==================================================
         * RESUMO DO EVENTO
         * ==================================================
         */}

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <SummaryMetric
              label="Capital Gold"
              value={numberFormatter.format(latest.capitalTotalLoot)}
            />

            <SummaryMetric
              label="Ataques"
              value={numberFormatter.format(latest.totalAttacks)}
            />

            <SummaryMetric
              label="Raids"
              value={numberFormatter.format(latest.raidsCompleted)}
            />

            <SummaryMetric
              label="Distritos"
              value={numberFormatter.format(latest.enemyDistrictsDestroyed)}
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
            <div className="grid grid-cols-[26px_minmax(0,1fr)_54px_70px] items-center gap-2 bg-slate-950/80 px-2 py-2 text-[8px] font-black uppercase tracking-wider text-slate-600 sm:grid-cols-[42px_minmax(0,1fr)_90px_110px] sm:gap-3 sm:px-3 sm:text-[9px]">
              <span>#</span>

              <span>Jogador</span>

              <span className="text-center">Ataques</span>

              <span className="text-left sm:text-right">Saque</span>
            </div>

            <div className="divide-y divide-slate-800">
              {latest.members.map((member, index) => {
                const totalAttackLimit =
                  member.attackLimit + member.bonusAttackLimit;

                const lootPerAttack =
                  member.attacks > 0
                    ? member.capitalResourcesLooted / member.attacks
                    : 0;

                return (
                  <div
                    key={member.playerTag}
                    className="grid grid-cols-[26px_minmax(0,1fr)_54px_70px] items-center gap-2 bg-slate-900/30 px-2 py-2 transition hover:bg-slate-900/60 sm:grid-cols-[42px_minmax(0,1fr)_90px_110px] sm:gap-3 sm:px-3"
                  >
                    {/*
                     * Posição no ranking.
                     */}
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

                    {/*
                     * Jogador e tag permanecem juntos, mas de forma
                     * compacta para preservar a densidade do ranking.
                     */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {member.playerName}
                        </p>

                        <p className="truncate text-[9px] text-slate-600">
                          {member.playerTag}
                        </p>
                      </div>

                      <span className="hidden text-[9px] text-slate-500 md:inline">
                        {numberFormatter.format(Math.round(lootPerAttack))} /
                        ataque
                      </span>
                    </div>

                    {/*
                     * Uso dos ataques.
                     */}
                    <div className="text-center">
                      <p className="text-xs font-black text-white">
                        {member.attacks}/{totalAttackLimit}
                      </p>

                      {member.bonusAttackLimit > 0 ? (
                        <p className="mt-0.5 text-[7px] font-black uppercase tracking-wider text-violet-400">
                          bônus
                        </p>
                      ) : null}
                    </div>

                    {/*
                     * Capital Gold saqueado.
                     */}
                    <p className="text-left text-xs font-black text-violet-300 sm:text-right sm:text-sm">
                      {numberFormatter.format(member.capitalResourcesLooted)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
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
