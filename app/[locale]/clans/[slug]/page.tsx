/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/clans/[slug]/page.tsx
 *
 * Responsabilidade:
 * Renderizar a Home contextual do Kings of Doom Command Center
 * para o clã selecionado na Navbar.
 *
 * Funcionalidades:
 *
 * - utiliza o slug da URL como contexto único do clã;
 * - carrega dados gerais e guerra atual do clã selecionado;
 * - consolida o pool competitivo de K.O.D. e K.O.D.rec;
 * - aplica os critérios de elegibilidade da KODA;
 * - classifica os jogadores elegíveis;
 * - sugere titulares e reservas;
 * - identifica vagas competitivas e necessidade de recrutamento.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 1.0.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import { notFound } from "next/navigation";

import { KodaCompetitiveHome } from "@/components/home/KodaCompetitiveHome";
import { clans, getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getCurrentWar } from "@/services/war.service";

import { allocateCwlRoster } from "@/lib/intelligence/cwl/allocate-cwl-roster";
import { buildCwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";
import { evaluateCwlEligibility } from "@/lib/intelligence/cwl/evaluate-cwl-eligibility";
import { rankCwlPlayers } from "@/lib/intelligence/cwl/rank-cwl-players";

type ClanPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  const locales = ["pt-BR", "en", "es"];

  return locales.flatMap((locale) =>
    Object.values(clans).map((clan) => ({
      locale,
      slug: clan.slug,
    })),
  );
}

export default async function ClanPage({ params }: ClanPageProps) {
  const { locale, slug } = await params;

  if (slug !== "kod" && slug !== "kod-rec") {
    notFound();
  }

  const clanSlug: "kod" | "kod-rec" = slug;

  const clanConfig = getClanBySlug(clanSlug);

  if (!clanConfig) {
    notFound();
  }

  const [clan, currentWar] = await Promise.all([
    getClan(clanConfig.tag),
    getCurrentWar(clanConfig.tag),
  ]);

  const competitiveEvidence = buildCwlCompetitiveEvidence();

  const evaluations = competitiveEvidence.map((evidence) => ({
    evidence,
    eligibility: evaluateCwlEligibility(evidence),
  }));

  const rankedPlayers = rankCwlPlayers(competitiveEvidence);

  const allocation = allocateCwlRoster(rankedPlayers);

  const eligiblePlayers = evaluations.filter(
    ({ eligibility }) => eligibility.status === "eligible",
  ).length;

  const provisionalPlayers = evaluations.filter(
    ({ eligibility }) => eligibility.status === "provisional",
  ).length;

  const ineligiblePlayers = evaluations.filter(
    ({ eligibility }) => eligibility.status === "ineligible",
  ).length;

  return (
    <KodaCompetitiveHome
      locale={locale}
      clanSlug={clanSlug}
      clan={clan}
      currentWar={currentWar}
      allocation={allocation}
      evaluations={evaluations}
      summary={{
        totalPlayers: competitiveEvidence.length,
        eligiblePlayers,
        provisionalPlayers,
        ineligiblePlayers,
      }}
    />
  );
}
