import { StatCard } from "@/components/ui/StatCard";
import type { Clan } from "@/types/clan";

type StatsOverviewProps = {
  clan: Clan;
};

export function StatsOverview({ clan }: StatsOverviewProps) {
  const formattedClanPoints = new Intl.NumberFormat("pt-BR").format(
    clan.clanPoints,
  );

  const stats = [
    {
      title: "Liga de Guerra",
      value: clan.warLeague?.name ?? "Sem liga",
      description: "Liga atual do K.O.D. nas Guerras de Clãs.",
      icon: "🏆",
      href: "/cwl",
      accent: "amber" as const,
    },
    {
      title: "Membros",
      value: `${clan.members} / 50`,
      description: "Quantidade atual de jogadores no clã.",
      icon: "👥",
      href: "/members",
      accent: "blue" as const,
    },
    {
      title: "Nível do clã",
      value: String(clan.clanLevel),
      description: `Nível atual do ${clan.name}.`,
      icon: "🛡️",
      href: "/clan",
      accent: "emerald" as const,
    },
    {
      title: "Pontos do clã",
      value: formattedClanPoints,
      description: "Pontuação atual combinada dos membros.",
      icon: "⚔️",
      href: "/clan",
      accent: "red" as const,
    },
  ];

  return (
    <section
      id="visao-geral"
      className="border-b border-slate-800 bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-400">
            Visão geral
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            O estado atual do {clan.name}
          </h2>

          <p className="mt-4 leading-7 text-slate-400">
            Dados atualizados automaticamente pela API oficial do Clash of
            Clans.
          </p>

          <p className="mt-2 text-sm text-slate-500">{clan.tag}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
