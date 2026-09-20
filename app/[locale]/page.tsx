/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/page.tsx
 *
 * Responsabilidade:
 * Renderizar a Home do Kings of Doom Command Center,
 * utilizando a KODA como camada central de inteligência
 * competitiva do ecossistema.
 *
 * Funcionalidades:
 *
 * - consolida o pool competitivo de K.O.D. e K.O.D.rec;
 * - analisa evidências competitivas dos últimos 30 dias;
 * - aplica os critérios de elegibilidade da KODA;
 * - classifica os jogadores elegíveis;
 * - sugere titulares e reservas para os dois clãs;
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

import { KodaCompetitiveHome } from "@/components/home/KodaCompetitiveHome";

import { allocateCwlRoster } from "@/lib/intelligence/cwl/allocate-cwl-roster";
import { buildCwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";
import { evaluateCwlEligibility } from "@/lib/intelligence/cwl/evaluate-cwl-eligibility";
import { rankCwlPlayers } from "@/lib/intelligence/cwl/rank-cwl-players";

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

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
