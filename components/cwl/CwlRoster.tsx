/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlRoster.tsx
 *
 * Responsabilidade:
 * Apresentar a escalação dos clãs inscritos na temporada
 * atual da Clash War League e a distribuição dos níveis
 * de Centro de Vila de seus jogadores.
 *
 * Funcionalidades:
 *
 * - Agrupa jogadores por nível de Centro de Vila;
 * - ordena os níveis do maior para o menor;
 * - exibe a quantidade total de inscritos;
 * - destaca o clã utilizado como referência;
 * - apresenta os Centros de Vila com imagens oficiais
 *   disponíveis no portal;
 * - mantém layout responsivo.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Image from "next/image";

import type { CwlClan } from "@/types/cwl";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlRosterProps = {
  /**
   * Clãs inscritos no grupo atual.
   */
  clans: CwlClan[];

  /**
   * Tag do clã que receberá destaque visual.
   */
  highlightedClanTag?: string;
};

/**
 * Representa a quantidade de jogadores inscritos
 * em determinado nível de Centro de Vila.
 */
type TownHallDistribution = {
  townHallLevel: number;
  players: number;
};

/**
 * Renderiza a distribuição dos Centros de Vila
 * de todos os clãs inscritos na CWL.
 */
export function CwlRoster({ clans, highlightedClanTag }: CwlRosterProps) {
  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
              Escalações da liga
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Distribuição dos Centros de Vila
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Consulte a composição dos jogadores inscritos por cada clã e
              compare o equilíbrio dos níveis presentes no grupo.
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-500">
            {clans.length} escalações registradas
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {clans.map((clan) => (
            <CwlRosterCard
              key={clan.tag}
              clan={clan}
              highlighted={clan.tag === highlightedClanTag}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Propriedades do card de escalação.
 */
type CwlRosterCardProps = {
  clan: CwlClan;
  highlighted: boolean;
};

/**
 * Exibe a composição de um clã participante.
 */
function CwlRosterCard({ clan, highlighted }: CwlRosterCardProps) {
  const distribution = calculateTownHallDistribution(clan);

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${
        highlighted
          ? "border-amber-400/50 bg-amber-400/10 shadow-lg shadow-amber-950/20"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      {highlighted && (
        <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
          Nosso clã
        </span>
      )}

      <div className="flex items-center gap-4 pr-24">
        <Image
          src={clan.badgeUrls.medium}
          alt={`Escudo oficial do clã ${clan.name}`}
          width={72}
          height={72}
          className="h-16 w-16 shrink-0 object-contain"
        />

        <div className="min-w-0">
          <h3
            translate="no"
            className="notranslate truncate text-lg font-black text-white"
          >
            {clan.name}
          </h3>

          <p
            translate="no"
            className="notranslate mt-1 text-xs font-semibold text-slate-500"
          >
            {clan.tag}
          </p>

          <p className="mt-2 text-xs font-bold text-slate-400">
            {clan.members.length} jogadores inscritos
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-5">
        {distribution.map(({ townHallLevel, players }) => (
          <div
            key={townHallLevel}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"
          >
            <Image
              src={`/town-halls/th-${townHallLevel}.webp`}
              alt={`Centro de Vila nível ${townHallLevel}`}
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
            />

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                TH{townHallLevel}
              </p>

              <p className="text-lg font-black text-white">{players}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

/**
 * Agrupa os inscritos de um clã por nível
 * de Centro de Vila.
 */
function calculateTownHallDistribution(clan: CwlClan): TownHallDistribution[] {
  const townHallCounts = clan.members.reduce<Record<number, number>>(
    (counts, member) => {
      counts[member.townHallLevel] = (counts[member.townHallLevel] ?? 0) + 1;

      return counts;
    },
    {},
  );

  return Object.entries(townHallCounts)
    .map(([townHallLevel, players]) => ({
      townHallLevel: Number(townHallLevel),
      players,
    }))
    .sort(
      (firstTownHall, secondTownHall) =>
        secondTownHall.townHallLevel - firstTownHall.townHallLevel,
    );
}
