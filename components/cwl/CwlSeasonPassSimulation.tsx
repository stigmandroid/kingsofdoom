"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlSeasonPassSimulation.tsx
 *
 * Responsabilidade:
 * Simular localmente a experiência cinematográfica
 * do sorteio do Passe de Temporada.
 *
 * Sequência:
 *
 * 1. contagem regressiva;
 * 2. alternância dos participantes;
 * 3. desaceleração progressiva;
 * 4. trava suave do vencedor;
 * 5. surgimento do Passe;
 * 6. descida do Passe até o vencedor;
 * 7. impacto dourado;
 * 8. partículas;
 * 9. transformação contínua para o resultado final;
 * 10. permanência da composição final na tela.
 *
 * Importante:
 *
 * - somente desenvolvimento;
 * - não altera SQLite;
 * - não altera evento oficial;
 * - não chama endpoint de sorteio;
 * - não persiste vencedor;
 * - o vencedor da simulação existe apenas em memória.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 11/08/2026
 *
 * Versão:
 * 0.8.5
 *
 * Status:
 * 🚧 Ajuste responsivo final antes da integração real
 * ==========================================================
 */

import Image from "next/image";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Jogador participante da simulação.
 */
type SimulationPlayer = {
  tag: string;
  name: string;

  warsPlayed: number;

  attacksUsed: number;
  attacksAvailable: number;

  stars: number;
  destruction: number;
};

/**
 * Estados principais.
 *
 * A cerimônia e o resultado final acontecem
 * dentro do mesmo estado visual.
 */
type SimulationState = "idle" | "countdown" | "ceremony";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlSeasonPassSimulationProps = {
  players: SimulationPlayer[];
};

/**
 * Asset do Passe.
 */
const SEASON_PASS_IMAGE = "/images/season-pass.png";

/**
 * ==========================================================
 * TIMELINE
 * ==========================================================
 */

/**
 * Tempo da contagem inicial.
 */
const COUNTDOWN_STEP_MS = 700;

/**
 * Trava definitiva do vencedor.
 */
const LOCK_AT_MS = 3_650;

/**
 * Início da entrada do Passe.
 */
const PASS_START_MS = 3_950;

/**
 * Momento do impacto.
 */
const IMPACT_AT_MS = 5_250;

/**
 * Fim principal do impacto.
 */
const IMPACT_END_MS = 6_050;

/**
 * Início da transformação para o estado final.
 */
const FINAL_TRANSITION_START_MS = 6_250;

/**
 * Texto final começa a aparecer.
 */
const FINAL_TITLE_AT_MS = 6_650;

/**
 * Tag começa a aparecer.
 */
const FINAL_TAG_AT_MS = 6_950;

/**
 * Métricas entram uma por uma.
 */
const FINAL_METRIC_1_AT_MS = 7_250;
const FINAL_METRIC_2_AT_MS = 7_500;
const FINAL_METRIC_3_AT_MS = 7_750;
const FINAL_METRIC_4_AT_MS = 8_000;

/**
 * Composição final estabilizada.
 */
const FINAL_SETTLED_AT_MS = 8_350;

/**
 * Partículas do impacto.
 */
const CELEBRATION_PARTICLES = [
  { x: -170, y: -90, delay: 0, size: 7 },
  { x: -145, y: -15, delay: 80, size: 5 },
  { x: -125, y: 75, delay: 130, size: 8 },
  { x: -70, y: -130, delay: 60, size: 6 },
  { x: -20, y: -155, delay: 180, size: 5 },
  { x: 45, y: -145, delay: 30, size: 8 },
  { x: 105, y: -110, delay: 120, size: 6 },
  { x: 160, y: -45, delay: 50, size: 7 },
  { x: 175, y: 35, delay: 160, size: 5 },
  { x: 135, y: 100, delay: 90, size: 8 },
  { x: 75, y: 140, delay: 200, size: 6 },
  { x: 10, y: 160, delay: 100, size: 5 },
  { x: -65, y: 145, delay: 40, size: 7 },
  { x: -135, y: 105, delay: 140, size: 6 },
];

/**
 * Simulador exclusivo de desenvolvimento.
 */
export function CwlSeasonPassSimulation({
  players,
}: CwlSeasonPassSimulationProps) {
  const [simulationState, setSimulationState] =
    useState<SimulationState>("idle");

  const [countdown, setCountdown] = useState(3);

  const [activeIndex, setActiveIndex] = useState(0);

  const [winner, setWinner] = useState<SimulationPlayer | null>(null);

  const [ceremonyElapsed, setCeremonyElapsed] = useState(0);

  const winnerIndexRef = useRef<number | null>(null);

  /**
   * Impede que o mesmo vencedor seja gravado no estado
   * repetidamente em todos os frames após o momento de lock.
   */
  const winnerLockedRef = useRef(false);

  const animationFrameRef = useRef<number | null>(null);

  const ceremonyStartRef = useRef<number | null>(null);

  const currentNameIndexRef = useRef(0);

  const nextNameSwitchAtRef = useRef(0);

  const timersRef = useRef<number[]>([]);

  /**
   * Limpa timers.
   */
  function clearTimers(): void {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timersRef.current = [];
  }

  /**
   * Interrompe requestAnimationFrame.
   */
  function stopAnimationFrame(): void {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = null;
    }

    ceremonyStartRef.current = null;
  }

  /**
   * Limpeza ao desmontar.
   */
  useEffect(() => {
    return () => {
      clearTimers();
      stopAnimationFrame();
    };
  }, []);

  /**
   * Reinicia tudo.
   */
  function resetSimulation(): void {
    clearTimers();
    stopAnimationFrame();

    winnerIndexRef.current = null;
    winnerLockedRef.current = false;
    currentNameIndexRef.current = 0;
    nextNameSwitchAtRef.current = 0;

    setSimulationState("idle");
    setCountdown(3);
    setActiveIndex(0);
    setWinner(null);
    setCeremonyElapsed(0);
  }

  /**
   * Inicia a simulação.
   */
  function startSimulation(): void {
    if (players.length === 0) {
      return;
    }

    resetSimulation();

    winnerIndexRef.current = Math.floor(Math.random() * players.length);

    setSimulationState("countdown");

    schedule(() => {
      setCountdown(2);
    }, COUNTDOWN_STEP_MS);

    schedule(() => {
      setCountdown(1);
    }, COUNTDOWN_STEP_MS * 2);

    schedule(() => {
      startCeremony();
    }, COUNTDOWN_STEP_MS * 3);
  }

  /**
   * Inicia a timeline contínua.
   */
  function startCeremony(): void {
    setSimulationState("ceremony");

    setCeremonyElapsed(0);

    currentNameIndexRef.current = 0;
    nextNameSwitchAtRef.current = 0;

    setActiveIndex(0);

    ceremonyStartRef.current = performance.now();

    const animate = (timestamp: number): void => {
      const start = ceremonyStartRef.current;

      if (start === null) {
        return;
      }

      const elapsed = timestamp - start;

      setCeremonyElapsed(elapsed);

      /**
       * Alternância progressiva.
       */
      if (elapsed < LOCK_AT_MS && elapsed >= nextNameSwitchAtRef.current) {
        const progress = clamp(elapsed / LOCK_AT_MS, 0, 1);

        const delay = 65 + progress * progress * 455;

        currentNameIndexRef.current =
          (currentNameIndexRef.current + 1) % players.length;

        setActiveIndex(currentNameIndexRef.current);

        nextNameSwitchAtRef.current = elapsed + delay;
      }

      /**
       * Trava do vencedor.
       */
      if (elapsed >= LOCK_AT_MS && !winnerLockedRef.current) {
        const winnerIndex = winnerIndexRef.current;

        if (winnerIndex !== null) {
          winnerLockedRef.current = true;

          setActiveIndex(winnerIndex);
          setWinner(players[winnerIndex]);
        }
      }

      /**
       * Após a composição final estabilizar, congelamos a timeline.
       *
       * O resultado permanece na mesma cena, mas não mantemos um
       * requestAnimationFrame ativo indefinidamente.
       */
      if (elapsed >= FINAL_SETTLED_AT_MS + 250) {
        setCeremonyElapsed(FINAL_SETTLED_AT_MS + 250);
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
  }

  /**
   * Agenda um timeout.
   */
  function schedule(callback: () => void, delay: number): void {
    const timer = window.setTimeout(callback, delay);

    timersRef.current.push(timer);
  }

  /**
   * Não aparece em produção.
   */
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const activePlayer = players[activeIndex];

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-violet-400/20 bg-violet-400/5">
      {simulationState === "idle" && (
        <SimulationControlPanel
          playersCount={players.length}
          onStart={startSimulation}
        />
      )}

      {simulationState !== "idle" && (
        <div className="relative">
          <button
            type="button"
            onClick={resetSimulation}
            className="absolute right-4 top-4 z-50 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 backdrop-blur transition hover:border-slate-500 hover:text-white"
          >
            ↺ Reiniciar
          </button>

          {simulationState === "countdown" && (
            <SimulationCountdown value={countdown} />
          )}

          {simulationState === "ceremony" && (
            <CeremonyScene
              elapsed={ceremonyElapsed}
              activePlayer={activePlayer}
              winner={winner}
            />
          )}
        </div>
      )}
    </section>
  );
}

/**
 * ==========================================================
 * PAINEL INICIAL
 * ==========================================================
 */

function SimulationControlPanel({
  playersCount,
  onStart,
}: {
  playersCount: number;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-center sm:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
          🧪 Ambiente de desenvolvimento
        </p>

        <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
          Simulação cinematográfica do Passe
        </h3>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Teste completo da cerimônia sem alterar o evento oficial, o horário
          agendado ou o banco de dados.
        </p>

        <p className="mt-3 text-xs font-semibold text-slate-600">
          {playersCount} participantes disponíveis para o teste
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={playersCount === 0}
        className="shrink-0 rounded-xl border border-violet-400/40 bg-violet-400/10 px-6 py-3 text-xs font-black uppercase tracking-wider text-violet-200 transition hover:border-violet-300 hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ▶ Iniciar cerimônia
      </button>
    </div>
  );
}

/**
 * ==========================================================
 * CONTAGEM REGRESSIVA
 * ==========================================================
 */

function SimulationCountdown({ value }: { value: number }) {
  return (
    <CinematicStage variant="countdown">
      <div key={value} className="animate-[pulse_0.7s_ease-out_1]">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">
          O sorteio começa em
        </p>

        <p className="mt-7 text-8xl font-black tabular-nums text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.25)] sm:text-[9rem]">
          {value}
        </p>
      </div>

      <div className="mx-auto mt-7 h-px w-40 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

      <p className="mt-6 text-sm font-semibold text-slate-500">
        Preparando os participantes...
      </p>
    </CinematicStage>
  );
}

/**
 * ==========================================================
 * CERIMÔNIA CONTÍNUA
 * ==========================================================
 */

function CeremonyScene({
  elapsed,
  activePlayer,
  winner,
}: {
  elapsed: number;
  activePlayer?: SimulationPlayer;
  winner: SimulationPlayer | null;
}) {
  /**
   * A composição final usa destinos diferentes no mobile e desktop.
   *
   * Isso elimina os deslocamentos absolutos de desktop que estavam
   * estourando o layout em telas de 320px.
   */
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const locked = elapsed >= LOCK_AT_MS;

  const passStarted = elapsed >= PASS_START_MS;

  const impactStarted = elapsed >= IMPACT_AT_MS;

  const finalTransitionStarted = elapsed >= FINAL_TRANSITION_START_MS;

  const finalTitleVisible = elapsed >= FINAL_TITLE_AT_MS;

  const finalTagVisible = elapsed >= FINAL_TAG_AT_MS;

  const finalMetric1Visible = elapsed >= FINAL_METRIC_1_AT_MS;

  const finalMetric2Visible = elapsed >= FINAL_METRIC_2_AT_MS;

  const finalMetric3Visible = elapsed >= FINAL_METRIC_3_AT_MS;

  const finalMetric4Visible = elapsed >= FINAL_METRIC_4_AT_MS;

  const finalSettled = elapsed >= FINAL_SETTLED_AT_MS;

  /**
   * ========================================================
   * PASSE
   * ========================================================
   */

  const passProgress = clamp(
    (elapsed - PASS_START_MS) / (IMPACT_AT_MS - PASS_START_MS),
    0,
    1,
  );

  const passEase = easeOutCubic(passProgress);

  /**
   * Na entrada:
   * sai de cima e para acima do vencedor.
   */
  const deliveryTranslateY = -230 + passEase * 125;

  /**
   * Após o impacto:
   * o próprio Passe sobe suavemente
   * para a posição da composição final.
   */
  const finalPassProgress = clamp(
    (elapsed - FINAL_TRANSITION_START_MS) / 1_250,
    0,
    1,
  );

  const finalPassEase = easeOutCubic(finalPassProgress);

  const deliveryScale =
    passProgress < 0.32
      ? 0.45 + easeOutBack(passProgress / 0.32) * 0.65
      : 1.1 - ((passProgress - 0.32) / 0.68) * 0.18;

  const passRotate = finalTransitionStarted ? 0 : -12 + passEase * 12;

  const passOpacity = clamp(passProgress * 2.8, 0, 1);

  /**
   * ========================================================
   * DESTINO RESPONSIVO DO PASSE
   * ========================================================
   *
   * Desktop:
   * - Passe termina à esquerda do nome.
   *
   * Mobile:
   * - Passe permanece centralizado acima do nome.
   *
   * A trajetória continua sendo a mesma animação; apenas o
   * destino muda conforme o breakpoint.
   */
  const finalPassX = isDesktop ? -215 : 0;

  /**
   * Desktop:
   * o Passe termina dentro da faixa esquerda do card.
   *
   * Mobile:
   * o Passe termina acima do card, centralizado.
   */
  const finalPassY = isDesktop ? 58 : -95;
  const finalPassScale = isDesktop ? 0.8 : 0.7;

  const passTranslateX = finalTransitionStarted
    ? lerp(0, finalPassX, finalPassEase)
    : 0;

  const passTranslateY = finalTransitionStarted
    ? lerp(-105, finalPassY, finalPassEase)
    : deliveryTranslateY;

  const passScale = finalTransitionStarted
    ? lerp(0.92, finalPassScale, finalPassEase)
    : deliveryScale;

  /**
   * ========================================================
   * IMPACTO
   * ========================================================
   */

  const impactProgress = clamp(
    (elapsed - IMPACT_AT_MS) / (IMPACT_END_MS - IMPACT_AT_MS),
    0,
    1,
  );

  const flashOpacity = impactStarted
    ? Math.max(0, 0.32 - impactProgress * 0.32)
    : 0;

  const impactPulse = impactStarted ? Math.sin(impactProgress * Math.PI) : 0;

  /**
   * ========================================================
   * CARD DO VENCEDOR
   * ========================================================
   */

  const cardFinalProgress = clamp(
    (elapsed - FINAL_TRANSITION_START_MS) / 1_300,
    0,
    1,
  );

  /**
   * ========================================================
   * POSICIONAMENTO FINAL DO VENCEDOR
   * ========================================================
   *
   * O card permanece praticamente na mesma posição.
   * O conteúdo interno é que será deslocado para a direita,
   * abrindo espaço para o Passe.
   */
  /**
   * No mobile o card desce um pouco mais para abrir uma área
   * vertical exclusiva para o Passe. No desktop, mantém a
   * composição horizontal aprovada.
   */
  const finalCardY = isDesktop ? 58 : 60;

  const cardTranslateY = locked
    ? finalTransitionStarted
      ? lerp(55, finalCardY, easeOutCubic(cardFinalProgress))
      : 55
    : 0;

  const cardScale = locked
    ? finalTransitionStarted
      ? lerp(1 + impactPulse * 0.055, 1, easeOutCubic(cardFinalProgress))
      : 1 + impactPulse * 0.055
    : 1;

  const displayedPlayer = locked && winner ? winner : activePlayer;

  return (
    <CinematicStage variant="ceremony">
      {/*
       * ====================================================
       * HALO
       * ====================================================
       */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: locked
            ? finalSettled
              ? "rgba(251,191,36,0.07)"
              : "rgba(251,191,36,0.11)"
            : "rgba(56,189,248,0.035)",

          transition: "background 800ms ease",
        }}
      />

      {/*
       * Flash de impacto.
       */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            "radial-gradient(circle at center, rgba(254,240,138,0.9) 0%, rgba(251,191,36,0.22) 35%, transparent 72%)",

          opacity: flashOpacity,
        }}
      />

      {/*
       * ====================================================
       * CABEÇALHO DA CENA
       * ====================================================
       */}
      <div className="relative z-20 min-h-[70px] w-full sm:min-h-[92px]">
        {/*
         * Cabeçalho original da cerimônia.
         *
         * Ele desaparece enquanto o título definitivo ocupa
         * exatamente a mesma região. Assim não existe salto de layout.
         */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700"
          style={{
            opacity: finalTransitionStarted ? 0 : 1,
            transform: finalTransitionStarted
              ? "translateY(-10px)"
              : "translateY(0)",
          }}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-[0.28em] transition-colors duration-700 sm:text-xs sm:tracking-[0.34em] ${
              locked ? "text-amber-400" : "text-sky-300"
            }`}
          >
            {locked ? "Temos um vencedor" : "Sorteio em andamento"}
          </p>

          <h3 className="mt-3 text-2xl font-black text-white sm:mt-4 sm:text-5xl">
            {locked ? "O Passe encontrou seu dono" : "Quem levará o Passe?"}
          </h3>
        </div>

        {/*
         * Título definitivo.
         *
         * Ele nasce no lugar do cabeçalho da cerimônia e permanece
         * ACIMA do Passe + vencedor, em desktop e mobile.
         */}
        <div
          className="absolute inset-0 flex items-center justify-center px-3 transition-all duration-700"
          style={{
            opacity: finalTitleVisible ? 1 : 0,
            transform: finalTitleVisible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-400 sm:text-xs sm:tracking-[0.35em]">
            Passe de Temporada entregue a
          </p>
        </div>
      </div>

      {/*
       * ====================================================
       * ÁREA CENTRAL
       * ====================================================
       */}
      <div className="relative z-20 mt-2 flex min-h-[330px] w-full max-w-3xl items-center justify-center sm:mt-3 sm:min-h-[300px]">
        {/*
         * Halo atrás do Passe.
         */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 blur-3xl"
          style={{
            opacity: passStarted
              ? finalSettled
                ? 0.08
                : 0.05 + passProgress * 0.13
              : 0,
          }}
        />

        {/*
         * ==================================================
         * PASSE
         * ==================================================
         */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-30"
          style={{
            opacity: passOpacity,

            transform: `
                translate(-50%, -50%)
                translate(
                    ${passTranslateX}px,
                    ${passTranslateY}px
                )
                scale(${passScale})
                rotate(${passRotate}deg)
                `,

            filter: finalSettled
              ? "drop-shadow(0 0 28px rgba(251,191,36,0.65))"
              : impactStarted
                ? "drop-shadow(0 0 42px rgba(251,191,36,0.95))"
                : "drop-shadow(0 0 25px rgba(251,191,36,0.55))",

            willChange: "transform, opacity, filter",
          }}
        >
          <Image
            src={SEASON_PASS_IMAGE}
            alt="Passe de Temporada"
            width={260}
            height={260}
            priority
            className="h-40 w-40 object-contain sm:h-60 sm:w-60"
          />
        </div>

        {/*
         * ==================================================
         * PARTÍCULAS
         * ==================================================
         */}
        {CELEBRATION_PARTICLES.map((particle, index) => {
          const particleProgress = clamp(
            (elapsed - IMPACT_AT_MS - particle.delay) / 700,
            0,
            1,
          );

          const opacity =
            particleProgress > 0 ? Math.sin(particleProgress * Math.PI) : 0;

          const particleDistanceScale = isDesktop ? 1 : 0.55;

          return (
            <span
              key={index}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-40 rounded-full bg-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.95)]"
              style={{
                width: particle.size,

                height: particle.size,

                opacity,

                transform: `
                    translate(-50%, -50%)
                    translate(
                      ${particle.x * particleProgress * particleDistanceScale}px,
                      ${particle.y * particleProgress * particleDistanceScale}px
                    )
                    scale(${0.6 + particleProgress * 0.8})
                  `,
              }}
            />
          );
        })}

        {/*
         * ==================================================
         * CARD / NOME DO VENCEDOR
         * ==================================================
         */}
        <div
          className={`relative z-20 w-full max-w-2xl overflow-hidden rounded-3xl border px-4 py-6 backdrop-blur transition-colors duration-700 sm:px-6 sm:py-9 ${
            locked
              ? "border-amber-400/40 bg-amber-400/5"
              : "border-sky-400/20 bg-slate-900/60"
          }`}
          style={{
            transform: `
                translateY(${cardTranslateY}px)
                scale(${cardScale})
            `,

            boxShadow: locked
              ? finalSettled
                ? "0 0 35px rgba(251,191,36,0.10)"
                : "0 0 70px rgba(251,191,36,0.18)"
              : "0 20px 50px rgba(0,0,0,0.2)",

            transition: finalTransitionStarted
              ? "transform 900ms cubic-bezier(0.22,1,0.36,1), box-shadow 900ms ease"
              : "transform 450ms cubic-bezier(0.22,1,0.36,1), box-shadow 700ms ease",
          }}
        >
          <div
            className={`mx-auto min-w-0 w-full transition-all duration-1000 ${
              finalTransitionStarted
                ? "max-w-[94%] sm:ml-[190px] sm:mr-4 sm:w-[calc(100%-206px)] sm:max-w-none"
                : "max-w-[560px]"
            }`}
          >
            <WinnerIdentity
              player={displayedPlayer}
              locked={locked}
              tagVisible={finalTagVisible}
              finalLayout={finalTransitionStarted}
            />
          </div>
        </div>
      </div>

      {/*
       * ====================================================
       * RESULTADO FINAL NASCENDO DA MESMA CENA
       * ====================================================
       */}
      {winner && (
        <div className="relative z-20 mt-2 w-full sm:mt-3">
          <div className="mx-auto mt-2 grid max-w-2xl grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3">
            <FinalMetric
              visible={finalMetric1Visible}
              label="Guerras"
              value={winner.warsPlayed}
            />

            <FinalMetric
              visible={finalMetric2Visible}
              label="Ataques"
              value={`${winner.attacksUsed}/${winner.attacksAvailable}`}
            />

            <FinalMetric
              visible={finalMetric3Visible}
              label="Estrelas"
              value={winner.stars}
            />

            <FinalMetric
              visible={finalMetric4Visible}
              label="Destruição"
              value={`${winner.destruction}%`}
            />
          </div>

          <div
            className="mx-auto mt-7 max-w-md rounded-2xl border border-violet-400/20 bg-violet-400/5 px-5 py-4 transition-all duration-700"
            style={{
              opacity: finalSettled ? 1 : 0,

              transform: finalSettled ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-300 sm:text-xs sm:tracking-[0.16em]">
              Resultado apenas de simulação
            </p>
          </div>
        </div>
      )}

      {/*
       * Barra visual durante a rotação.
       */}
      {!locked && (
        <div className="relative z-20 mx-auto mt-8 h-1 w-44 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-sky-400"
            style={{
              width: `${clamp(elapsed / LOCK_AT_MS, 0, 1) * 100}%`,
            }}
          />
        </div>
      )}
    </CinematicStage>
  );
}

/**
 * ==========================================================
 * MÉTRICA FINAL
 * ==========================================================
 */

function FinalMetric({
  visible,
  label,
  value,
}: {
  visible: boolean;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-4 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,

        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(14px) scale(0.96)",
      }}
    >
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

/**
 * ==========================================================
 * PALCO
 * ==========================================================
 */

function CinematicStage({
  children,
  variant = "ceremony",
}: {
  children: ReactNode;
  variant?: "countdown" | "ceremony";
}) {
  const isCountdown = variant === "countdown";

  return (
    <div
      className={`relative isolate overflow-hidden bg-slate-950 text-center ${
        isCountdown
          ? "min-h-[390px] px-3 py-7 sm:min-h-[430px] sm:px-8 sm:py-10"
          : "min-h-[590px] px-3 py-7 sm:min-h-[640px] sm:px-8 sm:py-10"
      }`}
    >
      <div className="pointer-events-none absolute left-1/2 top-[-180px] -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(2,6,23,0.55)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-black/50 to-transparent" />

      <div
        className={`relative mx-auto flex max-w-5xl flex-col items-center justify-center ${
          isCountdown
            ? "min-h-[320px] sm:min-h-[340px]"
            : "min-h-[500px] sm:min-h-[550px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * ==========================================================
 * IDENTIDADE RESPONSIVA DO VENCEDOR
 * ==========================================================
 */

/**
 * Mede a largura REAL do nome e escolhe automaticamente
 * o maior tamanho de fonte que cabe em uma única linha.
 *
 * Isso funciona melhor que contar caracteres porque nomes
 * podem conter:
 *
 * - caracteres full-width;
 * - emojis;
 * - símbolos;
 * - letras com larguras muito diferentes.
 */
function WinnerIdentity({
  player,
  locked,
  tagVisible,
  finalLayout,
}: {
  player?: SimulationPlayer;
  locked: boolean;
  tagVisible: boolean;
  finalLayout: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState(32);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !player) {
      return;
    }

    const fit = (): void => {
      const width = container.clientWidth;

      if (width <= 0) {
        return;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const computed = window.getComputedStyle(container);
      const family =
        computed.fontFamily || "ui-sans-serif, system-ui, sans-serif";

      const desktop = window.matchMedia("(min-width: 640px)").matches;

      const minimum = desktop ? 20 : 14;
      const maximum = finalLayout ? (desktop ? 46 : 28) : desktop ? 48 : 34;

      /**
       * Pequena margem interna para evitar que glifos muito
       * largos encostem na borda do container.
       */
      const targetWidth = Math.max(0, width - 12);

      let low = minimum;
      let high = maximum;
      let best = minimum;

      while (low <= high) {
        const candidate = Math.floor((low + high) / 2);

        context.font = `900 ${candidate}px ${family}`;

        const measured = context.measureText(player.name).width;

        if (measured <= targetWidth) {
          best = candidate;
          low = candidate + 1;
        } else {
          high = candidate - 1;
        }
      }

      setFontSize(best);
    };

    fit();

    const observer = new ResizeObserver(fit);

    observer.observe(container);
    window.addEventListener("resize", fit);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [player, finalLayout]);

  return (
    <div ref={containerRef} className="min-w-0 w-full">
      <p
        translate="no"
        title={player?.name}
        className="notranslate w-full overflow-hidden whitespace-nowrap text-center font-black leading-[1.05] text-white transition-[font-size,opacity,transform] duration-700"
        style={{
          fontSize: `${fontSize}px`,
        }}
      >
        {player?.name ?? "Preparando..."}
      </p>

      {locked && player && (
        <p
          className="mt-3 truncate text-xs font-semibold text-amber-200/60 transition-all duration-700 sm:text-sm"
          style={{
            opacity: tagVisible ? 1 : 0,
            transform: tagVisible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {player.tag}
        </p>
      )}
    </div>
  );
}

/**
 * Hook responsivo pequeno e isolado para manter a timeline
 * independente dos breakpoints do Tailwind.
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const update = (): void => {
      setMatches(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [query]);

  return matches;
}

/**
 * ==========================================================
 * FUNÇÕES MATEMÁTICAS
 * ==========================================================
 */

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function easeOutBack(value: number): number {
  const c1 = 1.70158;

  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}
