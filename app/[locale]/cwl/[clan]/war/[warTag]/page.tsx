/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cwl/[clan]/war/[warTag]/page.tsx
 *
 * Responsabilidade:
 * Renderizar a visão inicial de uma guerra pertencente
 * à temporada atual da Clash War League.
 *
 * Rotas suportadas:
 *
 * /pt-BR/cwl/kod/war/[warTag]
 * /pt-BR/cwl/kod-rec/war/[warTag]
 *
 * Funcionalidades desta primeira entrega:
 *
 * - valida o clã presente na URL;
 * - consulta a guerra selecionada pela warTag;
 * - apresenta o estado atual do confronto;
 * - exibe o placar de estrelas;
 * - exibe a destruição dos dois clãs;
 * - mostra a quantidade de ataques realizados;
 * - oferece navegação de retorno para a CWL.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 04/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { clans, getClanBySlug } from "@/config/clans";
import { getCwlWar } from "@/services/cwl.service";
import type { CurrentWar } from "@/types/war";
import { CwlWarInteractiveOverview } from "@/components/cwl/CwlWarInteractiveOverview";

/**
 * Propriedades recebidas pela página dinâmica.
 */
type CwlWarPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
    warTag: string;
  }>;
};

/**
 * Renderiza a Sala de Guerra inicial da CWL.
 */
export default async function CwlWarPage({ params }: CwlWarPageProps) {
  const { locale, clan: clanSlug, warTag: encodedWarTag } = await params;

  /**
   * Recupera o clã correspondente ao slug da URL.
   */
  const selectedClan = getClanBySlug(clanSlug);

  /**
   * Interrompe a página quando o slug não pertence
   * a um clã cadastrado no portal.
   */
  if (!selectedClan) {
    notFound();
  }

  /**
   * Decodifica a tag recebida pela URL.
   *
   * A warTag contém o caractere # e, por isso,
   * deve ser codificada ao criar o endereço.
   */
  const warTag = decodeURIComponent(encodedWarTag);

  /**
   * Consulta a guerra individual da CWL.
   */
  const result = await getCwlWar(warTag);

  /**
   * Exibe um estado seguro quando a guerra não puder
   * ser recuperada.
   */
  if (!result.available) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-400">
              Guerra indisponível
            </p>

            <h1 className="mt-4 text-3xl font-black text-white">
              Não foi possível carregar este confronto
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              A guerra pode ainda não estar disponível ou os dados podem estar
              temporariamente indisponíveis.
            </p>

            <Link
              href={`/${locale}/cwl/${clanSlug}`}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300"
            >
              Voltar para a CWL
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const war = result.war;
  const clan = war.clan;
  const opponent = war.opponent;

  /**
   * Evita renderizar uma guerra incompleta.
   */
  if (!clan || !opponent) {
    notFound();
  }

  /**
   * Define qual lado deve começar selecionado.
   *
   * Quando o clã do portal participa do confronto,
   * ele permanece como seleção inicial.
   *
   * Nos demais confrontos, o primeiro lado retornado
   * pela Clash API começa selecionado.
   */
  const initialSelectedClanTag =
    clan.tag === selectedClan.tag
      ? clan.tag
      : opponent.tag === selectedClan.tag
        ? opponent.tag
        : clan.tag;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/cwl/${clanSlug}`}
            className="text-sm font-black text-slate-400 transition hover:text-amber-300"
          >
            ← Voltar para as rodadas
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-400">
                Sala de Guerra da CWL
              </p>

              <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                {clan.name} × {opponent.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                <span>{formatWarState(war.state)}</span>

                <span aria-hidden="true">•</span>

                <span>
                  {war.teamSize ?? "—"} × {war.teamSize ?? "—"}
                </span>

                <span aria-hidden="true">•</span>

                <span>{warTag}</span>
              </div>
            </div>

            <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300">
              {clan.tag === selectedClan.tag ||
              opponent.tag === selectedClan.tag
                ? "Nosso confronto"
                : "Confronto da rodada"}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CwlWarInteractiveOverview
          clan={clan}
          opponent={opponent}
          initialSelectedClanTag={initialSelectedClanTag}
          teamSize={war.teamSize}
        />
      </section>
    </main>
  );
}

/**
 * Traduz o estado da guerra.
 */
function formatWarState(state: CurrentWar["state"]): string {
  switch (state) {
    case "preparation":
      return "Preparação";

    case "inWar":
      return "Em andamento";

    case "warEnded":
      return "Encerrada";

    default:
      return "Indisponível";
  }
}
