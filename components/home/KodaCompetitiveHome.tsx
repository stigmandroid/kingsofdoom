"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/home/KodaCompetitiveHome.tsx
 *
 * Responsabilidade:
 * Renderizar a Home estratégica do Kings of Doom Command
 * Center, integrando identidade visual e inteligência
 * competitiva da KODA.
 *
 * Funcionalidades:
 * - apresenta o Hero principal do ecossistema Kings of Doom;
 * - integra KODA, King e a identidade visual K.O.D.;
 * - apresenta o panorama do pool competitivo;
 * - alterna entre as formações de K.O.D. e K.O.D.rec;
 * - exibe titulares e reservas sugeridos pela KODA;
 * - apresenta vagas competitivas e necessidades de recrutamento;
 * - resume os critérios de elegibilidade competitiva;
 * - mantém a decisão final das escalações com a liderança.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 1.1.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import Image from "next/image";

import type { Clan } from "@/types/clan";
import type { CurrentWarResult } from "@/types/war";

import type {
  CwlRosterAllocation,
  CwlRosterSlot,
} from "@/lib/intelligence/cwl/allocate-cwl-roster";

import type { CwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";

import type { CwlEligibilityEvaluation } from "@/lib/intelligence/cwl/evaluate-cwl-eligibility";

type PlayerEvaluation = {
  evidence: CwlCompetitiveEvidence;

  eligibility: CwlEligibilityEvaluation;
};

type KodaCompetitiveHomeProps = {
  locale: string;

  clanSlug: "kod" | "kod-rec";

  clan: Clan;

  currentWar: CurrentWarResult;

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
  locale,
  clanSlug,
  clan,
  currentWar,
  allocation,
  evaluations,
  summary,
}: KodaCompetitiveHomeProps) {
  const isKod = clanSlug === "kod";

  const clanName = isKod ? "K.O.D." : "K.O.D.rec";

  const clanPresentation = isKod
    ? {
        title: "👑 Kings of Doom 👑",
        description:
          "Clã competitivo focado em guerras, CWL, push e evolução constante.",
        values: "★ Organização • Respeito • Compromisso ★",
        motto: "★ Veni • Vidi • Vici ★",
      }
    : {
        title: "👑 Kings of Doom Recruta 👑",
        description:
          "Clã competitivo focado em guerras, CWL, push e evolução constante.",
        values: "★ Organização • Respeito • Compromisso ★",
        motto: "★ Veni • Vidi • Vici ★",
      };

  const starters = isKod ? allocation.kod : allocation.kodRec;

  const reserves = isKod ? allocation.kodReserves : allocation.kodRecReserves;

  const startersFilled = countFilled(starters);

  const reservesFilled = countFilled(reserves);

  const starterOpen = starters.length - startersFilled;

  const reserveOpen = reserves.length - reservesFilled;

  const warClan = currentWar.available ? currentWar.war.clan : undefined;
  const warOpponent = currentWar.available
    ? currentWar.war.opponent
    : undefined;

  const hasCurrentWar = Boolean(warClan && warOpponent);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-slate-950">
        {/* Atmosfera geral */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_16%_45%,rgba(127,29,29,0.12),transparent_30%),radial-gradient(circle_at_84%_45%,rgba(30,41,59,0.55),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto min-h-[680px] max-w-[1600px] overflow-hidden px-4 sm:min-h-[760px] sm:px-6 lg:min-h-[820px] lg:px-8">
          <div className="pointer-events-none absolute bottom-[-12px] left-[-112px] z-10 w-[330px] sm:bottom-[-18px] sm:left-[-70px] sm:w-[430px] lg:bottom-[-26px] lg:left-[-45px] lg:w-[560px] xl:left-0 xl:w-[620px]">
            <Image
              src="/koda-home.png"
              alt="KODA"
              width={900}
              height={1400}
              priority
              className="h-auto w-full object-contain drop-shadow-[0_0_32px_rgba(185,28,28,0.18)]"
            />
          </div>

          <div className="pointer-events-none absolute bottom-0 right-[-112px] z-10 w-[330px] sm:right-[-70px] sm:w-[430px] lg:bottom-[-2px] lg:right-[-45px] lg:w-[560px] xl:right-0 xl:w-[620px]">
            <Image
              src="/king-home.png"
              alt="King"
              width={900}
              height={1400}
              priority
              className="h-auto w-full object-contain drop-shadow-[0_0_32px_rgba(245,158,11,0.12)]"
            />
          </div>

          <div className="relative z-20 mx-auto flex min-h-[680px] max-w-3xl flex-col items-center justify-center py-16 text-center sm:min-h-[760px] lg:min-h-[820px]">
            <div className="relative z-20 flex flex-col items-center -translate-y-8 sm:translate-y-0 lg:-translate-y-10">
              <div className="-translate-y-20 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 backdrop-blur-md sm:translate-y-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 sm:text-xs">
                  Kings of Doom · Command Center
                </p>
              </div>

              <div className="relative mt-[-4px] flex h-[170px] w-[170px] -translate-y-8 items-center justify-center sm:mt-7 sm:h-[220px] sm:w-[220px] sm:translate-y-0 lg:h-[250px] lg:w-[250px]">
                <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-[70px]" />
                <div className="absolute inset-2 rounded-full border border-amber-400/20 shadow-[0_0_70px_rgba(245,158,11,0.20)]" />
                <div className="absolute inset-6 rounded-full border border-slate-700/50" />
                <div className="absolute inset-10 rounded-full border border-slate-800/80" />
                <Image
                  src="/kod-logo.png"
                  alt="Kings of Doom"
                  width={260}
                  height={260}
                  priority
                  unoptimized
                  className="relative z-10 h-auto w-[145px] animate-[kodFloat_4s_ease-in-out_infinite] object-contain drop-shadow-[0_0_24px_rgba(245,158,11,0.35)] sm:w-[185px] lg:w-[205px]"
                />
              </div>
            </div>

            <div className="relative z-20 translate-y-12 sm:translate-y-0 lg:-translate-y-10">
              <p
                className="mt-7 text-[10px] font-black uppercase tracking-[0.38em] text-white sm:text-xs"
                style={{
                  WebkitTextStroke: "0.35px rgba(0,0,0,0.9)",
                  textShadow:
                    "0 1px 2px rgba(0,0,0,1), 0 2px 8px rgba(0,0,0,0.85)",
                }}
              >
                Força · Inteligência · Performance
              </p>

              <h1
                className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl"
                style={{
                  WebkitTextStroke: "0.5px rgba(0,0,0,0.9)",
                  textShadow:
                    "0 2px 3px rgba(0,0,0,0.95), 0 4px 14px rgba(0,0,0,0.65)",
                }}
              >
                Dados vencem
                <span className="block text-amber-400">guerras.</span>
              </h1>

              <p
                className="mt-6 max-w-xl rounded-2xl border border-white/5 bg-slate-950/55 px-4 py-3 text-sm font-medium leading-6 text-white shadow-2xl backdrop-blur-md sm:px-5 sm:text-base sm:leading-7"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.95)" }}
              >
                A força dos Kings of Doom encontra a inteligência da KODA para
                transformar dados competitivos em decisões de guerra.
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-40 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-4 lg:grid-cols-2">
            {/* Guerra agora */}
            <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                Guerra agora
              </p>

              {hasCurrentWar && warClan && warOpponent ? (
                <>
                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div className="min-w-0 text-center">
                      <img
                        src={warClan.badgeUrls.small}
                        alt=""
                        className="mx-auto mb-1.5 h-9 w-9 object-contain"
                      />

                      <p className="truncate text-base font-black text-white sm:text-lg">
                        {warClan.name}
                      </p>

                      <p className="mt-1 text-2xl font-black text-amber-400">
                        {warClan.stars} ★
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-950 text-[10px] font-black uppercase text-slate-500">
                      VS
                    </div>

                    <div className="min-w-0 text-center">
                      <img
                        src={warOpponent.badgeUrls.small}
                        alt=""
                        className="mx-auto mb-1.5 h-9 w-9 object-contain"
                      />

                      <p className="truncate text-base font-black text-white sm:text-lg">
                        {warOpponent.name}
                      </p>

                      <p className="mt-1 text-2xl font-black text-amber-400">
                        {warOpponent.stars} ★
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800 pt-3 text-center">
                    <div className="px-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                        Destruição
                      </p>

                      <p className="mt-1 text-xs font-black text-slate-300">
                        {warClan.destructionPercentage.toLocaleString("pt-BR", {
                          maximumFractionDigits: 2,
                        })}
                        %
                      </p>
                    </div>

                    <div className="px-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                        Ataques
                      </p>

                      <p className="mt-1 text-xs font-black text-slate-300">
                        {warClan.attacks}
                      </p>
                    </div>

                    <div className="px-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                        Guerra
                      </p>

                      <p className="mt-1 text-xs font-black text-slate-300">
                        {currentWar.available
                          ? `${currentWar.war.teamSize ?? "—"} x ${
                              currentWar.war.teamSize ?? "—"
                            }`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 flex min-h-24 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40 px-4">
                  <p className="text-sm font-bold text-slate-500">
                    Nenhuma guerra disponível no momento.
                  </p>
                </div>
              )}
            </div>

            {/* Informações do clã */}
            <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">
                    Informações do clã
                  </p>

                  <div className="shrink-0 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-xs font-black text-amber-400">
                    Nível {clan.clanLevel}
                  </div>
                </div>

                <div className="mt-2 grid flex-1 items-center gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                  {/* Identidade do clã */}
                  <div className="flex min-w-0 flex-col items-center justify-center text-center sm:border-r sm:border-slate-800 sm:pr-5">
                    {clan.badgeUrls?.small && (
                      <img
                        src={clan.badgeUrls.small}
                        alt=""
                        className="mb-1 h-12 w-12 object-contain"
                      />
                    )}

                    <p className="whitespace-nowrap text-base font-black text-white sm:text-lg">
                      {clan.name}
                    </p>

                    <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                      {clan.tag}
                    </p>
                  </div>

                  {/* Apresentação editorial */}
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-100">
                      {clanPresentation.title}
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                      {clanPresentation.description}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {clanPresentation.values}
                    </p>

                    <p className="mt-1 text-xs font-black text-amber-400">
                      {clanPresentation.motto}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800 pt-3 text-center">
                <div className="px-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                    Membros
                  </p>

                  <p className="mt-1 text-xs font-black text-slate-300">
                    {clan.members}/50
                  </p>
                </div>

                <div className="px-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                    Liga
                  </p>

                  <p className="mt-1 truncate text-xs font-black text-slate-300">
                    {clan.warLeague?.name ?? "Indisponível"}
                  </p>
                </div>

                <div className="px-2">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                    Pontos
                  </p>

                  <p className="mt-1 text-xs font-black text-slate-300">
                    {clan.clanPoints.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
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
