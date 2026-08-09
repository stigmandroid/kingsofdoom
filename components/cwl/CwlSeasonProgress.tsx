/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlSeasonProgress.tsx
 *
 * Responsabilidade:
 * Exibir uma visão panorâmica do desempenho dos clãs
 * em cada rodada da temporada atual da CWL.
 *
 * Funcionalidades:
 *
 * - Exibe as estrelas conquistadas em cada rodada;
 * - identifica o limite máximo de estrelas da guerra;
 * - diferencia guerras encerradas, em andamento e
 *   em preparação;
 * - não aplica bônus de vitória da classificação geral;
 * - não acumula pontuação entre as rodadas;
 * - apresenta uma matriz compacta no desktop;
 * - apresenta cards responsivos no mobile;
 * - complementa, sem duplicar, os detalhes existentes
 *   no componente CwlRounds.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Image from "next/image";

import type { CwlRoundWar } from "./CwlRounds";

/**
 * Estado visual de uma rodada para determinado clã.
 */
type CwlSeasonRoundState = "finished" | "inWar" | "preparation";

/**
 * Resultado competitivo da guerra encerrada.
 */
type CwlSeasonMatchResult = "win" | "loss" | "draw" | "pending";

type CwlSeasonRoundResult = {
  roundIndex: number;

  /**
   * Estrelas obtidas exclusivamente nesta rodada.
   */
  stars: number;

  /**
   * Máximo possível de estrelas da guerra.
   */
  maxStars: number;

  /**
   * Destruição obtida nesta rodada.
   */
  destruction: number;

  /**
   * Estado operacional da guerra.
   */
  state: CwlSeasonRoundState;

  /**
   * Resultado competitivo do clã nesta guerra.
   *
   * pending:
   * a guerra ainda não terminou.
   */
  result: CwlSeasonMatchResult;

  opponent: {
    tag: string;
    name: string;
  };
};

/**
 * Visão da temporada de um único clã.
 */
type CwlSeasonClanProgress = {
  tag: string;
  name: string;
  badgeUrl: string;

  /**
   * Resultado independente de cada rodada.
   */
  rounds: CwlSeasonRoundResult[];

  /**
   * Soma das estrelas conquistadas diretamente nas guerras.
   *
   * Este valor NÃO inclui os 10 bônus de vitória da CWL
   * e NÃO representa a classificação oficial.
   *
   * É utilizado somente para organizar visualmente
   * os clãs neste componente.
   */
  battleStars: number;
};

/**
 * Propriedades recebidas pelo componente.
 */
type CwlSeasonProgressProps = {
  /**
   * Todas as guerras já carregadas da temporada.
   */
  wars: CwlRoundWar[];

  /**
   * Quantidade total de rodadas da temporada.
   */
  totalRounds: number;
};

/**
 * Exibe uma visão panorâmica da temporada.
 *
 * Esta seção responde rapidamente:
 *
 * "Quantas estrelas cada clã conquistou em cada rodada?"
 *
 * Os detalhes dos confrontos continuam sendo
 * responsabilidade do CwlRounds.
 */
export function CwlSeasonProgress({
  wars,
  totalRounds,
}: CwlSeasonProgressProps) {
  const progress = calculateSeasonProgress(wars);

  if (progress.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-800 bg-slate-900/20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/*
         * Cabeçalho da seção.
         */}
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Visão geral da temporada
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Desempenho por rodada
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Compare rapidamente quantas estrelas cada clã conquistou em cada
            rodada da CWL.
          </p>
        </div>

        {/*
         * ==========================================================
         * DESKTOP
         * ----------------------------------------------------------
         * Matriz panorâmica.
         *
         * Os clãs aparecem nas linhas e as rodadas nas colunas.
         * ==========================================================
         */}
        <div className="mt-10 hidden overflow-hidden rounded-2xl border border-slate-800 md:block">
          {/*
           * Cabeçalho da matriz.
           */}
          <div
            className="grid bg-slate-900/80 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500"
            style={{
              gridTemplateColumns: `minmax(240px, 1fr) repeat(${totalRounds}, 90px)`,
            }}
          >
            <span>Clã</span>

            {Array.from({ length: totalRounds }, (_, index) => (
              <span
                key={`season-round-header-${index + 1}`}
                className="text-center"
              >
                R{index + 1}
              </span>
            ))}
          </div>

          {/*
           * Linhas dos clãs.
           */}
          <div className="divide-y divide-slate-800">
            {progress.map((clan) => (
              <div
                key={clan.tag}
                className="grid items-center bg-slate-950/70 px-4 py-4"
                style={{
                  gridTemplateColumns: `minmax(240px, 1fr) repeat(${totalRounds}, 90px)`,
                }}
              >
                {/*
                 * Identidade do clã.
                 */}
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={clan.badgeUrl}
                    alt={`Escudo do clã ${clan.name}`}
                    width={48}
                    height={48}
                    className="h-11 w-11 shrink-0 object-contain"
                  />

                  <div className="min-w-0">
                    <p
                      translate="no"
                      className="notranslate truncate font-black text-white"
                    >
                      {clan.name}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      Pontuação por confronto
                    </p>
                  </div>
                </div>

                {/*
                 * Resultado do clã em cada rodada.
                 */}
                {Array.from({ length: totalRounds }, (_, roundIndex) => {
                  const round = clan.rounds.find(
                    (item) => item.roundIndex === roundIndex,
                  );

                  return (
                    <SeasonRoundCell
                      key={`${clan.tag}-round-${roundIndex + 1}`}
                      round={round}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/*
         * ==========================================================
         * MOBILE
         * ----------------------------------------------------------
         * Cada clã recebe um card compacto.
         *
         * As sete rodadas ficam distribuídas em pequenas células,
         * evitando tabela horizontal e scroll lateral.
         * ==========================================================
         */}
        <div className="mt-8 space-y-4 md:hidden">
          {progress.map((clan) => (
            <article
              key={clan.tag}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
            >
              {/*
               * Identidade do clã.
               */}
              <div className="flex items-center gap-3">
                <Image
                  src={clan.badgeUrl}
                  alt={`Escudo do clã ${clan.name}`}
                  width={48}
                  height={48}
                  className="h-11 w-11 shrink-0 object-contain"
                />

                <div className="min-w-0">
                  <p
                    translate="no"
                    className="notranslate truncate font-black text-white"
                  >
                    {clan.name}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Desempenho por rodada
                  </p>
                </div>
              </div>

              {/*
               * Grade das rodadas.
               *
               * 4 colunas permitem exibir R1-R4 na primeira linha
               * e R5-R7 na segunda sem scroll horizontal.
               */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {Array.from({ length: totalRounds }, (_, roundIndex) => {
                  const round = clan.rounds.find(
                    (item) => item.roundIndex === roundIndex,
                  );

                  return (
                    <MobileSeasonRoundCell
                      key={`${clan.tag}-mobile-round-${roundIndex + 1}`}
                      roundIndex={roundIndex}
                      round={round}
                    />
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        {/*
         * Legenda visual da temporada.
         *
         * Mobile:
         * itens compactos, centralizados e com quebra natural.
         *
         * Desktop:
         * mantém uma leitura horizontal discreta.
         */}
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] font-semibold sm:justify-start sm:gap-x-4 sm:gap-y-2 sm:text-xs">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-emerald-400">
            Vitória
          </span>

          <span className="rounded-full border border-red-400/20 bg-red-400/5 px-2.5 py-1 text-red-400">
            Derrota
          </span>

          <span className="rounded-full border border-slate-500/20 bg-slate-500/5 px-2.5 py-1 text-slate-200">
            Empate
          </span>

          <span className="rounded-full border border-sky-400/20 bg-sky-400/5 px-2.5 py-1 text-sky-300">
            Parcial
          </span>

          <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2.5 py-1 text-amber-400">
            Preparação
          </span>

          <span className="rounded-full border border-slate-700 bg-slate-900/50 px-2.5 py-1 text-slate-500">
            — Ainda não disponível
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * Propriedades de uma célula desktop.
 */
type SeasonRoundCellProps = {
  round?: CwlSeasonRoundResult;
};

/**
 * Exibe uma rodada na matriz desktop.
 *
 * Cores:
 *
 * - verde: vitória;
 * - vermelho: derrota;
 * - branco: empate;
 * - azul: guerra em andamento;
 * - amarelo: preparação;
 * - cinza: rodada ainda indisponível.
 */
function SeasonRoundCell({ round }: SeasonRoundCellProps) {
  /**
   * Guerra ainda não criada pela Clash API.
   */
  if (!round) {
    return (
      <div className="text-center">
        <span className="font-black text-slate-700">—</span>
      </div>
    );
  }

  /**
   * Guerra ainda em preparação.
   */
  if (round.state === "preparation") {
    return (
      <div className="text-center" title={`vs ${round.opponent.name}`}>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
          Prep
        </span>
      </div>
    );
  }

  /**
   * Define a cor da pontuação.
   *
   * Enquanto a guerra estiver acontecendo, usamos azul
   * porque ainda não existe resultado oficial.
   */
  const scoreColor =
    round.state === "inWar"
      ? "text-sky-300"
      : round.result === "win"
        ? "text-emerald-400"
        : round.result === "loss"
          ? "text-red-400"
          : round.result === "draw"
            ? "text-slate-200"
            : "text-amber-300";

  return (
    <div className="text-center" title={`vs ${round.opponent.name}`}>
      {/*
       * Pontuação obtida naquela rodada.
       *
       * Exemplo:
       * 43/45
       */}
      <div className="whitespace-nowrap">
        <span className={`text-base font-black ${scoreColor}`}>
          {round.stars}
        </span>

        {round.maxStars > 0 && (
          <span className="ml-0.5 text-[10px] font-bold text-slate-600">
            /{round.maxStars}
          </span>
        )}
      </div>

      {/*
       * Identifica guerras ainda em andamento.
       */}
      {round.state === "inWar" && (
        <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-sky-500">
          Parcial
        </p>
      )}
    </div>
  );
}

/**
 * Propriedades da célula mobile.
 */
type MobileSeasonRoundCellProps = {
  roundIndex: number;
  round?: CwlSeasonRoundResult;
};

/**
 * Exibe uma rodada dentro do card mobile.
 */
function MobileSeasonRoundCell({
  roundIndex,
  round,
}: MobileSeasonRoundCellProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-1 py-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        R{roundIndex + 1}
      </p>

      {!round ? (
        <p className="mt-1 font-black text-slate-700">—</p>
      ) : round.state === "preparation" ? (
        <p className="mt-1 text-[10px] font-black uppercase text-amber-400">
          Prep
        </p>
      ) : (
        <>
          <p
            className={`mt-1 font-black ${
              round.state === "inWar"
                ? "text-sky-300"
                : round.result === "win"
                  ? "text-emerald-400"
                  : round.result === "loss"
                    ? "text-red-400"
                    : round.result === "draw"
                      ? "text-slate-300"
                      : "text-amber-300"
            }`}
          >
            {round.stars}
          </p>

          {round.maxStars > 0 && (
            <p className="text-[9px] font-bold text-slate-600">
              /{round.maxStars}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Calcula o desempenho individual dos clãs em cada
 * rodada já criada da temporada.
 *
 * Diferentemente da classificação geral:
 *
 * - não acumula resultados anteriores;
 * - não adiciona 10 estrelas pela vitória;
 * - cada rodada representa exclusivamente sua guerra.
 */
function calculateSeasonProgress(wars: CwlRoundWar[]): CwlSeasonClanProgress[] {
  const progress = new Map<string, CwlSeasonClanProgress>();

  /**
   * Garante a existência de um clã no acumulador.
   */
  function getOrCreateClan(clan: {
    tag: string;
    name: string;
    badgeUrls: {
      medium: string;
    };
  }): CwlSeasonClanProgress {
    const existing = progress.get(clan.tag);

    if (existing) {
      return existing;
    }

    const created: CwlSeasonClanProgress = {
      tag: clan.tag,
      name: clan.name,
      badgeUrl: clan.badgeUrls.medium,

      rounds: [],

      battleStars: 0,
    };

    progress.set(clan.tag, created);

    return created;
  }

  /**
   * Cada guerra da CWL contém exatamente dois clãs.
   *
   * Como CwlRoundWar já preserva roundIndex,
   * conseguimos registrar diretamente o resultado
   * pertencente à rodada correta.
   */
  wars.forEach(({ roundIndex, war }) => {
    const clan = war.clan;
    const opponent = war.opponent;

    /**
     * Evita processar respostas incompletas.
     */
    if (!clan || !opponent) {
      return;
    }

    const clanProgress = getOrCreateClan(clan);
    const opponentProgress = getOrCreateClan(opponent);

    /**
     * Máximo possível de estrelas no confronto.
     *
     * 15 jogadores × 3 = 45.
     * 30 jogadores × 3 = 90.
     */
    const maxStars = (war.teamSize ?? 0) * 3;

    /**
     * Determina o resultado final considerando os mesmos
     * critérios utilizados pelo Clash of Clans:
     *
     * 1. maior quantidade de estrelas;
     * 2. maior destruição em caso de empate nas estrelas.
     *
     * O resultado somente é oficial quando a guerra termina.
     */
    let clanResult: CwlSeasonMatchResult = "pending";
    let opponentResult: CwlSeasonMatchResult = "pending";

    if (war.state === "warEnded") {
      const bothReachedMaximum =
        clan.stars === maxStars && opponent.stars === maxStars;

      if (bothReachedMaximum) {
        /**
         * Se os dois clãs atingiram a pontuação máxima,
         * ambos obrigatoriamente chegaram a 100% de destruição.
         *
         * Resultado: empate.
         */
        clanResult = "draw";
        opponentResult = "draw";
      } else if (clan.stars > opponent.stars) {
        clanResult = "win";
        opponentResult = "loss";
      } else if (opponent.stars > clan.stars) {
        clanResult = "loss";
        opponentResult = "win";
      } else {
        /**
         * Mesma quantidade de estrelas,
         * mas sem pontuação máxima.
         *
         * Utilizamos a destruição como critério de desempate.
         */
        if (clan.destructionPercentage > opponent.destructionPercentage) {
          clanResult = "win";
          opponentResult = "loss";
        } else if (
          opponent.destructionPercentage > clan.destructionPercentage
        ) {
          clanResult = "loss";
          opponentResult = "win";
        } else {
          /**
           * Mesmo número de estrelas
           * e exatamente a mesma destruição.
           */
          clanResult = "draw";
          opponentResult = "draw";
        }
      }
    }

    /**
     * Converte o estado retornado pela guerra para
     * o estado utilizado pelo componente.
     */
    const state: CwlSeasonRoundState =
      war.state === "warEnded"
        ? "finished"
        : war.state === "inWar"
          ? "inWar"
          : "preparation";

    /**
     * Resultado do primeiro clã.
     */
    clanProgress.rounds.push({
      roundIndex,
      stars: clan.stars,
      maxStars,
      destruction: clan.destructionPercentage,
      state,
      result: clanResult,

      opponent: {
        tag: opponent.tag,
        name: opponent.name,
      },
    });

    /**
     * Resultado do adversário.
     */
    opponentProgress.rounds.push({
      roundIndex,
      stars: opponent.stars,
      maxStars,
      destruction: opponent.destructionPercentage,
      state,
      result: opponentResult,

      opponent: {
        tag: clan.tag,
        name: clan.name,
      },
    });

    /**
     * Soma somente estrelas obtidas diretamente
     * nos ataques.
     *
     * Não adicionamos bônus de vitória.
     */
    if (war.state !== "preparation") {
      clanProgress.battleStars += clan.stars;
      opponentProgress.battleStars += opponent.stars;
    }
  });

  /**
   * Mantém as rodadas internamente ordenadas.
   */
  progress.forEach((clan) => {
    clan.rounds.sort((a, b) => a.roundIndex - b.roundIndex);
  });

  /**
   * Ordem visual.
   *
   * O componente não tenta substituir a classificação
   * oficial exibida em CwlStandings.
   *
   * Utilizamos somente as estrelas conquistadas diretamente
   * nas guerras para manter os clãs mais competitivos no topo.
   */
  return [...progress.values()].sort((a, b) => {
    if (b.battleStars !== a.battleStars) {
      return b.battleStars - a.battleStars;
    }

    return a.name.localeCompare(b.name);
  });
}
