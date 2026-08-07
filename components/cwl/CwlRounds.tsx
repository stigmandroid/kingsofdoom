"use client";
/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlRounds.tsx
 *
 * Responsabilidade:
 * Apresentar as rodadas e os confrontos disponíveis
 * no grupo atual da Clash War League.
 *
 * Funcionalidades:
 *
 * - Exibe todas as rodadas da temporada;
 * - identifica rodadas já criadas;
 * - destaca a primeira rodada disponível;
 * - consulta os confrontos da rodada selecionada;
 * - destaca o confronto do clã de referência;
 * - prepara a navegação futura para a guerra detalhada;
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

import type { CwlGroup } from "@/types/cwl";
import { isAvailableCwlWarTag } from "@/types/cwl";
import type { CurrentWar, WarClan } from "@/types/war";
import Link from "next/link";
import { useState } from "react";
import {
  calculateCwlMatchOutlook,
  type CwlMatchOutlook,
} from "@/lib/cwl/calculate-cwl-match-outlook";

/**
 * Representa uma guerra da CWL associada à tag
 * utilizada para consultá-la.
 */
export type CwlRoundWar = {
  warTag: string;

  /**
   * Índice da rodada dentro da temporada.
   *
   * Rodada 1 = índice 0
   * Rodada 2 = índice 1
   */
  roundIndex: number;

  war: CurrentWar;
};

/**
 * Propriedades recebidas pelo componente de rodadas.
 */
type CwlRoundsProps = {
  group: CwlGroup;
  wars: CwlRoundWar[];

  /**
   * Slug do clã selecionado na URL.
   */
  clanSlug: string;

  /**
   * Idioma atual da aplicação.
   */
  locale: string;

  highlightedClanTag?: string;
};

/**
 * Renderiza as rodadas e os confrontos da temporada.
 */
export function CwlRounds({
  group,
  wars,
  clanSlug,
  locale,
  highlightedClanTag,
}: CwlRoundsProps) {
  /**
   * Identifica automaticamente a rodada atual.
   *
   * Prioridade:
   * 1. Guerra em andamento;
   * 2. Guerra em preparação;
   * 3. Última rodada encerrada;
   * 4. Primeira rodada disponível.
   */
  const initialRoundIndex =
    wars.find(({ war }) => war.state === "inWar")?.roundIndex ??
    wars.find(({ war }) => war.state === "preparation")?.roundIndex ??
    [...wars].reverse().find(({ war }) => war.state === "warEnded")
      ?.roundIndex ??
    group.rounds.findIndex((round) => round.warTags.some(isAvailableCwlWarTag));

  /**
   * Rodada atualmente selecionada pelo usuário.
   */
  const [selectedRoundIndex, setSelectedRoundIndex] = useState(
    initialRoundIndex >= 0 ? initialRoundIndex : 0,
  );

  /**
   * Mantém somente os confrontos pertencentes
   * à rodada selecionada.
   */
  const selectedRoundWars = wars.filter(
    ({ roundIndex }) => roundIndex === selectedRoundIndex,
  );

  /**
   * Considera a rodada iniciada quando ao menos uma guerra
   * da rodada selecionada está em andamento ou encerrada.
   */
  const roundHasStarted = selectedRoundWars.some(
    ({ war }) => war.state === "inWar" || war.state === "warEnded",
  );

  return (
    <section className="border-t border-slate-800 bg-slate-900/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
              Calendário da liga
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Rodadas e confrontos
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Acompanhe quais rodadas já foram criadas e consulte os confrontos
              disponíveis na temporada atual.
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-500">
            {group.rounds.length} rodadas na temporada
          </p>
        </div>

        {/*
         * Navegação interativa das rodadas.
         *
         * A rodada atual é selecionada automaticamente na abertura,
         * mas o usuário pode consultar qualquer rodada já criada.
         */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {group.rounds.map((round, index) => {
            const available = round.warTags.some(isAvailableCwlWarTag);
            const active = index === selectedRoundIndex;

            /**
             * Localiza o confronto do clã selecionado
             * dentro desta rodada.
             */
            const highlightedWar = wars.find(
              ({ roundIndex, war }) =>
                roundIndex === index &&
                (war.clan?.tag === highlightedClanTag ||
                  war.opponent?.tag === highlightedClanTag),
            );

            /**
             * Identifica o adversário do clã selecionado
             * nesta rodada.
             */
            const opponentName = highlightedWar
              ? highlightedWar.war.clan?.tag === highlightedClanTag
                ? highlightedWar.war.opponent?.name
                : highlightedWar.war.clan?.name
              : undefined;

            /**
             * Calcula o estado do confronto do clã selecionado
             * dentro da rodada atual do calendário.
             */
            const roundStatus = getHighlightedRoundStatus(
              highlightedWar,
              highlightedClanTag,
            );

            return (
              <button
                key={`round-${index + 1}`}
                type="button"
                onClick={() => {
                  if (available) {
                    setSelectedRoundIndex(index);
                  }
                }}
                disabled={!available}
                aria-pressed={active}
                className={`min-h-[192px] rounded-2xl border p-4 text-center transition ${
                  active
                    ? "border-amber-400/50 bg-amber-400/10"
                    : available
                      ? "border-emerald-400/30 bg-emerald-400/10 hover:border-emerald-300/60 hover:bg-emerald-400/15"
                      : "cursor-not-allowed border-slate-800 bg-slate-950/60"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Rodada
                </p>

                <p
                  className={`mt-2 text-2xl font-black ${
                    active
                      ? "text-amber-300"
                      : available
                        ? "text-emerald-300"
                        : "text-slate-500"
                  }`}
                >
                  {index + 1}
                </p>

                {active && (
                  <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Selecionada
                  </p>
                )}

                {opponentName ? (
                  <p
                    translate="no"
                    title={opponentName}
                    className="notranslate mt-3 truncate text-xs font-black text-slate-300"
                  >
                    vs {opponentName}
                  </p>
                ) : (
                  <p className="mt-3 text-[10px] font-bold leading-4 text-slate-600">
                    Aguardando criação da guerra
                  </p>
                )}
                <p
                  className={`mt-3 text-[10px] font-black uppercase tracking-wider ${roundStatus.className}`}
                >
                  {roundStatus.label}
                </p>
              </button>
            );
          })}
        </div>

        {/*
         * Confrontos pertencentes à rodada selecionada.
         */}
        <div className="mt-12">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Rodada selecionada
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                Rodada {selectedRoundIndex + 1}
              </h3>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              {selectedRoundWars.length} confrontos disponíveis
            </p>
          </div>

          {selectedRoundWars.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {selectedRoundWars.map(({ warTag, war }) => (
                <CwlMatchCard
                  key={warTag}
                  warTag={warTag}
                  war={war}
                  locale={locale}
                  clanSlug={clanSlug}
                  highlightedClanTag={highlightedClanTag}
                  roundHasStarted={roundHasStarted}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-8 text-center">
              <p className="font-black text-white">
                Nenhum confronto disponível
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                As guerras desta rodada ainda não foram criadas pela Clash API.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Estado resumido do confronto do clã selecionado
 * dentro de uma rodada da CWL.
 */
type CwlRoundStatus = {
  label: string;
  className: string;
};

/**
 * Identifica o estado e o resultado do confronto
 * pertencente ao clã selecionado.
 */
function getHighlightedRoundStatus(
  highlightedWar: CwlRoundWar | undefined,
  highlightedClanTag?: string,
): CwlRoundStatus {
  /**
   * A Supercell ainda não criou a guerra desta rodada.
   */
  if (!highlightedWar || !highlightedClanTag) {
    return {
      label: "Ainda não disponível",
      className: "text-slate-600",
    };
  }

  const { war } = highlightedWar;
  const clan = war.clan;
  const opponent = war.opponent;

  /**
   * Evita calcular o resultado sem os dois lados
   * completos do confronto.
   */
  if (!clan || !opponent) {
    return {
      label: "Dados indisponíveis",
      className: "text-slate-600",
    };
  }

  if (war.state === "preparation") {
    return {
      label: "Preparação",
      className: "text-amber-300",
    };
  }

  /**
   * Coloca o clã selecionado sempre como referência
   * para determinar vitória, derrota ou situação parcial.
   */
  const ownClan = clan.tag === highlightedClanTag ? clan : opponent;

  const enemyClan = clan.tag === highlightedClanTag ? opponent : clan;

  const ownClanIsAhead =
    ownClan.stars > enemyClan.stars ||
    (ownClan.stars === enemyClan.stars &&
      ownClan.destructionPercentage > enemyClan.destructionPercentage);

  const enemyClanIsAhead =
    enemyClan.stars > ownClan.stars ||
    (enemyClan.stars === ownClan.stars &&
      enemyClan.destructionPercentage > ownClan.destructionPercentage);

  if (war.state === "warEnded") {
    if (ownClanIsAhead) {
      return {
        label: "Vitória",
        className: "text-emerald-300",
      };
    }

    if (enemyClanIsAhead) {
      return {
        label: "Derrota",
        className: "text-red-300",
      };
    }

    return {
      label: "Empate",
      className: "text-slate-300",
    };
  }

  /**
   * Situação parcial de uma guerra em andamento.
   */
  if (ownClanIsAhead) {
    return {
      label: "Na frente",
      className: "text-emerald-300",
    };
  }

  if (enemyClanIsAhead) {
    return {
      label: "Atrás no placar",
      className: "text-red-300",
    };
  }

  return {
    label: "Empate parcial",
    className: "text-sky-300",
  };
}

/**
 * Propriedades de um card de confronto.
 */
type CwlMatchCardProps = {
  warTag: string;
  war: CurrentWar;
  locale: string;
  clanSlug: string;
  highlightedClanTag?: string;
  roundHasStarted: boolean;
};

/**
 * Exibe um confronto entre dois clãs.
 */
function CwlMatchCard({
  warTag,
  war,
  locale,
  clanSlug,
  highlightedClanTag,
  roundHasStarted,
}: CwlMatchCardProps) {
  const clan = war.clan;
  const opponent = war.opponent;

  /**
   * Evita renderização incompleta caso a API não devolva
   * um dos lados da guerra.
   */
  if (!clan || !opponent) {
    return null;
  }

  const highlighted =
    clan.tag === highlightedClanTag || opponent.tag === highlightedClanTag;

  /**
   * Analisa todos os confrontos após o início da batalha.
   *
   * O clã exibido à esquerda é utilizado como referência.
   * O resultado poderá apontar vitória, derrota ou cenário
   * ainda matematicamente aberto.
   */
  const matchOutlook =
    war.state !== "preparation"
      ? calculateCwlMatchOutlook({
          war,
          referenceClanTag: clan.tag,
        })
      : null;

  /**
   * Identifica o resultado parcial ou final do confronto.
   */
  /**
   * Identifica o resultado parcial ou final do confronto.
   */
  const matchResult = getCwlMatchResult({
    warState: war.state,
    roundHasStarted,

    clanName: clan.name,
    clanStars: clan.stars,
    clanDestruction: clan.destructionPercentage,
    clanAttacks: clan.attacks,

    opponentName: opponent.name,
    opponentStars: opponent.stars,
    opponentDestruction: opponent.destructionPercentage,
    opponentAttacks: opponent.attacks,
  });

  /**
   * Mensagem resumida da análise matemática.
   */
  const outlookLabel = getCwlOutlookLabel({
    outlook: matchOutlook,
    referenceClan: clan,
    opponentClan: opponent,
  });

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${
        highlighted
          ? "border-amber-400/50 bg-amber-400/10 shadow-lg shadow-amber-950/20"
          : "border-slate-800 bg-slate-950/70"
      }`}
    >
      {highlighted && (
        <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
          Nosso confronto
        </span>
      )}

      <div className="pr-28">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600">
          {formatWarState(war.state)}
        </p>

        <p className="mt-2 text-xs font-semibold text-slate-500">{warTag}</p>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <CwlMatchClan
          name={clan.name}
          badgeUrl={clan.badgeUrls.medium}
          stars={clan.stars}
          destruction={clan.destructionPercentage}
          alignment="left"
          highlighted={clan.tag === highlightedClanTag}
        />

        <div className="flex flex-col items-center">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">
            VS
          </span>

          <span className="mt-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-black text-white">
            {war.teamSize ?? "—"} × {war.teamSize ?? "—"}
          </span>
        </div>

        <CwlMatchClan
          name={opponent.name}
          badgeUrl={opponent.badgeUrls.medium}
          stars={opponent.stars}
          destruction={opponent.destructionPercentage}
          alignment="right"
          highlighted={opponent.tag === highlightedClanTag}
        />
      </div>

      <div className="mt-5 flex justify-center">
        <div
          title={outlookLabel?.description ?? matchResult.description}
          className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-center ${
            outlookLabel?.className ?? matchResult.className
          }`}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-current"
          />

          <p className="text-[10px] font-black uppercase tracking-[0.14em] sm:text-xs">
            {outlookLabel?.label ?? matchResult.label}
          </p>
        </div>
      </div>

      {/*
       * Resumo dos ataques realizados pelos dois clãs.
       */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
            Ataques de {clan.name}
          </p>

          <p className="mt-1 text-lg font-black text-white">{clan.attacks}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-right">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
            Ataques de {opponent.name}
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {opponent.attacks}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-500">
          Início: {formatClashDate(war.startTime)}
        </p>

        <Link
          href={`/${locale}/cwl/${clanSlug}/war/${encodeURIComponent(warTag)}`}
          className="inline-flex items-center justify-center rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-amber-300 transition hover:border-amber-300 hover:bg-amber-400/20"
        >
          Ver guerra
        </Link>
      </div>
    </article>
  );
}

/**
 * Propriedades de uma métrica da análise matemática.
 */
type CwlOutlookMetricProps = {
  label: string;
  value: string | number;
};

/**
 * Exibe uma métrica resumida da perspectiva matemática
 * do confronto.
 */
function CwlOutlookMetric({ label, value }: CwlOutlookMetricProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

/**
 * Gera uma mensagem curta e objetiva para representar
 * a situação matemática atual do confronto.
 *
 * Regras visuais:
 *
 * - verde: clã atualmente na frente;
 * - azul: clã atrás ainda consegue alterar o resultado;
 * - vermelho: derrota matematicamente confirmada.
 */
function getCwlOutlookLabel({
  outlook,
  referenceClan,
  opponentClan,
}: {
  outlook: CwlMatchOutlook | null;
  referenceClan: WarClan;
  opponentClan: WarClan;
}): {
  label: string;
  description: string;
  className: string;
} | null {
  if (!outlook) {
    return null;
  }

  /**
   * O clã usado como referência não consegue mais alcançar
   * o resultado atual do adversário.
   */
  if (
    outlook.status === "confirmedDefeat" ||
    outlook.status === "finishedDefeat"
  ) {
    return {
      label: `${referenceClan.name}: derrota confirmada · máximo ${outlook.maximumPossibleStars} ★`,
      description: outlook.description,
      className: "border-red-400/30 bg-red-400/10 text-red-300",
    };
  }

  /**
   * Quando a vitória do clã de referência está confirmada,
   * comunicamos a derrota do outro lado.
   *
   * Isso mantém o padrão solicitado: sempre destacar
   * explicitamente qual clã não possui mais chances.
   */
  if (
    outlook.status === "confirmedVictory" ||
    outlook.status === "finishedVictory"
  ) {
    return {
      label: `${opponentClan.name}: derrota confirmada · máximo ${outlook.enemyMaximumPossibleStars} ★`,
      description: outlook.description,
      className: "border-red-400/30 bg-red-400/10 text-red-300",
    };
  }

  if (outlook.status === "finishedDraw") {
    return {
      label: "Confronto empatado",
      description: outlook.description,
      className: "border-slate-600 bg-slate-800/70 text-slate-300",
    };
  }

  /**
   * Compara primeiro as estrelas e depois a destruição,
   * seguindo o critério utilizado no resultado da guerra.
   */
  const referenceClanIsAhead =
    referenceClan.stars > opponentClan.stars ||
    (referenceClan.stars === opponentClan.stars &&
      referenceClan.destructionPercentage > opponentClan.destructionPercentage);

  const opponentClanIsAhead =
    opponentClan.stars > referenceClan.stars ||
    (opponentClan.stars === referenceClan.stars &&
      opponentClan.destructionPercentage > referenceClan.destructionPercentage);

  /**
   * O clã de referência está vencendo no placar atual.
   */
  if (referenceClanIsAhead) {
    return {
      label: `${referenceClan.name} está na frente`,
      description: "O clã está na frente considerando estrelas e destruição.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    };
  }

  /**
   * O adversário está na frente, mas o clã de referência
   * ainda consegue ultrapassá-lo em estrelas.
   */
  if (
    opponentClanIsAhead &&
    outlook.maximumPossibleStars > outlook.enemyStars
  ) {
    return {
      label: `${referenceClan.name} ainda pode vencer · precisa de ${outlook.starsNeededToLead} ★`,
      description:
        outlook.enemyRemainingAttacks > 0
          ? `${opponentClan.name} ainda possui ataques e a meta pode mudar.`
          : "O clã ainda consegue assumir a liderança com os ataques restantes.",
      className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    };
  }

  /**
   * O máximo possível permite apenas igualar as estrelas.
   * Nesse caso, a destruição decidirá o confronto.
   */
  if (
    opponentClanIsAhead &&
    outlook.maximumPossibleStars === outlook.enemyStars
  ) {
    return {
      label: `${referenceClan.name} ainda pode empatar · precisa de ${outlook.starsNeededToTie} ★ + destruição`,
      description:
        "Com igualdade nas estrelas, será necessário superar a destruição do adversário.",
      className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    };
  }

  /**
   * Placar completamente empatado no momento.
   */
  return {
    label: "Confronto empatado",
    description:
      "Os dois clãs possuem o mesmo número de estrelas e destruição.",
    className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  };
}

/**
 * Dados necessários para calcular o resultado
 * parcial ou final de um confronto.
 */
type CwlMatchResultInput = {
  warState: CurrentWar["state"];
  roundHasStarted: boolean;

  clanName: string;
  clanStars: number;
  clanDestruction: number;
  clanAttacks: number;

  opponentName: string;
  opponentStars: number;
  opponentDestruction: number;
  opponentAttacks: number;
};

/**
 * Resultado visual de um confronto.
 */
type CwlMatchResult = {
  label: string;
  description: string;
  className: string;
};

/**
 * Identifica o estado e o resultado parcial ou final
 * de um confronto da CWL.
 */
function getCwlMatchResult({
  warState,
  roundHasStarted,
  clanName,
  clanStars,
  clanDestruction,
  clanAttacks,
  opponentName,
  opponentStars,
  opponentDestruction,
  opponentAttacks,
}: CwlMatchResultInput): CwlMatchResult {
  const isFinished = warState === "warEnded";

  /**
   * Nenhum dos dois clãs realizou ataques.
   *
   * Quando outros confrontos da rodada já começaram,
   * não tratamos mais esse duelo como preparação.
   */
  const hasNoAttacks = clanAttacks === 0 && opponentAttacks === 0;

  if (hasNoAttacks && roundHasStarted) {
    return {
      label: "Aguardando os primeiros ataques",
      description: "Nenhum dos dois clãs realizou ataques neste confronto.",
      className: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    };
  }

  /**
   * A rodada inteira ainda está em preparação.
   */
  if (warState === "preparation" && !roundHasStarted) {
    return {
      label: "Confronto em preparação",
      description: "O placar será atualizado quando a batalha começar.",
      className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    };
  }

  const clanIsLeading =
    clanStars > opponentStars ||
    (clanStars === opponentStars && clanDestruction > opponentDestruction);

  const opponentIsLeading =
    opponentStars > clanStars ||
    (opponentStars === clanStars && opponentDestruction > clanDestruction);

  if (!clanIsLeading && !opponentIsLeading) {
    return {
      label: isFinished ? "Confronto empatado" : "Empate parcial",
      description: hasNoAttacks
        ? "Os dois clãs ainda estão sem ataques."
        : "Os dois clãs possuem o mesmo resultado.",
      className: "border-slate-600 bg-slate-800/70 text-slate-300",
    };
  }

  const leadingClanName = clanIsLeading ? clanName : opponentName;

  return {
    label: isFinished
      ? `${leadingClanName} venceu`
      : `${leadingClanName} está na frente`,
    description: isFinished
      ? "Resultado final do confronto."
      : "Resultado parcial atualizado pela Clash API.",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };
}

/**
 * Propriedades de um dos clãs no confronto.
 */
type CwlMatchClanProps = {
  name: string;
  badgeUrl: string;
  stars: number;
  destruction: number;
  alignment: "left" | "right";

  /**
   * Indica se este lado representa o clã selecionado.
   */
  highlighted?: boolean;
};

/**
 * Exibe um dos clãs participantes do confronto.
 */
function CwlMatchClan({
  name,
  badgeUrl,
  stars,
  destruction,
  alignment,
  highlighted = false,
}: CwlMatchClanProps) {
  /**
   * Mantém cada clã em seu respectivo lado do card,
   * mas centraliza internamente escudo, nome e placar.
   */
  const alignmentClassName =
    alignment === "left" ? "justify-self-start" : "justify-self-end";

  return (
    <div
      className={`flex w-full max-w-[190px] min-w-0 flex-col items-center text-center ${alignmentClassName}`}
    >
      <Image
        src={badgeUrl}
        alt={`Escudo oficial do clã ${name}`}
        width={72}
        height={72}
        className={`h-16 w-16 object-contain ${
          highlighted ? "drop-shadow-[0_0_16px_rgba(251,191,36,0.35)]" : ""
        }`}
      />

      <p
        translate="no"
        className={`notranslate mt-3 w-full truncate font-black ${
          highlighted ? "text-amber-300" : "text-white"
        }`}
      >
        {name}
      </p>

      <div className="mt-4 flex flex-col items-center">
        <div
          className={`inline-flex min-w-20 items-center justify-center gap-2 rounded-xl border px-4 py-2 ${
            highlighted
              ? "border-amber-300/60 bg-amber-400/15 shadow-lg shadow-amber-950/20"
              : "border-amber-400/30 bg-amber-400/10"
          }`}
        >
          <span
            aria-hidden="true"
            className="text-xl leading-none text-amber-300"
          >
            ★
          </span>

          <span className="text-2xl font-black leading-none text-amber-300 sm:text-3xl">
            {stars}
          </span>
        </div>

        <p
          className={`mt-2 whitespace-nowrap text-sm font-black ${
            highlighted ? "text-amber-200" : "text-slate-300"
          }`}
        >
          {formatPercentage(destruction)}
        </p>
      </div>
    </div>
  );
}

/**
 * Traduz o estado de uma guerra da CWL.
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

/**
 * Formata a porcentagem de destruição.
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

/**
 * Formata a data da Clash API.
 */
function formatClashDate(value?: string): string {
  if (!value) {
    return "A definir";
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);

  if (!match) {
    return value;
  }

  const [, year, month, day, hour, minute, second] = match;

  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
