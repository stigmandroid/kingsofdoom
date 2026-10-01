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
 * Histórico CWL:
 *
 * - mantém a temporada atual como visualização padrão;
 * - lista todas as temporadas preservadas no SQLite;
 * - permite abrir uma temporada específica por ?season=;
 * - reutiliza CwlStandings sem duplicar regra de ranking;
 * - exibe desempenho resumido dos participantes;
 * - mantém o resultado do Passe de Temporada.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 19/09/2026
 *
 * Versão:
 * 1.0.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { CwlOverview } from "@/components/cwl/CwlOverview";
import { CwlPostSeasonSummary } from "@/components/cwl/CwlPostSeasonSummary";
import { CwlRoster } from "@/components/cwl/CwlRoster";
import { CwlCompetitiveClassification } from "@/components/cwl/CwlCompetitiveClassification";
import { CwlRounds, type CwlRoundWar } from "@/components/cwl/CwlRounds";
import { CwlSeasonPassEvent } from "@/components/cwl/CwlSeasonPassEvent";
import { CwlSeasonProgress } from "@/components/cwl/CwlSeasonProgress";
import { CwlStandings } from "@/components/cwl/CwlStandings";
import { CwlUnavailableState } from "@/components/cwl/CwlUnavailableState";
import { buildCwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";
import { evaluateAllCwlPlayers } from "@/lib/intelligence/cwl/rank-cwl-players";

import { getClan } from "@/services/clan.service";
import {
  getCwlArchiveSeasons,
  getCwlPostSeasonSummary,
  getLatestCwlPostSeasonSummary,
} from "@/services/cwl-archive.service";
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

  searchParams: Promise<{
    season?: string | string[];
  }>;
};

function isCwlClanSlug(value: string): value is CwlClanSlug {
  return value in cwlClans;
}

export default async function CwlClanPage({
  params,
  searchParams,
}: CwlClanPageProps) {
  const { locale, clan: clanSlug } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isCwlClanSlug(clanSlug)) {
    notFound();
  }

  const selectedClan = cwlClans[clanSlug];

  const requestedSeason =
    typeof resolvedSearchParams.season === "string"
      ? resolvedSearchParams.season
      : undefined;

  const archivedSeasons = getCwlArchiveSeasons(selectedClan.tag);

  /**
   * ==========================================================
   * TEMPORADA HISTÓRICA SOLICITADA
   * ==========================================================
   *
   * Quando ?season= estiver presente, a visualização histórica
   * tem prioridade sobre a temporada atual.
   *
   * Nenhuma consulta à Clash API é necessária para reconstruir
   * os dados da temporada arquivada.
   */
  if (requestedSeason) {
    const historicalSeason = getCwlPostSeasonSummary({
      trackedClanTag: selectedClan.tag,
      season: requestedSeason,
    });

    if (!historicalSeason) {
      notFound();
    }

    const clanDetails = await getClan(selectedClan.tag);

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <CwlHistoryNavigation
          locale={locale}
          clanSlug={clanSlug}
          clanName={selectedClan.name}
          seasons={archivedSeasons}
          selectedSeason={historicalSeason.season}
        />

        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
              Temporada histórica
            </p>

            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              CWL — {formatSeasonLabel(historicalSeason.season, locale)}
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Temporada preservada no arquivo histórico da Kings of Doom.
              Confira a classificação final e o desempenho dos participantes.
            </p>
          </div>
        </section>

        <CwlStandings
          wars={historicalSeason.wars}
          leagueName={clanDetails.warLeague?.name}
        />

        <CwlPostSeasonSummary data={historicalSeason} />

        <CwlSeasonPassEvent
          clanSlug={clanSlug}
          season={historicalSeason.season}
        />
      </main>
    );
  }

  /**
   * ==========================================================
   * TEMPORADA ATUAL
   * ==========================================================
   */
  const [result, clanDetails] = await Promise.all([
    getCurrentCwlGroup(selectedClan.tag),
    getClan(selectedClan.tag),
  ]);

  /**
   * ==========================================================
   * PÓS-CWL
   * ==========================================================
   *
   * Quando não existe CWL disponível na API e nenhuma temporada
   * histórica foi solicitada explicitamente, preservamos o
   * comportamento anterior: exibimos a temporada arquivada mais
   * recente.
   */
  if (!result.available) {
    const postSeason = getLatestCwlPostSeasonSummary(selectedClan.tag);

    if (!postSeason) {
      return (
        <main className="min-h-screen bg-slate-950 text-white">
          <CwlHistoryNavigation
            locale={locale}
            clanSlug={clanSlug}
            clanName={selectedClan.name}
            seasons={archivedSeasons}
          />

          <CwlUnavailableState locale={locale} reason={result.reason} />

          <CwlSeasonPassEvent clanSlug={clanSlug} />
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <CwlHistoryNavigation
          locale={locale}
          clanSlug={clanSlug}
          clanName={selectedClan.name}
          seasons={archivedSeasons}
          selectedSeason={postSeason.season}
        />

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

        <CwlStandings
          wars={postSeason.wars}
          leagueName={clanDetails.warLeague?.name}
        />

        <CwlPostSeasonSummary data={postSeason} />

        <CwlSeasonPassEvent clanSlug={clanSlug} season={postSeason.season} />
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

  const competitiveEvidence = buildCwlCompetitiveEvidence();

  const competitivePlayers = evaluateAllCwlPlayers(competitiveEvidence);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <CwlHistoryNavigation
        locale={locale}
        clanSlug={clanSlug}
        clanName={selectedClan.name}
        seasons={archivedSeasons}
        currentSeason={result.group.season}
      />

      <CwlOverview group={result.group} highlightedClanTag={selectedClan.tag} />

      <CwlRoster
        clans={result.group.clans}
        highlightedClanTag={selectedClan.tag}
      />

      <CwlCompetitiveClassification players={competitivePlayers} />

      <CwlStandings wars={wars} leagueName={clanDetails.warLeague?.name} />

      <CwlSeasonProgress wars={wars} totalRounds={result.group.rounds.length} />

      <CwlSeasonPassEvent clanSlug={clanSlug} season={result.group.season} />

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

type CwlHistoryNavigationProps = {
  locale: string;
  clanSlug: CwlClanSlug;
  clanName: string;

  seasons: Array<{
    id: number;
    season: string;
    trackedClanTag: string;
    state: string;
    totalRounds: number;
  }>;

  currentSeason?: string;
  selectedSeason?: string;
};

/**
 * Navegação entre a CWL atual e as temporadas preservadas
 * no arquivo histórico.
 *
 * A lista é alimentada diretamente pelo SQLite. Portanto,
 * novas temporadas arquivadas passam a aparecer aqui sem
 * necessidade de cadastro manual.
 */
function CwlHistoryNavigation({
  locale,
  clanSlug,
  clanName,
  seasons,
  currentSeason,
  selectedSeason,
}: CwlHistoryNavigationProps) {
  const basePath = `/${locale}/cwl/${clanSlug}`;

  return (
    <section className="border-b border-slate-800 bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Histórico CWL
            </p>

            <h2 className="mt-2 text-xl font-black text-white">{clanName}</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentSeason ? (
              <Link
                href={basePath}
                className={
                  !selectedSeason
                    ? "rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
                    : "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
                }
              >
                Temporada atual · {formatSeasonLabel(currentSeason, locale)}
              </Link>
            ) : (
              <Link
                href={basePath}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Visão atual
              </Link>
            )}

            {seasons.map((season) => {
              const isSelected = season.season === selectedSeason;

              return (
                <Link
                  key={season.id}
                  href={`${basePath}?season=${encodeURIComponent(season.season)}`}
                  className={
                    isSelected
                      ? "rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
                      : "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white"
                  }
                >
                  {formatSeasonLabel(season.season, locale)}
                </Link>
              );
            })}
          </div>

          {seasons.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma temporada histórica arquivada até o momento.
            </p>
          ) : null}
        </div>
      </div>
    </section>
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
