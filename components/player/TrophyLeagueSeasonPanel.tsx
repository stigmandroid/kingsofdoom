"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/TrophyLeagueSeasonPanel.tsx
 *
 * Responsabilidade:
 * Apresentar o histórico observado da temporada atual da
 * Liga de Troféus de forma compacta e visual.
 *
 * O componente mostra:
 *
 * • pontuação atual da temporada;
 * • variação observada;
 * • registro compacto de movimentações;
 * • ataques classificados;
 * • defesas classificadas;
 * • movimentos ainda não classificados;
 * • estrelas inferidas quando houver classificação
 *   suficiente para isso.
 *
 * Estratégia visual:
 *
 * O registro utiliza abas para evitar a exibição simultânea
 * de dezenas de ataques e defesas.
 *
 * No mobile, os resultados são organizados em três cards por
 * linha para reduzir o espaço vertical da página.
 *
 * Cada card contém somente as informações essenciais da
 * batalha:
 *
 * • pontos;
 * • estrelas, quando disponíveis.
 *
 * A natureza provável dos resultados é informada uma única
 * vez na observação global da interface.
 *
 * Importante:
 *
 * Os movimentos são derivados de snapshots persistidos pelo
 * Command Center.
 *
 * Eles NÃO representam battle log oficial da Clash API.
 *
 * Enquanto a origem de um movimento não puder ser
 * determinada, ele permanece na categoria "Observados" e
 * não é apresentado como ataque ou defesa.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { useMemo, useState } from "react";

import type { TrophyLeagueSeasonHistory } from "@/services/trophy-league-season-history.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type TrophyLeagueSeasonPanelProps = {
  season: TrophyLeagueSeasonHistory | null;
};

type TrophyLeagueRecordTab = "observed" | "attacks" | "defenses";

type TrophyLeagueTimelinePoint = TrophyLeagueSeasonHistory["timeline"][number];

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * ==========================================================
 * COMPONENTE PRINCIPAL
 * ==========================================================
 */

export function TrophyLeagueSeasonPanel({
  season,
}: TrophyLeagueSeasonPanelProps) {
  /**
   * ========================================================
   * ABA ATIVA
   * ========================================================
   */

  const [activeTab, setActiveTab] = useState<TrophyLeagueRecordTab>("observed");

  /**
   * ========================================================
   * MOVIMENTOS CLASSIFICADOS
   * ========================================================
   */

  const { observedMovements, attackMovements, defenseMovements } =
    useMemo(() => {
      if (!season) {
        return {
          observedMovements: [],
          attackMovements: [],
          defenseMovements: [],
        };
      }

      const movements = season.timeline.filter(
        (point) => point.delta !== null && point.delta !== 0,
      );

      return {
        observedMovements: movements.filter(
          (point) =>
            point.eventType === "unclassified" ||
            point.eventType === "aggregate",
        ),

        attackMovements: movements.filter(
          (point) => point.eventType === "possible-attack",
        ),

        defenseMovements: movements.filter(
          (point) => point.eventType === "possible-defense",
        ),
      };
    }, [season]);

  /**
   * ========================================================
   * SEM HISTÓRICO
   * ========================================================
   */

  if (!season) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-4 py-6">
        <p className="text-sm font-semibold text-slate-400">
          Ainda não há histórico observado suficiente para esta temporada.
        </p>
      </div>
    );
  }

  /**
   * ========================================================
   * MOVIMENTOS DA ABA ATIVA
   * ========================================================
   */

  const activeMovements =
    activeTab === "attacks"
      ? attackMovements
      : activeTab === "defenses"
        ? defenseMovements
        : observedMovements;

  const netChangeLabel =
    season.observedNetChange > 0
      ? `+${numberFormatter.format(season.observedNetChange)}`
      : numberFormatter.format(season.observedNetChange);

  return (
    <div className="mt-5 border-t border-slate-800 pt-5">
      {/**
       * ====================================================
       * RESUMO DA TEMPORADA
       * ====================================================
       */}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Temporada observada
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-black text-white">
              {numberFormatter.format(season.currentTrophies)}
            </p>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              pts
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Variação observada
          </p>

          <p
            className={[
              "mt-2 text-lg font-black",
              season.observedNetChange > 0
                ? "text-emerald-300"
                : season.observedNetChange < 0
                  ? "text-rose-300"
                  : "text-slate-300",
            ].join(" ")}
          >
            {netChangeLabel}
          </p>
        </div>
      </div>

      {/**
       * ====================================================
       * REGISTRO DA TEMPORADA
       * ====================================================
       */}

      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Registro da temporada
        </p>

        {/**
         * ==================================================
         * ABAS
         * ==================================================
         */}

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
          <RecordTab
            label="Observados"
            count={observedMovements.length}
            active={activeTab === "observed"}
            onClick={() => setActiveTab("observed")}
          />

          <RecordTab
            label="Ataques"
            count={attackMovements.length}
            active={activeTab === "attacks"}
            onClick={() => setActiveTab("attacks")}
          />

          <RecordTab
            label="Defesas"
            count={defenseMovements.length}
            active={activeTab === "defenses"}
            onClick={() => setActiveTab("defenses")}
          />
        </div>

        {/**
         * ==================================================
         * OBSERVAÇÃO GLOBAL
         * ==================================================
         */}

        <p className="mt-3 text-[10px] leading-4 text-slate-600">
          Os resultados são reconstruídos a partir das movimentações observadas
          pelo Command Center e podem representar inferências.
        </p>

        {/**
         * ==================================================
         * GRID DE RESULTADOS
         * ==================================================
         */}

        {activeMovements.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {activeMovements.map((point) => (
              <BattleResultCard
                key={point.snapshotId}
                point={point}
                activeTab={activeTab}
              />
            ))}
          </div>
        ) : (
          <EmptyRecordState activeTab={activeTab} />
        )}
      </div>

      {/**
       * ====================================================
       * RESUMO COMPACTO
       * ====================================================
       */}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <SeasonMetric label="Ataques" value={attackMovements.length} />

        <SeasonMetric label="Defesas" value={defenseMovements.length} />

        <SeasonMetric label="Observados" value={observedMovements.length} />
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * ABA DO REGISTRO
 * ==========================================================
 */

function RecordTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[9px] font-black uppercase tracking-wide transition",
        active
          ? "bg-slate-800 text-white"
          : "text-slate-500 hover:bg-slate-900 hover:text-slate-300",
      ].join(" ")}
    >
      <span className="truncate">{label}</span>

      <span
        className={[
          "shrink-0 rounded-full px-1.5 py-0.5 text-[8px]",
          active
            ? "bg-slate-700 text-slate-200"
            : "bg-slate-900 text-slate-600",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

/**
 * ==========================================================
 * CARD DE RESULTADO
 * ==========================================================
 *
 * O card foi propositalmente reduzido ao mínimo necessário.
 *
 * Não repetimos "ataque provável" ou "defesa provável" em
 * cada resultado porque essa informação já está representada
 * pela aba ativa e pela observação global.
 */

function BattleResultCard({
  point,
  activeTab,
}: {
  point: TrophyLeagueTimelinePoint;

  activeTab: TrophyLeagueRecordTab;
}) {
  const delta = point.delta ?? 0;

  const formattedDelta =
    delta > 0
      ? `+${numberFormatter.format(delta)}`
      : numberFormatter.format(delta);

  const showStars =
    activeTab !== "observed" && typeof point.inferredStars === "number";

  return (
    <div className="flex min-h-[58px] min-w-0 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/55 px-1 py-2">
      <p
        className={[
          "text-base font-black leading-none",
          delta > 0
            ? "text-emerald-300"
            : delta < 0
              ? "text-rose-300"
              : "text-slate-300",
        ].join(" ")}
      >
        {formattedDelta}
      </p>

      {showStars ? (
        <BattleStars stars={point.inferredStars ?? 0} />
      ) : (
        <span className="mt-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-700">
          observado
        </span>
      )}
    </div>
  );
}

/**
 * ==========================================================
 * ESTRELAS DE BATALHA
 * ==========================================================
 */

function BattleStars({ stars }: { stars: number }) {
  const normalizedStars = Math.max(0, Math.min(3, Math.round(stars)));

  return (
    <div
      className="mt-1.5 flex items-center justify-center gap-px"
      aria-label={`${normalizedStars} de 3 estrelas`}
    >
      {Array.from({
        length: 3,
      }).map((_, index) => {
        const filled = index < normalizedStars;

        return (
          <span
            key={index}
            aria-hidden="true"
            className={[
              "text-xs leading-none",
              filled ? "text-amber-300" : "text-slate-700",
            ].join(" ")}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

/**
 * ==========================================================
 * ESTADO VAZIO
 * ==========================================================
 */

function EmptyRecordState({ activeTab }: { activeTab: TrophyLeagueRecordTab }) {
  const message =
    activeTab === "attacks"
      ? "Nenhum ataque foi classificado até o momento."
      : activeTab === "defenses"
        ? "Nenhuma defesa foi classificada até o momento."
        : "Nenhum movimento não classificado foi observado.";

  return (
    <div className="mt-3 rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center">
      <p className="text-[11px] text-slate-600">{message}</p>
    </div>
  );
}

/**
 * ==========================================================
 * MÉTRICA DE TEMPORADA
 * ==========================================================
 */

function SeasonMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-[68px] flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 px-2 py-2.5 text-center">
      <p className="text-[7px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">
        {numberFormatter.format(value)}
      </p>
    </div>
  );
}
