/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/TrophyLeaguePanel.tsx
 *
 * Responsabilidade:
 * Apresentar de forma compacta a situação atual do jogador
 * na Liga de Troféus e integrar o histórico observado da
 * temporada atual.
 *
 * A interface separa:
 *
 * • posição estrutural na liga;
 * • contribuição-base;
 * • peso estimado no Clan Score;
 * • melhor marca histórica;
 * • pontuação atual da temporada;
 * • evolução observada;
 * • movimentos observados entre snapshots.
 *
 * Estratégia visual:
 *
 * Quando existe histórico persistido da temporada, a
 * pontuação atual é apresentada pelo painel de temporada.
 *
 * Isso evita repetir a mesma informação em diferentes áreas
 * do card.
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

import { TrophyLeagueSeasonPanel } from "@/components/player/TrophyLeagueSeasonPanel";

import type { TrophyLeagueSeasonHistory } from "@/services/trophy-league-season-history.service";

/**
 * ==========================================================
 * PROPS
 * ==========================================================
 */

type TrophyLeaguePanelProps = {
  /**
   * Liga atual retornada pela Player API.
   */
  leagueName: string;

  /**
   * Asset oficial da liga.
   */
  leagueIcon?: string;

  /**
   * Peso estrutural da liga.
   */
  baseScore: number;

  /**
   * Pontuação atual retornada pela Player API.
   *
   * Utilizada como fallback quando ainda não existe histórico
   * persistido suficiente para a temporada.
   */
  seasonalScore: number;

  /**
   * Peso estimado do jogador na composição do Clan Score.
   */
  estimatedClanContribution: number;

  /**
   * Melhor marca histórica conhecida.
   */
  bestTrophies?: number;

  /**
   * Identifica o tratamento especial da Legend I.
   */
  isLegendOne: boolean;

  /**
   * Temporada atual já processada pela camada de histórico.
   */
  season?: TrophyLeagueSeasonHistory | null;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * ==========================================================
 * COMPONENTE PRINCIPAL
 * ==========================================================
 */

export function TrophyLeaguePanel({
  leagueName,
  leagueIcon,
  baseScore,
  seasonalScore,
  estimatedClanContribution,
  bestTrophies,
  isLegendOne,
  season = null,
}: TrophyLeaguePanelProps) {
  /**
   * Quando existe histórico persistido, o próprio painel de
   * temporada apresenta a pontuação atual.
   *
   * Sem histórico, mantemos a pontuação retornada diretamente
   * pela Player API no bloco principal.
   */
  const hasSeasonHistory = season !== null;

  return (
    <section className="border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/**
         * ====================================================
         * CABEÇALHO
         * ====================================================
         */}

        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-400">
            Liga de Troféus
          </p>

          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Desempenho ranqueado
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Posição atual, evolução da temporada e impacto do jogador na
            pontuação do clã.
          </p>
        </div>

        {/**
         * ====================================================
         * CARD PRINCIPAL
         * ====================================================
         */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
          {/**
           * ==================================================
           * LIGA ATUAL
           * ==================================================
           */}

          <div className="flex items-center gap-4">
            {leagueIcon ? (
              <img
                src={leagueIcon}
                alt=""
                aria-hidden="true"
                className="h-16 w-16 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-2xl">
                🏆
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Liga atual
              </p>

              <p className="mt-1 text-xl font-black text-white">{leagueName}</p>
            </div>
          </div>

          {/**
           * ==================================================
           * MÉTRICAS ESTRUTURAIS
           * ==================================================
           *
           * Se a temporada já possui histórico, não repetimos
           * a pontuação atual neste bloco.
           */}

          <div
            className={[
              "mt-5 grid gap-3",
              hasSeasonHistory
                ? "grid-cols-2 lg:grid-cols-3"
                : "grid-cols-2 lg:grid-cols-4",
            ].join(" ")}
          >
            {!hasSeasonHistory && (
              <LeagueMetric
                label={isLegendOne ? "Rating atual" : "Temporada atual"}
                value={numberFormatter.format(seasonalScore)}
              />
            )}

            <LeagueMetric
              label="Peso-base"
              value={numberFormatter.format(baseScore)}
            />

            <LeagueMetric
              label="Peso no clã"
              value={numberFormatter.format(estimatedClanContribution)}
              accent
            />

            <LeagueMetric
              label="Melhor marca"
              value={
                typeof bestTrophies === "number"
                  ? numberFormatter.format(bestTrophies)
                  : "—"
              }
            />
          </div>

          {/**
           * ==================================================
           * CONTEXTO DA LIGA
           * ==================================================
           */}

          {isLegendOne ? (
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Na Lenda I, o peso estimado considera o valor-base da liga somado
              ao rating atual da temporada.
            </p>
          ) : seasonalScore === 0 ? (
            <p className="mt-4 text-xs leading-5 text-slate-500">
              O jogador permanece nesta liga mesmo sem pontuação registrada na
              temporada atual.
            </p>
          ) : null}

          {/**
           * ==================================================
           * HISTÓRICO DA TEMPORADA
           * ==================================================
           *
           * O componente abaixo utiliza snapshots persistidos
           * pelo Command Center.
           *
           * Ele apresenta somente movimentações observadas,
           * sem tratá-las como battle log oficial.
           */}

          <TrophyLeagueSeasonPanel season={season} />
        </div>
      </div>
    </section>
  );
}

/**
 * ==========================================================
 * MÉTRICA DE LIGA
 * ==========================================================
 */

/**
 * Card compacto reutilizado para as métricas estruturais da
 * Liga de Troféus.
 */
function LeagueMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-lg font-black",
          accent ? "text-amber-300" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
