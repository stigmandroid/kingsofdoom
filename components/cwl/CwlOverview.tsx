/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlOverview.tsx
 *
 * Responsabilidade:
 * Apresentar a visão geral do grupo atual da Clash War
 * League, incluindo temporada, estado, participantes
 * e progresso das rodadas.
 *
 * Funcionalidades:
 *
 * - Formata a temporada da CWL;
 * - Traduz o estado atual do grupo;
 * - Exibe quantidade de clãs e rodadas;
 * - Identifica guerras já criadas;
 * - Lista os clãs participantes;
 * - Destaca o clã utilizado como referência;
 * - Exibe quantidade de jogadores inscritos;
 * - Mantém layout responsivo.
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

import type { CwlClan, CwlGroup, CwlGroupState } from "@/types/cwl";
import { isAvailableCwlWarTag } from "@/types/cwl";

/**
 * Propriedades recebidas pela visão geral da CWL.
 */
type CwlOverviewProps = {
  /**
   * Grupo atual retornado pela Clash API.
   */
  group: CwlGroup;

  /**
   * Tag do clã que deve receber destaque visual.
   *
   * Durante o desenvolvimento utilizaremos temporariamente
   * um clã com grupo ativo na temporada atual.
   */
  highlightedClanTag?: string;
};

/**
 * Configuração visual e textual de cada estado da CWL.
 */
const stateConfiguration: Record<
  CwlGroupState,
  {
    label: string;
    description: string;
    className: string;
  }
> = {
  preparation: {
    label: "Preparação",
    description:
      "O grupo foi formado e as primeiras guerras estão sendo preparadas.",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },

  inWar: {
    label: "Em andamento",
    description: "A temporada possui uma rodada com batalhas em andamento.",
    className: "border-red-400/30 bg-red-400/10 text-red-300",
  },

  ended: {
    label: "Encerrada",
    description: "Todas as rodadas da temporada foram concluídas.",
    className: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  },
};

/**
 * Renderiza a visão geral do grupo atual da CWL.
 */
export function CwlOverview({ group, highlightedClanTag }: CwlOverviewProps) {
  const state = stateConfiguration[group.state];

  /**
   * Quantidade total de guerras que já possuem uma tag
   * válida e podem ser consultadas individualmente.
   */
  const availableWarTags = group.rounds
    .flatMap((round) => round.warTags)
    .filter(isAvailableCwlWarTag);

  /**
   * Quantidade de rodadas que já possuem ao menos
   * uma guerra criada pela Clash API.
   */
  const availableRounds = group.rounds.filter((round) =>
    round.warTags.some(isAvailableCwlWarTag),
  ).length;

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/*
         * Cabeçalho principal da CWL.
         */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 lg:p-10">
          {/*
           * Iluminação decorativa.
           */}
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-amber-400/10 blur-[100px]" />

          <div className="relative">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-400">
                  CWL Command Center
                </p>

                <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Liga de Guerras de Clãs
                </h1>

                <p className="mt-5 max-w-3xl leading-7 text-slate-400">
                  Acompanhe os participantes, as rodadas e os confrontos da
                  temporada atual em uma única visão.
                </p>
              </div>

              <div className="flex flex-col gap-2 lg:items-end">
                <span
                  className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider ${state.className}`}
                >
                  {state.label}
                </span>

                <p className="max-w-sm text-sm leading-6 text-slate-500 lg:text-right">
                  {state.description}
                </p>
              </div>
            </div>

            {/*
             * Indicadores principais da temporada.
             */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CwlMetric
                label="Temporada"
                value={formatCwlSeason(group.season)}
                detail={group.season}
              />

              <CwlMetric
                label="Clãs"
                value={group.clans.length}
                detail="Participantes do grupo"
              />

              <CwlMetric
                label="Rodadas"
                value={`${availableRounds}/${group.rounds.length}`}
                detail="Rodadas já criadas"
              />

              <CwlMetric
                label="Guerras disponíveis"
                value={availableWarTags.length}
                detail="Confrontos consultáveis"
              />
            </div>
          </div>
        </div>

        {/*
         * Relação dos clãs participantes.
         */}
        <div className="mt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
                Grupo atual
              </p>

              <h2 className="mt-3 text-3xl font-black text-white">
                Clãs participantes
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Conheça os clãs e os jogadores inscritos na temporada atual.
              </p>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {group.clans.length} clãs no grupo
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {group.clans.map((clan) => (
              <CwlClanCard
                key={clan.tag}
                clan={clan}
                highlighted={clan.tag === highlightedClanTag}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Propriedades de um indicador da CWL.
 */
type CwlMetricProps = {
  label: string;
  value: string | number;
  detail: string;
};

/**
 * Exibe um indicador resumido da temporada.
 */
function CwlMetric({ label, value, detail }: CwlMetricProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-black text-white">{value}</p>

      <p className="mt-2 text-xs font-semibold text-slate-600">{detail}</p>
    </article>
  );
}

/**
 * Propriedades do card de um clã participante.
 */
type CwlClanCardProps = {
  clan: CwlClan;
  highlighted: boolean;
};

/**
 * Exibe um clã pertencente ao grupo atual da CWL.
 */
function CwlClanCard({ clan, highlighted }: CwlClanCardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 transition ${
        highlighted
          ? "border-amber-400/50 bg-amber-400/10 shadow-lg shadow-amber-950/20"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      {highlighted && (
        <span className="absolute right-3 top-3 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
          Em destaque
        </span>
      )}

      <div className="flex items-center gap-4 pr-16">
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
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Nível
          </p>

          <p className="mt-1 font-black text-white">{clan.clanLevel}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Inscritos
          </p>

          <p className="mt-1 font-black text-white">{clan.members.length}</p>
        </div>
      </div>
    </article>
  );
}

/**
 * Formata a temporada da CWL em português.
 *
 * Exemplo:
 * 2026-08-02 → Agosto de 2026
 */
function formatCwlSeason(season: string): string {
  const [year, month] = season.split("-").map(Number);

  if (!year || !month) {
    return season;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
