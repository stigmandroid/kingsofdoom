"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/TrophyLeagueSeasonPanel.tsx
 *
 * Responsabilidade:
 * Apresentar o desempenho da temporada atual da Liga de
 * Troféus utilizando dados reais de ataques e defesas
 * retornados pelo leagueGroup da Clash API.
 *
 * O componente apresenta:
 *
 * • pontuação atual da temporada;
 * • quantidade total de ataques;
 * • quantidade total de defesas;
 * • pontos acumulados em ataques;
 * • pontos acumulados em defesas;
 * • estrelas de cada batalha;
 * • percentual de destruição;
 * • navegação compacta entre Ataques e Defesas.
 *
 * Estratégia visual:
 *
 * • três resultados por linha no mobile;
 * • abas dedicadas para Ataques e Defesas;
 * • cards compactos para reduzir scroll;
 * • dados reais da Ranked League, sem inferência de
 *   classificação entre ataque e defesa.
 *
 * Importante:
 *
 * Em ataques:
 * estrelas e destruição representam o desempenho do jogador.
 *
 * Em defesas:
 * estrelas e destruição representam o desempenho obtido pelo
 * adversário contra o jogador.
 *
 * Os snapshots continuam existindo no backend para histórico,
 * evolução de pontuação, auditoria e Clan Score, mas não são
 * mais utilizados como fonte principal do registro visual das
 * batalhas.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { useState } from "react";

import type { TrophyLeagueSeasonHistory } from "@/services/trophy-league-season-history.service";

import type {
  TrophyLeagueBattle,
  TrophyLeagueBattleSummary,
} from "@/services/trophy-league-battle.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type TrophyLeagueSeasonPanelProps = {
  season: TrophyLeagueSeasonHistory | null;

  battles?: TrophyLeagueBattleSummary | null;
};

type TrophyLeagueRecordTab = "attacks" | "defenses";

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
  battles = null,
}: TrophyLeagueSeasonPanelProps) {
  const [activeTab, setActiveTab] = useState<TrophyLeagueRecordTab>("attacks");

  /**
   * ========================================================
   * SEM DADOS
   * ========================================================
   */

  if (!season && !battles) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-4 py-5 text-center">
        <p className="text-sm font-semibold text-slate-400">
          Ainda não há dados disponíveis para esta temporada.
        </p>
      </div>
    );
  }

  /**
   * ========================================================
   * DADOS DA TEMPORADA
   * ========================================================
   */

  const currentTrophies =
    season?.currentTrophies ?? battles?.totalBattleTrophies ?? 0;

  const attacks = battles?.attacks ?? [];

  const defenses = battles?.defenses ?? [];

  const attackTrophies = battles?.attackTrophies ?? 0;

  const defenseTrophies = battles?.defenseTrophies ?? 0;

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
            Temporada atual
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-black text-white">
              {numberFormatter.format(currentTrophies)}
            </p>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              pts
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Batalhas registradas
          </p>

          <p className="mt-2 text-lg font-black text-white">
            {numberFormatter.format(attacks.length + defenses.length)}
          </p>
        </div>
      </div>

      {/**
       * ====================================================
       * RESUMO OFENSIVO / DEFENSIVO
       * ====================================================
       */}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <SeasonSummaryMetric
          label="Ataques"
          count={attacks.length}
          trophies={attackTrophies}
          accent="attack"
        />

        <SeasonSummaryMetric
          label="Defesas"
          count={defenses.length}
          trophies={defenseTrophies}
          accent="defense"
        />
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

        <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
          <RecordTab
            label="Ataques"
            count={attacks.length}
            active={activeTab === "attacks"}
            onClick={() => setActiveTab("attacks")}
          />

          <RecordTab
            label="Defesas"
            count={defenses.length}
            active={activeTab === "defenses"}
            onClick={() => setActiveTab("defenses")}
          />
        </div>

        {/**
         * ==================================================
         * CONTEÚDO DA ABA
         * ==================================================
         */}

        {activeTab === "attacks" ? (
          <BattleCategory
            title="Ataques"
            battles={attacks}
            totalTrophies={attackTrophies}
            type="attack"
          />
        ) : (
          <BattleCategory
            title="Defesas"
            battles={defenses}
            totalTrophies={defenseTrophies}
            type="defense"
          />
        )}
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * RESUMO DA TEMPORADA
 * ==========================================================
 */

function SeasonSummaryMetric({
  label,
  count,
  trophies,
  accent,
}: {
  label: string;

  count: number;

  trophies: number;

  accent: "attack" | "defense";
}) {
  return (
    <div
      className={[
        "rounded-xl border px-3 py-3 text-center",
        accent === "attack"
          ? "border-amber-400/15 bg-amber-400/[0.025]"
          : "border-sky-400/15 bg-sky-400/[0.025]",
      ].join(" ")}
    >
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-base font-black text-white">
        {numberFormatter.format(count)}
      </p>

      <p className="mt-1 text-xs font-black text-emerald-300">
        +{numberFormatter.format(trophies)} pts
      </p>
    </div>
  );
}

/**
 * ==========================================================
 * ABA
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
        "flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-[9px] font-black uppercase tracking-wide transition",
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
 * CATEGORIA DE BATALHAS
 * ==========================================================
 */

function BattleCategory({
  title,
  battles,
  totalTrophies,
  type,
}: {
  title: string;

  battles: TrophyLeagueBattle[];

  totalTrophies: number;

  type: "attack" | "defense";
}) {
  if (battles.length === 0) {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center">
        <p className="text-[11px] text-slate-600">
          Nenhum registro disponível nesta categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/**
       * ====================================================
       * TOTAL DA CATEGORIA
       * ====================================================
       */}

      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
          {battles.length} {title.toLowerCase()}
        </p>

        <p className="text-xs font-black text-emerald-300">
          +{numberFormatter.format(totalTrophies)} pts
        </p>
      </div>

      {/**
       * ====================================================
       * GRID
       * ====================================================
       */}

      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {battles.map((battle, index) => (
          <BattleResultCard
            key={`${battle.creationTime ?? "battle"}-${battle.opponentPlayerTag ?? "unknown"}-${index}`}
            battle={battle}
            type={type}
          />
        ))}
      </div>

      {/**
       * ====================================================
       * OBSERVAÇÃO DEFENSIVA
       * ====================================================
       */}

      {type === "defense" && (
        <p className="mt-3 text-[10px] leading-4 text-slate-600">
          Nas defesas, estrelas e destruição representam o resultado obtido pelo
          adversário.
        </p>
      )}
    </div>
  );
}

/**
 * ==========================================================
 * CARD DE BATALHA
 * ==========================================================
 *
 * Linguagem visual:
 *
 * ATAQUES
 *
 * • +40:
 *   resultado perfeito;
 *   recebe destaque dourado.
 *
 * • demais resultados:
 *   permanecem neutros;
 *   recebem contorno discretamente quente.
 *
 * DEFESAS
 *
 * • +40:
 *   defesa perfeita;
 *   o adversário não conquistou troféus;
 *   recebe destaque dourado.
 *
 * • +0:
 *   defesa totalmente comprometida;
 *   o adversário conquistou o máximo;
 *   recebe destaque vermelho.
 *
 * • +1 até +39:
 *   resultado defensivo parcial;
 *   permanece neutro com tonalidade fria.
 *
 * Todos os cards possuem contorno para manter consistência
 * visual na grade.
 */
function BattleResultCard({
  battle,
  type,
}: {
  battle: TrophyLeagueBattle;

  type: "attack" | "defense";
}) {
  /**
   * ========================================================
   * CLASSIFICAÇÃO VISUAL
   * ========================================================
   */

  const isPerfectAttack = type === "attack" && battle.trophies === 40;

  const isPerfectDefense = type === "defense" && battle.trophies === 40;

  const isCompromisedDefense = type === "defense" && battle.trophies === 0;

  const isPerfectResult = isPerfectAttack || isPerfectDefense;

  /**
   * ========================================================
   * PONTUAÇÃO
   * ========================================================
   */

  const formattedTrophies = `+${numberFormatter.format(battle.trophies)}`;

  /**
   * ========================================================
   * ESTILO DO CARD
   * ========================================================
   */

  const cardStyle = isPerfectResult
    ? [
        "border-amber-400/70",
        "bg-amber-400/[0.055]",
        "ring-1",
        "ring-inset",
        "ring-amber-300/15",
      ].join(" ")
    : isCompromisedDefense
      ? [
          "border-rose-500/65",
          "bg-rose-500/[0.055]",
          "ring-1",
          "ring-inset",
          "ring-rose-400/10",
        ].join(" ")
      : ["border-emerald-400/30", "bg-emerald-400/[0.018]"].join(" ");

  /**
   * ========================================================
   * ESTILO DOS PONTOS
   * ========================================================
   */

  const trophyStyle = isPerfectResult
    ? "text-amber-300"
    : isCompromisedDefense
      ? "text-rose-300"
      : "text-emerald-300";

  return (
    <div
      title={battle.opponentName ? `vs. ${battle.opponentName}` : undefined}
      className={[
        "flex min-h-[68px] min-w-0 flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition",
        cardStyle,
      ].join(" ")}
    >
      {/**
       * ====================================================
       * PONTOS
       * ====================================================
       */}

      <p
        className={["text-base font-black leading-none", trophyStyle].join(" ")}
      >
        {formattedTrophies}
      </p>

      {/**
       * ====================================================
       * ESTRELAS
       * ====================================================
       */}

      <BattleStars stars={battle.stars} />

      {/**
       * ====================================================
       * DESTRUIÇÃO
       * ====================================================
       */}

      <p className="mt-1 text-[9px] font-bold leading-none text-slate-500">
        {numberFormatter.format(battle.destructionPercentage)}%
      </p>
    </div>
  );
}

/**
 * ==========================================================
 * ESTRELAS
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
