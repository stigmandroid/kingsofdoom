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
import { CwlUnavailableState } from "@/components/cwl/CwlUnavailableState";

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
   * Consulta o grupo atual do clã presente na URL.
   */
  const result = await getCurrentCwlGroup(selectedClan.tag);

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
   * Consulta todas as guerras já criadas em todas as
   * rodadas disponíveis da temporada.
   *
   * Cada guerra permanece associada ao índice da rodada
   * à qual pertence.
   */
  /**
   * Localiza a primeira rodada que possui
   * guerras já criadas pela Clash API.
   */
  const firstAvailableRound = result.group.rounds.find((round) =>
    round.warTags.some(isAvailableCwlWarTag),
  );

  /**
   * Mantém somente as tags de guerra válidas.
   *
   * Tags iguais a "#0" representam confrontos
   * que ainda não foram criados.
   */
  const availableWarTags =
    firstAvailableRound?.warTags.filter(isAvailableCwlWarTag) ?? [];

  /**
   * Consulta simultaneamente todos os confrontos
   * da primeira rodada disponível.
   */
  const warResults = await Promise.all(
    availableWarTags.map(async (warTag) => ({
      warTag,
      result: await getCwlWar(warTag),
    })),
  );

  /**
   * Mantém somente as guerras consultadas com sucesso.
   */
  const wars: CwlRoundWar[] = warResults.flatMap(
    ({ warTag, result: warResult }) =>
      warResult.available
        ? [
            {
              warTag,
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

      <CwlRounds
        group={result.group}
        wars={wars}
        highlightedClanTag={selectedClan.tag}
      />
    </main>
  );
}
