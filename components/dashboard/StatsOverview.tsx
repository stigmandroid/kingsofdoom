import type { Clan } from "@/types/clan";
import { StatCard } from "@/components/ui/StatCard";

type StatsOverviewProps = {
  clan: Clan;
};

export function StatsOverview({ clan }: StatsOverviewProps) {
  const stats = [
    {
      label: "Liga de Guerra",
      value: clan.warLeague?.name ?? "Sem liga",
      description: "Liga atual do K.O.D. nas Guerras de Clãs.",
      icon: "🏆",
      accent: "amber" as const,
    },
    {
      label: "Membros",
      value: `${clan.members} / 50`,
      description: "Quantidade atual de jogadores no clã.",
      icon: "👥",
      accent: "blue" as const,
    },
    {
      label: "Nível do clã",
      value: String(clan.clanLevel),
      description: "Nível atual de experiência do K.O.D.",
      icon: "🛡️",
      accent: "emerald" as const,
    },
    {
      label: "Pontos do clã",
      value: clan.clanPoints.toLocaleString("pt-BR"),
      description: "Pontuação combinada atual dos membros.",
      icon: "⚔️",
      accent: "red" as const,
    },
  ];

  return (
    <section
      id="visao-geral"
      className="border-b border-slate-800 bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-400">
            Visão geral
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            O estado atual do K.O.D.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Dados atualizados automaticamente pela API oficial do Clash of
            Clans.
          </p>

          <p className="mt-3 text-sm font-semibold text-slate-600">
            {clan.tag}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
