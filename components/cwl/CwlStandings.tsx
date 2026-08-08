/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlStandings.tsx
 *
 * Responsabilidade:
 * Calcular e exibir a classificação geral dos clãs
 * participantes da temporada atual da CWL.
 *
 * Funcionalidades:
 *
 * - Consolida os resultados de todas as guerras carregadas;
 * - soma estrelas e destruição acumulada;
 * - calcula vitórias, derrotas e empates;
 * - ordena os clãs pelo desempenho geral;
 * - destaca visualmente o clã selecionado.
 *
 * Autor:
 * stigmandroid
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CwlRoundWar } from "./CwlRounds";
import Image from "next/image";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlStandingsProps = {
  wars: CwlRoundWar[];

  /**
   * Liga atual do clã selecionado.
   *
   * Utilizada para determinar as posições que
   * promovem ou rebaixam ao final da temporada.
   */
  leagueName?: string;
};

/**
 * Resultado consolidado de um clã dentro da temporada.
 */
type CwlStanding = {
  tag: string;
  name: string;
  badgeUrl: string;

  stars: number;
  destruction: number;

  wins: number;
  losses: number;
  draws: number;

  warsPlayed: number;
};

/**
 * Possíveis movimentos de um clã ao final da CWL.
 */
type CwlStandingMovement = "promotion" | "neutral" | "relegation";

/**
 * Quantidade de posições que promovem ou rebaixam
 * em determinada liga.
 */
type CwlLeagueMovementRule = {
  promotionSlots: number;
  relegationSlots: number;
};

/**
 * Exibe a classificação geral da CWL.
 */
export function CwlStandings({ wars, leagueName }: CwlStandingsProps) {
  const standings = calculateStandings(wars);
  const movementRule = getLeagueMovementRule(leagueName);

  if (standings.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Classificação da temporada
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Ranking geral dos clãs
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Acompanhe o desempenho acumulado de todos os clãs ao longo das
            rodadas disponíveis da CWL.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800">
          <div className="grid grid-cols-[72px_minmax(0,1fr)_100px_120px_110px] bg-slate-900/80 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <span>Pos.</span>
            <span>Clã</span>
            <span className="text-center">V-D-E</span>
            <span className="text-center">Estrelas</span>
            <span className="text-right">Destruição</span>
          </div>

          <div className="divide-y divide-slate-800">
            {standings.map((standing, index) => {
              const movement = getStandingMovement({
                index,
                totalClans: standings.length,
                rule: movementRule,
              });

              return (
                <div
                  key={standing.tag}
                  className="grid grid-cols-[72px_minmax(0,1fr)_100px_120px_110px] items-center bg-slate-950/70 px-4 py-4"
                >
                  <div className="grid grid-cols-[20px_40px] items-center gap-2">
                    {/*
                     * Reserva sempre o mesmo espaço para o indicador
                     * de promoção ou rebaixamento.
                     *
                     * Isso mantém todas as posições perfeitamente
                     * alinhadas, inclusive as zonas neutras.
                     */}
                    <span className="flex w-5 items-center justify-center">
                      {movement === "promotion" ? (
                        <span
                          aria-label="Zona de promoção"
                          title="Zona de promoção"
                          className="text-lg font-black text-emerald-400"
                        >
                          ▲
                        </span>
                      ) : movement === "relegation" ? (
                        <span
                          aria-label="Zona de rebaixamento"
                          title="Zona de rebaixamento"
                          className="text-lg font-black text-red-400"
                        >
                          ▼
                        </span>
                      ) : (
                        /**
                         * Elemento invisível que preserva a largura
                         * da coluna nas posições neutras.
                         */
                        <span aria-hidden="true" className="invisible">
                          ▲
                        </span>
                      )}
                    </span>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black ${
                        movement === "promotion"
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : movement === "relegation"
                            ? "border-red-400/30 bg-red-400/10 text-red-300"
                            : "border-slate-700 bg-slate-900 text-white"
                      }`}
                    >
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <Image
                      src={standing.badgeUrl}
                      alt={`Escudo do clã ${standing.name}`}
                      width={48}
                      height={48}
                      className="h-11 w-11 shrink-0 object-contain"
                    />

                    <div className="min-w-0">
                      <p
                        translate="no"
                        className="notranslate truncate font-black text-white"
                      >
                        {standing.name}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {standing.warsPlayed} guerra
                        {standing.warsPlayed === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <span className="text-center font-black text-slate-300">
                    {standing.wins}-{standing.losses}-{standing.draws}
                  </span>

                  <span className="text-center text-lg font-black text-amber-300">
                    {standing.stars}
                  </span>

                  <span className="text-right font-black text-slate-300">
                    {formatPercentage(standing.destruction)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Calcula a classificação geral com base nas guerras
 * já disponíveis no grupo atual.
 */
function calculateStandings(wars: CwlRoundWar[]): CwlStanding[] {
  const standings = new Map<string, CwlStanding>();

  /**
   * Garante que um clã exista dentro do mapa acumulador.
   */
  function getOrCreateStanding(clan: {
    tag: string;
    name: string;
    badgeUrls: {
      medium: string;
    };
  }): CwlStanding {
    const existing = standings.get(clan.tag);

    if (existing) {
      return existing;
    }

    const created: CwlStanding = {
      tag: clan.tag,
      name: clan.name,
      badgeUrl: clan.badgeUrls.medium,

      stars: 0,
      destruction: 0,

      wins: 0,
      losses: 0,
      draws: 0,

      warsPlayed: 0,
    };

    standings.set(clan.tag, created);

    return created;
  }

  wars.forEach(({ war }) => {
    const clan = war.clan;
    const opponent = war.opponent;

    /**
     * Ignora guerras incompletas.
     */
    if (!clan || !opponent) {
      return;
    }

    /**
     * Para o ranking geral, consideramos apenas guerras
     * que já começaram.
     */
    if (war.state === "preparation") {
      return;
    }

    const clanStanding = getOrCreateStanding(clan);
    const opponentStanding = getOrCreateStanding(opponent);

    /**
     * Soma as estrelas obtidas diretamente nos ataques.
     */
    clanStanding.stars += clan.stars;
    clanStanding.destruction += clan.destructionPercentage;
    clanStanding.warsPlayed += 1;

    opponentStanding.stars += opponent.stars;
    opponentStanding.destruction += opponent.destructionPercentage;
    opponentStanding.warsPlayed += 1;

    /**
     * Determina quem está à frente considerando:
     *
     * 1. maior número de estrelas;
     * 2. maior destruição em caso de empate nas estrelas.
     */
    const clanIsAhead =
      clan.stars > opponent.stars ||
      (clan.stars === opponent.stars &&
        clan.destructionPercentage > opponent.destructionPercentage);

    const opponentIsAhead =
      opponent.stars > clan.stars ||
      (opponent.stars === clan.stars &&
        opponent.destructionPercentage > clan.destructionPercentage);

    /**
     * Resultado oficial somente após o encerramento da guerra.
     *
     * Na CWL, o vencedor recebe 10 estrelas adicionais
     * na classificação geral da temporada.
     */
    if (war.state === "warEnded") {
      if (clanIsAhead) {
        clanStanding.wins += 1;
        opponentStanding.losses += 1;

        /**
         * Bônus oficial da CWL pela vitória.
         */
        clanStanding.stars += 10;
      } else if (opponentIsAhead) {
        opponentStanding.wins += 1;
        clanStanding.losses += 1;

        /**
         * Bônus oficial da CWL pela vitória.
         */
        opponentStanding.stars += 10;
      } else {
        /**
         * Empates não recebem o bônus de vitória.
         */
        clanStanding.draws += 1;
        opponentStanding.draws += 1;
      }
    }
  });

  return [...standings.values()].sort((a, b) => {
    /**
     * Critério principal da classificação da CWL:
     * maior número total de estrelas.
     *
     * O total já inclui os bônus de 10 estrelas
     * conquistados pelas vitórias.
     */
    if (b.stars !== a.stars) {
      return b.stars - a.stars;
    }

    /**
     * Primeiro critério de desempate:
     * maior destruição acumulada.
     */
    if (b.destruction !== a.destruction) {
      return b.destruction - a.destruction;
    }

    /**
     * Fallback determinístico apenas para manter
     * estabilidade visual caso os valores sejam idênticos.
     */
    return a.name.localeCompare(b.name);
  });
}

/**
 * Retorna a regra de promoção e rebaixamento
 * correspondente à liga atual.
 *
 * Importante:
 * somente incluímos aqui regras que tenham sido
 * confirmadas para a estrutura atual da CWL.
 */
function getLeagueMovementRule(
  leagueName?: string,
): CwlLeagueMovementRule | null {
  if (!leagueName) {
    return null;
  }

  const normalizedLeagueName = leagueName.trim().toLowerCase();

  /**
   * Champion League II:
   *
   * - posições 1 e 2 promovem;
   * - posições 7 e 8 rebaixam.
   */
  if (
    normalizedLeagueName === "champion league ii" ||
    normalizedLeagueName === "champion ii"
  ) {
    return {
      promotionSlots: 2,
      relegationSlots: 2,
    };
  }

  /**
   * Para ligas cuja regra ainda não foi validada,
   * não exibimos indicação para evitar informação incorreta.
   */
  return null;
}

/**
 * Identifica se determinada posição pertence à zona
 * de promoção, permanência ou rebaixamento.
 */
function getStandingMovement({
  index,
  totalClans,
  rule,
}: {
  index: number;
  totalClans: number;
  rule: CwlLeagueMovementRule | null;
}): CwlStandingMovement {
  if (!rule) {
    return "neutral";
  }

  if (index < rule.promotionSlots) {
    return "promotion";
  }

  if (index >= totalClans - rule.relegationSlots) {
    return "relegation";
  }

  return "neutral";
}

/**
 * Formata a destruição acumulada.
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2).replace(".", ",")}%`;
}
