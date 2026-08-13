/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cwl/[clan]/page.tsx
 *
 * Responsabilidade:
 * Renderizar a página da Clash War League do clã
 * selecionado na URL.
 *
 * Pós-CWL:
 *
 * - recupera a última temporada pelo SQLite;
 * - reutiliza CwlStandings sem duplicar regra de ranking;
 * - exibe desempenho resumido dos participantes;
 * - mantém o resultado do Passe de Temporada.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 12/08/2026
 *
 * Versão:
 * 0.8.6
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { notFound } from "next/navigation";

import { CwlOverview } from "@/components/cwl/CwlOverview";
import { CwlPostSeasonSummary } from "@/components/cwl/CwlPostSeasonSummary";
import { CwlRoster } from "@/components/cwl/CwlRoster";
import { CwlRounds, type CwlRoundWar } from "@/components/cwl/CwlRounds";
import { CwlSeasonPassEvent } from "@/components/cwl/CwlSeasonPassEvent";
import { CwlSeasonProgress } from "@/components/cwl/CwlSeasonProgress";
import { CwlStandings } from "@/components/cwl/CwlStandings";
import { CwlUnavailableState } from "@/components/cwl/CwlUnavailableState";

import { getClan } from "@/services/clan.service";
import { getLatestCwlPostSeasonSummary } from "@/services/cwl-archive.service";
import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";

import { isAvailableCwlWarTag } from "@/types/cwl";

const cwlClans = {
  kod: {
    slug: "kod",
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },

  "kod-rec": {
    slug: "kod-rec",
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
} as const;

type CwlClanSlug = keyof typeof cwlClans;

type CwlClanPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
  }>;
};

function isCwlClanSlug(value: string): value is CwlClanSlug {
  return value in cwlClans;
}

export default async function CwlClanPage({ params }: CwlClanPageProps) {
  const { locale, clan: clanSlug } = await params;

  if (!isCwlClanSlug(clanSlug)) {
    notFound();
  }

  const selectedClan = cwlClans[clanSlug];

  const [result, clanDetails] = await Promise.all([
    getCurrentCwlGroup(selectedClan.tag),
    getClan(selectedClan.tag),
  ]);

  /**
   * ==========================================================
   * PÓS-CWL
   * ==========================================================
   */
  if (!result.available) {
    const postSeason = getLatestCwlPostSeasonSummary(selectedClan.tag);

    if (!postSeason) {
      return (
        <main className="min-h-screen bg-slate-950 text-white">
          <CwlUnavailableState locale={locale} reason={result.reason} />

          <CwlSeasonPassEvent clanSlug={clanSlug} />
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
              Última temporada
            </p>

            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              CWL — {formatSeasonLabel(postSeason.season, locale)}
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Confira a classificação final, o desempenho dos participantes e o
              resultado oficial do Passe de Temporada.
            </p>
          </div>
        </section>

        {/*
         * Reutiliza exatamente o mesmo componente do ranking ativo.
         *
         * As guerras vêm do SQLite histórico, preservadas ao final
         * da temporada.
         */}
        <CwlStandings
          wars={postSeason.wars}
          leagueName={clanDetails.warLeague?.name}
        />

        <CwlPostSeasonSummary data={postSeason} />

        <CwlSeasonPassEvent clanSlug={clanSlug} />
      </main>
    );
  }

  const availableWars = result.group.rounds.flatMap((round, roundIndex) =>
    round.warTags.filter(isAvailableCwlWarTag).map((warTag) => ({
      warTag,
      roundIndex,
    })),
  );

  const warResults = await Promise.all(
    availableWars.map(async ({ warTag, roundIndex }) => ({
      warTag,
      roundIndex,
      result: await getCwlWar(warTag),
    })),
  );

  const wars: CwlRoundWar[] = warResults.flatMap(
    ({ warTag, roundIndex, result: warResult }) =>
      warResult.available
        ? [
            {
              warTag,
              roundIndex,
              war: warResult.war,
            },
          ]
        : [],
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <CwlOverview group={result.group} highlightedClanTag={selectedClan.tag} />

      <CwlRoster
        clans={result.group.clans}
        highlightedClanTag={selectedClan.tag}
      />

      <CwlStandings wars={wars} leagueName={clanDetails.warLeague?.name} />

      <CwlSeasonProgress wars={wars} totalRounds={result.group.rounds.length} />

      <CwlSeasonPassEvent clanSlug={clanSlug} />

      <CwlRounds
        group={result.group}
        wars={wars}
        locale={locale}
        clanSlug={clanSlug}
        highlightedClanTag={selectedClan.tag}
      />
    </main>
  );
}

/**
 * Converte o identificador persistido da temporada
 * para "Agosto de 2026", "August 2026", etc.
 *
 * Utilizamos somente ano e mês para não expor o dia
 * interno utilizado pela Clash API.
 */
function formatSeasonLabel(season: string, locale: string): string {
  const [year, month] = season.split("-").map(Number);

  if (!year || !month) {
    return season;
  }

  const date = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const formatted = formatter.format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
