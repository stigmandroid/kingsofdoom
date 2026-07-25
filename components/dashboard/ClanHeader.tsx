import Image from "next/image";
import type { Clan } from "@/types/clan";

type ClanHeaderProps = {
  clan: Clan;
};

export function ClanHeader({ clan }: ClanHeaderProps) {
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
          {/* Iluminação de fundo */}
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[240px_1fr] lg:items-center lg:p-10">
            {/* Escudo */}
            <div className="flex justify-center">
              <div className="relative flex h-[220px] w-[220px] items-center justify-center">
                <div className="absolute inset-6 rounded-full bg-amber-400/20 blur-3xl" />

                <Image
                  src={clan.badgeUrls.large}
                  alt={`Escudo oficial do clã ${clan.name}`}
                  width={220}
                  height={220}
                  className="relative h-[210px] w-[210px] object-contain"
                />
              </div>
            </div>

            {/* Conteúdo */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-400">
                Informações do clã
              </p>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-white">
                    {clan.name}
                  </h2>

                  <p className="mt-2 font-semibold text-slate-400">
                    {clan.tag}
                  </p>
                </div>

                <div className="w-fit rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300">
                  Nível {clan.clanLevel}
                </div>
              </div>

              {/* Identidade do clã */}
              <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <p className="text-lg font-bold text-white">
                  👑 Kings of Doom 👑
                </p>

                <p className="mt-3 leading-7 text-slate-300">
                  Clã competitivo focado em guerras, CWL, push e evolução
                  constante.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ClanTag>⚔ Guerras</ClanTag>
                  <ClanTag>🏆 CWL</ClanTag>
                  <ClanTag>🚀 Push</ClanTag>
                  <ClanTag>🎯 Foco</ClanTag>
                  <ClanTag>🔥 Determinação</ClanTag>
                </div>

                <p className="mt-5 font-bold tracking-wide text-amber-300">
                  ⭐ Veni • Vidi • Vici ⭐
                </p>
              </div>

              {/* Estatísticas */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ClanInformation
                  label="Membros"
                  value={`${clan.members} / 50`}
                />

                <ClanInformation
                  label="Liga de Guerra"
                  value={clan.warLeague?.name ?? "Sem liga"}
                />

                <ClanInformation
                  label="Pontos do clã"
                  value={clan.clanPoints.toLocaleString("pt-BR")}
                />

                <ClanInformation
                  label="Pontos da Base do Construtor"
                  value={(clan.clanBuilderBasePoints ?? 0).toLocaleString(
                    "pt-BR",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ClanTagProps = {
  children: React.ReactNode;
};

function ClanTag({ children }: ClanTagProps) {
  return (
    <span className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-300">
      {children}
    </span>
  );
}

type ClanInformationProps = {
  label: string;
  value: string;
};

function ClanInformation({ label, value }: ClanInformationProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 transition hover:border-slate-700">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">{value}</p>
    </div>
  );
}
