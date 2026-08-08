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
 * Rotas suportadas:
 *
 * /pt-BR/cwl/kod
 * /pt-BR/cwl/kod-rec
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

import { notFound } from "next/navigation";

import { CwlOverview } from "@/components/cwl/CwlOverview";
import { CwlRoster } from "@/components/cwl/CwlRoster";
import { CwlRounds, type CwlRoundWar } from "@/components/cwl/CwlRounds";
import { CwlStandings } from "@/components/cwl/CwlStandings";
import { CwlUnavailableState } from "@/components/cwl/CwlUnavailableState";
import { getClan } from "@/services/clan.service";

import { getCurrentCwlGroup, getCwlWar } from "@/services/cwl.service";

import { isAvailableCwlWarTag } from "@/types/cwl";

/**
 * Clãs oficialmente suportados pela página da CWL.
 *
 * As tags ficam associadas aos mesmos slugs utilizados
 * nas demais páginas do portal.
 */
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

/**
 * Slugs aceitos pela rota.
 */
type CwlClanSlug = keyof typeof cwlClans;

/**
 * Propriedades recebidas pela página dinâmica.
 */
type CwlClanPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
  }>;
};

/**
 * Verifica se o slug informado pertence a um
 * dos clãs suportados.
 */
function isCwlClanSlug(value: string): value is CwlClanSlug {
  return value in cwlClans;
}

/**
 * Renderiza a CWL do clã selecionado.
 */
export default async function CwlClanPage({ params }: CwlClanPageProps) {
  const { locale, clan: clanSlug } = await params;

  /**
   * Interrompe a página caso o slug não seja reconhecido.
   */
  if (!isCwlClanSlug(clanSlug)) {
    notFound();
  }

  const selectedClan = cwlClans[clanSlug];

  /**
   * Consulta simultaneamente:
   *
   * - o grupo atual da CWL;
   * - os dados gerais do clã selecionado.
   *
   * Os dados gerais são utilizados para identificar
   * a liga atual do clã e, consequentemente, as zonas
   * de promoção e rebaixamento.
   */
  const [result, clanDetails] = await Promise.all([
    getCurrentCwlGroup(selectedClan.tag),
    getClan(selectedClan.tag),
  ]);

  /**
   * Quando não existe CWL ativa para o clã selecionado,
   * apresenta o estado vazio profissional.
   */
  if (!result.available) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <CwlUnavailableState locale={locale} reason={result.reason} />
      </main>
    );
  }

  /**
   * Reúne todas as guerras válidas já criadas em todas
   * as rodadas da temporada.
   *
   * A posição da rodada é preservada para que o componente
   * consiga identificar corretamente qual rodada está ativa.
   */
  const availableWars = result.group.rounds.flatMap((round, roundIndex) =>
    round.warTags.filter(isAvailableCwlWarTag).map((warTag) => ({
      warTag,
      roundIndex,
    })),
  );

  /**
   * Consulta simultaneamente todos os confrontos já criados
   * em todas as rodadas disponíveis da temporada.
   */
  const warResults = await Promise.all(
    availableWars.map(async ({ warTag, roundIndex }) => ({
      warTag,
      roundIndex,
      result: await getCwlWar(warTag),
    })),
  );

  /**
   * Mantém somente as guerras consultadas com sucesso.
   *
   * O número da rodada acompanha cada guerra para permitir
   * a seleção automática da rodada atual.
   */
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
