"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlSeasonPassEvent.tsx
 *
 * Responsabilidade:
 * Exibir o evento automático do Passe de Temporada
 * da CWL.
 *
 * Estados suportados:
 *
 * - tracking:
 *   acompanha os jogadores elegíveis durante a CWL;
 *
 * - scheduled:
 *   exibe a contagem regressiva até o sorteio;
 *
 * - revealing:
 *   executa a experiência visual da revelação;
 *
 * - revealed:
 *   apresenta o vencedor oficial persistido.
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

import { useEffect, useMemo, useState } from "react";

/**
 * Jogador elegível retornado pela API.
 */
type SeasonPassEligiblePlayer = {
  tag: string;
  name: string;

  warsPlayed: number;

  attacksUsed: number;
  attacksAvailable: number;

  stars: number;
  destruction: number;
};

/**
 * Estados públicos do evento.
 */
type SeasonPassEventStatus =
  | "tracking"
  | "scheduled"
  | "revealing"
  | "revealed";

/**
 * Estado do evento retornado pela rota interna.
 */
type SeasonPassEventState = {
  season: string;
  clanTag: string;

  status: SeasonPassEventStatus;

  eligiblePlayers: SeasonPassEligiblePlayer[];

  scheduledAt?: string;
  revealAt?: string;

  winner?: {
    tag: string;
    name: string;
  };
};

/**
 * Resposta da API.
 */
type SeasonPassApiResponse =
  | {
      available: true;
      event: SeasonPassEventState;
    }
  | {
      available: false;
      reason?: string;
    };

/**
 * Propriedades recebidas pelo componente.
 */
type CwlSeasonPassEventProps = {
  /**
   * Slug utilizado pela rota da API.
   *
   * Exemplos:
   * kod
   * kod-rec
   */
  clanSlug: string;
};

/**
 * Representa o tempo restante da contagem regressiva.
 */
type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * Intervalo de atualização da API durante o evento.
 *
 * O polling mantém múltiplos navegadores sincronizados
 * com o estado persistido no servidor.
 */
const API_REFRESH_INTERVAL_MS = 5_000;

/**
 * Exibe o evento do Passe de Temporada.
 */
export function CwlSeasonPassEvent({ clanSlug }: CwlSeasonPassEventProps) {
  const [event, setEvent] = useState<SeasonPassEventState | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * Consulta o estado público do evento.
   */
  async function loadEvent(): Promise<void> {
    try {
      const response = await fetch(
        `/api/season-pass?clan=${encodeURIComponent(clanSlug)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Falha ao consultar Passe de Temporada. HTTP ${response.status}`,
        );
      }

      const data = (await response.json()) as SeasonPassApiResponse;

      if (!data.available) {
        setEvent(null);
        setError(
          data.reason ?? "O evento do Passe de Temporada não está disponível.",
        );

        return;
      }

      setEvent(data.event);
      setError(null);
    } catch (requestError) {
      console.error(
        "[Kings of Doom] Erro ao carregar evento do Passe:",
        requestError,
      );

      setError("Não foi possível atualizar o evento do Passe de Temporada.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Carrega o evento inicialmente.
   */
  useEffect(() => {
    void loadEvent();
  }, [clanSlug]);

  /**
   * Enquanto a página estiver aberta, consulta
   * periodicamente o servidor.
   *
   * Isso permite acompanhar:
   *
   * scheduled -> revealing -> revealed
   *
   * sem exigir atualização manual.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadEvent();
    }, API_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [clanSlug]);

  /**
   * Estado inicial de carregamento.
   */
  if (loading) {
    return (
      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="font-black text-white">
              Carregando evento do Passe de Temporada...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Estado de indisponibilidade/erro.
   */
  if (!event) {
    return (
      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
            <p className="font-black text-white">
              Passe de Temporada indisponível
            </p>

            {error && (
              <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Passe de Temporada
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Sorteio da CWL
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Jogadores com desempenho perfeito durante a Liga de Guerras
            participam automaticamente do sorteio do Passe de Temporada.
          </p>
        </div>

        <div className="mt-10">
          {event.status === "tracking" && (
            <TrackingState players={event.eligiblePlayers} />
          )}

          {event.status === "scheduled" && <ScheduledState event={event} />}

          {event.status === "revealing" && <RevealingState event={event} />}

          {event.status === "revealed" && <RevealedState event={event} />}
        </div>
      </div>
    </section>
  );
}

/**
 * ==========================================================
 * TRACKING
 * ==========================================================
 */

/**
 * Exibe os jogadores que permanecem elegíveis
 * durante a temporada ainda ativa.
 */
function TrackingState({ players }: { players: SeasonPassEligiblePlayer[] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            Elegibilidade em andamento
          </p>

          <h3 className="mt-2 text-2xl font-black text-white">
            {players.length} jogador
            {players.length === 1 ? "" : "es"} elegível
            {players.length === 1 ? "" : "is"} até o momento
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            A lista ainda pode mudar até o encerramento oficial da CWL.
          </p>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            Sorteio
          </p>

          <p className="mt-1 font-black text-white">
            12:00 do dia seguinte ao fim da CWL
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-600">
            Horário de Brasília
          </p>
        </div>
      </div>

      {players.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <EligiblePlayerCard key={player.tag} player={player} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
          <p className="font-black text-white">
            Nenhum jogador elegível até o momento
          </p>

          <p className="mt-3 text-sm text-slate-500">
            A lista será atualizada conforme as guerras forem encerradas.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================================
 * SCHEDULED
 * ==========================================================
 */

/**
 * Exibe a contagem regressiva para o evento oficial.
 */
function ScheduledState({ event }: { event: SeasonPassEventState }) {
  const countdown = useCountdown(event.scheduledAt);

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-400/10 to-slate-950">
      <div className="px-5 py-10 text-center sm:px-8 sm:py-14">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
          Evento agendado
        </p>

        <h3 className="mt-4 text-3xl font-black text-white sm:text-5xl">
          O Passe será sorteado em
        </h3>

        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-2 sm:gap-4">
          <CountdownMetric label="Dias" value={countdown.days} />

          <CountdownMetric label="Horas" value={countdown.hours} />

          <CountdownMetric label="Min" value={countdown.minutes} />

          <CountdownMetric label="Seg" value={countdown.seconds} />
        </div>

        {event.scheduledAt && (
          <p className="mt-8 text-sm font-semibold text-slate-500">
            {formatBrasiliaDate(event.scheduledAt)}
          </p>
        )}

        <p className="mt-2 text-xs font-black uppercase tracking-wider text-slate-600">
          Horário de Brasília
        </p>

        <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-sm font-black text-white">
            {event.eligiblePlayers.length} participantes confirmados
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            A lista foi congelada após o encerramento da CWL e não sofrerá novas
            alterações.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * REVEALING
 * ==========================================================
 */

/**
 * Executa a experiência visual durante a janela
 * entre o sorteio do servidor e a revelação pública.
 */
function RevealingState({ event }: { event: SeasonPassEventState }) {
  const players = event.eligiblePlayers;

  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Faz os nomes alternarem rapidamente durante
   * a janela de revelação.
   *
   * Essa animação NÃO escolhe o vencedor.
   * Ela é exclusivamente visual.
   */
  useEffect(() => {
    if (players.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % players.length);
    }, 120);

    return () => {
      window.clearInterval(interval);
    };
  }, [players.length]);

  const currentPlayer = players[activeIndex];

  return (
    <div className="overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-b from-sky-400/10 via-slate-950 to-slate-950">
      <div className="px-5 py-14 text-center sm:px-8 sm:py-20">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/30 bg-amber-400/10 text-4xl shadow-[0_0_45px_rgba(251,191,36,0.12)]">
          🏆
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-sky-300">
          Sorteio em andamento
        </p>

        <h3 className="mt-4 text-3xl font-black text-white sm:text-5xl">
          Quem levará o Passe?
        </h3>

        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-slate-700 bg-slate-900/70 px-6 py-8 shadow-2xl">
          <p
            translate="no"
            className="notranslate truncate text-2xl font-black text-white sm:text-4xl"
          >
            {currentPlayer?.name ?? "Preparando sorteio..."}
          </p>
        </div>

        <p className="mt-8 text-sm font-semibold text-slate-500">
          O resultado oficial será revelado em instantes.
        </p>
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * REVEALED
 * ==========================================================
 */

/**
 * Exibe permanentemente o vencedor oficial.
 */
function RevealedState({ event }: { event: SeasonPassEventState }) {
  const winner = event.winner;

  if (!winner) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <p className="font-black text-white">Resultado sendo confirmado</p>
      </div>
    );
  }

  const player = event.eligiblePlayers.find(
    (candidate) => candidate.tag === winner.tag,
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/15 via-slate-950 to-slate-950">
      <div className="px-5 py-12 text-center sm:px-8 sm:py-16">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-amber-400/40 bg-amber-400/10 text-5xl shadow-[0_0_60px_rgba(251,191,36,0.16)]">
          🏆
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-amber-400">
          Vencedor do Passe de Temporada
        </p>

        <h3
          translate="no"
          className="notranslate mt-4 break-words text-4xl font-black text-white sm:text-6xl"
        >
          {winner.name}
        </h3>

        {player && (
          <>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {player.tag}
            </p>

            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <WinnerMetric label="Guerras" value={player.warsPlayed} />

              <WinnerMetric
                label="Ataques"
                value={`${player.attacksUsed}/${player.attacksAvailable}`}
              />

              <WinnerMetric label="Estrelas" value={player.stars} />

              <WinnerMetric
                label="Destruição"
                value={`${player.destruction}%`}
              />
            </div>
          </>
        )}

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            100% de aproveitamento
          </p>
        </div>

        {event.scheduledAt && (
          <p className="mt-8 text-xs font-semibold text-slate-600">
            Sorteio realizado em {formatBrasiliaDate(event.scheduledAt)}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * COMPONENTES AUXILIARES
 * ==========================================================
 */

/**
 * Card de jogador elegível.
 */
function EligiblePlayerCard({ player }: { player: SeasonPassEligiblePlayer }) {
  return (
    <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
      <p translate="no" className="notranslate truncate font-black text-white">
        {player.name}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-600">{player.tag}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <PlayerMetric label="Guerras" value={player.warsPlayed} />

        <PlayerMetric
          label="Ataques"
          value={`${player.attacksUsed}/${player.attacksAvailable}`}
        />

        <PlayerMetric label="Estrelas" value={player.stars} />

        <PlayerMetric label="Destruição" value={`${player.destruction}%`} />
      </div>

      <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
          Elegível
        </p>
      </div>
    </article>
  );
}

/**
 * Métrica de jogador.
 */
function PlayerMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

/**
 * Métrica da contagem regressiva.
 */
function CountdownMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-2 py-4 sm:px-4 sm:py-6">
      <p className="text-2xl font-black tabular-nums text-white sm:text-4xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-600 sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

/**
 * Métrica do vencedor.
 */
function WinnerMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-4">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

/**
 * ==========================================================
 * CONTAGEM REGRESSIVA
 * ==========================================================
 */

/**
 * Calcula continuamente o tempo restante até
 * determinado horário.
 */
function useCountdown(targetDate?: string): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return useMemo(() => {
    if (!targetDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const target = new Date(targetDate).getTime();

    const difference = Math.max(target - now, 0);

    const totalSeconds = Math.floor(difference / 1_000);

    const days = Math.floor(totalSeconds / 86_400);

    const hours = Math.floor((totalSeconds % 86_400) / 3_600);

    const minutes = Math.floor((totalSeconds % 3_600) / 60);

    const seconds = totalSeconds % 60;

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }, [now, targetDate]);
}

/**
 * Formata uma data ISO utilizando oficialmente
 * o fuso de Brasília.
 */
function formatBrasiliaDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",

    day: "2-digit",
    month: "2-digit",
    year: "numeric",

    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
