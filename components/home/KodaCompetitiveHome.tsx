"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/home/KodaCompetitiveHome.tsx
 *
 * Responsabilidade:
 * Renderizar a interface principal da inteligência competitiva
 * da KODA na Home do Kings of Doom Command Center.
 *
 * Funcionalidades:
 *
 * - apresenta o panorama do pool competitivo;
 * - alterna entre as formações de K.O.D. e K.O.D.rec;
 * - exibe titulares e reservas sugeridos;
 * - apresenta vagas competitivas abertas;
 * - resume elegibilidade do pool;
 * - mantém a decisão final sob responsabilidade da liderança.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 1.0.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import { useState } from "react";

import type {
  CwlRosterAllocation,
  CwlRosterSlot,
} from "@/lib/intelligence/cwl/allocate-cwl-roster";

import type { CwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";

import type { CwlEligibilityEvaluation } from "@/lib/intelligence/cwl/evaluate-cwl-eligibility";

type ClanSelection = "kod" | "kod-rec";

type PlayerEvaluation = {
  evidence: CwlCompetitiveEvidence;
  eligibility: CwlEligibilityEvaluation;
};

type KodaCompetitiveHomeProps = {
  locale: string;

  allocation: CwlRosterAllocation;

  evaluations: PlayerEvaluation[];

  summary: {
    totalPlayers: number;
    eligiblePlayers: number;
    provisionalPlayers: number;
    ineligiblePlayers: number;
  };
};

export function KodaCompetitiveHome({
  allocation,
  evaluations,
  summary,
}: KodaCompetitiveHomeProps) {
  const [selectedClan, setSelectedClan] = useState<ClanSelection>("kod");

  const isKod = selectedClan === "kod";

  const clanName = isKod ? "K.O.D." : "K.O.D.rec";

  const starters = isKod ? allocation.kod : allocation.kodRec;

  const reserves = isKod ? allocation.kodReserves : allocation.kodRecReserves;

  const startersFilled = countFilled(starters);
  const reservesFilled = countFilled(reserves);

  const starterOpen = starters.length - startersFilled;

  const reserveOpen = reserves.length - reservesFilled;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
              Kings of Doom
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              KODA
            </h1>

            <p className="mt-2 text-lg font-black uppercase tracking-[0.22em] text-slate-400 sm:text-xl">
              Competitive Intelligence
            </p>

            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-400">
              Inteligência competitiva construída a partir dos dados reais de
              K.O.D. e K.O.D.rec para apoiar decisões de formação, performance e
              recrutamento.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.15em]">
              <FlowStep>Dados</FlowStep>
              <FlowArrow />
              <FlowStep>Inteligência</FlowStep>
              <FlowArrow />
              <FlowStep>Decisão</FlowStep>
              <FlowArrow />
              <FlowStep>Performance</FlowStep>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Jogadores analisados"
              value={summary.totalPlayers}
              description="Pool competitivo"
            />

            <MetricCard
              label="Elegíveis"
              value={summary.eligiblePlayers}
              description="Aptos pelos critérios atuais"
            />

            <MetricCard
              label="Provisórios"
              value={summary.provisionalPlayers}
              description="Amostra ainda insuficiente"
            />

            <MetricCard
              label="Inelegíveis"
              value={summary.ineligiblePlayers}
              description="Falha em um ou mais critérios"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                Formação sugerida
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Escalação competitiva
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                O pool de K.O.D. e K.O.D.rec é analisado em conjunto. A
                associação atual do jogador a um dos clãs não garante posição na
                formação sugerida.
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Visualizar formação
              </span>

              <select
                value={selectedClan}
                onChange={(event) =>
                  setSelectedClan(event.target.value as ClanSelection)
                }
                className="min-w-56 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-black text-white outline-none transition focus:border-amber-400"
              >
                <option value="kod">K.O.D.</option>

                <option value="kod-rec">K.O.D.rec</option>
              </select>
            </label>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Formação KODA
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {clanName}
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <SmallMetric label="Titulares" value={`${startersFilled}/15`} />

                <SmallMetric label="Reservas" value={`${reservesFilled}/3`} />

                <SmallMetric label="Vagas" value={starterOpen + reserveOpen} />
              </div>
            </div>

            <div className="mt-8">
              <SectionHeading
                eyebrow="Formação principal"
                title="Titulares"
                counter={`${startersFilled}/15`}
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {starters.map((slot) => (
                  <PlayerSlot
                    key={`${slot.clan}-starter-${slot.slot}`}
                    slot={slot}
                  />
                ))}
              </div>
            </div>

            <div className="mt-10 border-t border-slate-800 pt-8">
              <SectionHeading
                eyebrow="Banco competitivo"
                title="Reservas"
                counter={`${reservesFilled}/3`}
              />

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {reserves.map((slot) => (
                  <PlayerSlot
                    key={`${slot.clan}-reserve-${slot.slot}`}
                    slot={slot}
                    reserve
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                Critérios KODA
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Elegibilidade competitiva
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                A elegibilidade é avaliada antes da classificação. Um desempenho
                forte em um indicador não compensa a reprovação em outro
                critério obrigatório.
              </p>

              <div className="mt-6 space-y-3">
                <Criterion title="Atividade competitiva" value="12+ ataques" />

                <Criterion
                  title="Comprometimento"
                  value="90%+ dos ataques disponíveis"
                />

                <Criterion title="Média de estrelas" value="2,60+" />

                <Criterion title="Destruição média" value="90%+" />

                <Criterion title="Taxa de PT" value="80%+" />
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Janela competitiva móvel de 30 dias. Na configuração atual, CWL
                e guerras normais compõem as evidências.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                Necessidade competitiva
              </p>

              <h2 className="mt-2 text-2xl font-black">Recrutamento</h2>

              <div className="mt-6">
                <p className="text-5xl font-black text-white">
                  {allocation.summary.recruitmentNeed}
                </p>

                <p className="mt-2 text-sm font-bold text-slate-400">
                  vagas titulares sem jogador elegível
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <SmallMetric
                  label="K.O.D."
                  value={`${allocation.summary.kodOpen} abertas`}
                />

                <SmallMetric
                  label="K.O.D.rec"
                  value={`${allocation.summary.kodRecOpen} abertas`}
                />
              </div>

              <p className="mt-6 text-sm leading-6 text-slate-400">
                A KODA não completa a escalação artificialmente. Quando o pool
                não possui jogadores elegíveis suficientes, a posição permanece
                aberta e se torna uma necessidade objetiva de recrutamento.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/30 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  Universo analisado
                </p>

                <p className="mt-2 font-bold text-slate-300">
                  {evaluations.length} jogadores com evidência competitiva
                </p>
              </div>

              <p className="max-w-xl text-xs leading-5 text-slate-500 sm:text-right">
                A classificação apresentada é uma ferramenta de apoio à decisão.
                A definição final das escalações permanece com a liderança Kings
                of Doom.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PlayerSlot({
  slot,
  reserve = false,
}: {
  slot: CwlRosterSlot;
  reserve?: boolean;
}) {
  const player = slot.player;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-sm font-black text-slate-400">
          {reserve ? `R${slot.slot}` : String(slot.slot).padStart(2, "0")}
        </div>

        {player ? (
          <div className="min-w-0 flex-1">
            <p className="truncate font-black text-white">
              {player.playerName ?? player.playerTag}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {player.playerTag}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>{(player.metrics.tripleRate * 100).toFixed(1)}% PT</span>

              <span>{player.metrics.averageStars.toFixed(2)} ★</span>

              <span>{player.metrics.averageDestruction.toFixed(1)}%</span>

              <span>
                {player.metrics.attacksUsed}/{player.metrics.attacksAvailable}
              </span>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-500">
              {reserve ? "Reserva em aberto" : "Vaga competitiva aberta"}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Nenhum jogador elegível disponível para esta posição.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black text-white">{value}</p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-28 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  counter,
}: {
  eyebrow: string;
  title: string;
  counter: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-xl font-black text-white">{title}</h3>
      </div>

      <p className="text-sm font-black text-slate-500">{counter}</p>
    </div>
  );
}

function Criterion({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
      <span className="text-sm font-bold text-slate-300">{title}</span>

      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function FlowStep({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-300">
      {children}
    </span>
  );
}

function FlowArrow() {
  return <span className="text-amber-400">→</span>;
}

function countFilled(slots: CwlRosterSlot[]): number {
  return slots.filter((slot) => slot.status === "filled").length;
}
