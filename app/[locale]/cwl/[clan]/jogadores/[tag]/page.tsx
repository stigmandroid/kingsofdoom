/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cwl/[clan]/jogadores/[tag]/page.tsx
 *
 * Responsabilidade:
 * Exibir a análise competitiva individual de um jogador
 * avaliado pela inteligência KODA para a CWL.
 *
 * Funcionalidades:
 * - Exibe a posição do jogador quando elegível;
 * - Exibe os indicadores utilizados na classificação;
 * - Explica os critérios de elegibilidade;
 * - Exibe os critérios aprovados e reprovados;
 * - Exibe o contexto competitivo utilizado pela KODA;
 * - Permite retornar à classificação da CWL.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/10/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getCwlPlayerFullEvaluations } from "@/services/cwl-intelligence.service";
import type { CwlRankedPlayer } from "@/lib/intelligence/cwl/rank-cwl-players";
import {
  getRankingNeighbors,
  type CwlRankingComparison,
} from "@/lib/intelligence/cwl/explain-cwl-ranking";
type PageProps = {
  params: Promise<{
    locale: string;
    clan: string;
    tag: string;
  }>;
};
const criterionLabels = {
  activity: "Atividade mínima",
  reliability: "Confiabilidade",
  averageStars: "Média de estrelas",
  averageDestruction: "Média de destruição",
  tripleRate: "Taxa de PT",
} as const;
export default async function CwlPlayerAnalysisPage({ params }: PageProps) {
  const { locale, clan, tag } = await params;
  if (clan !== "kod" && clan !== "kod-rec") {
    notFound();
  }
  const evaluations = getCwlPlayerFullEvaluations();
  const normalizedTag = decodeURIComponent(tag).startsWith("#")
    ? decodeURIComponent(tag)
    : `#${decodeURIComponent(tag)}`;
  const evaluation = evaluations.find(
    (player) => player.playerTag === normalizedTag,
  );
  if (!evaluation) {
    notFound();
  }
  const ranking = evaluation.ranking;
  const rankedPlayers = evaluations
    .map((player) => player.ranking)
    .filter((player): player is NonNullable<typeof player> => player !== null);
  const eligibility = evaluation.eligibility;
  const backHref = `/${locale}/cwl/${clan}`;
  const statusLabel =
    eligibility.status === "eligible"
      ? "Elegível"
      : eligibility.status === "provisional"
        ? "Provisório"
        : "Inelegível";
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="text-sm font-bold text-slate-400 transition hover:text-amber-300"
          >
            ← Voltar para CWL
          </Link>
          <div className="mt-8 rounded-3xl border border-amber-400/20 bg-slate-900/60 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                  KODA Competitive Intelligence
                </p>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                  {evaluation.playerName ?? evaluation.playerTag}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {evaluation.playerTag}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {ranking ? (
                  <SummaryCard label="Posição" value={`#${ranking.rank}`} />
                ) : null}
                <SummaryCard label="Status" value={statusLabel} />
              </div>
            </div>
            {ranking ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  symbol="🎯"
                  label="Taxa de PT"
                  value={`${(ranking.metrics.tripleRate * 100).toFixed(1)}%`}
                />
                <MetricCard
                  symbol="★"
                  label="Média de estrelas"
                  value={ranking.metrics.averageStars.toFixed(2)}
                />
                <MetricCard
                  symbol="💥"
                  label="Destruição média"
                  value={`${ranking.metrics.averageDestruction.toFixed(1)}%`}
                />
                <MetricCard
                  symbol="⚔"
                  label="Ataques"
                  value={`${ranking.metrics.attacksUsed}/${ranking.metrics.attacksAvailable}`}
                />
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm font-bold text-slate-300">
                  Este jogador não possui posição na classificação competitiva.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Abaixo estão os critérios utilizados pela KODA para determinar
                  a elegibilidade.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* ==================================================
          EXPLICAÇÃO DA CLASSIFICAÇÃO
      ================================================== */}
      {ranking ? (
        <section className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Classificação"
              title={`Por que ${evaluation.playerName ?? evaluation.playerTag} está em #${ranking.rank}?`}
              description="A posição é definida pela comparação entre os jogadores elegíveis e pelos critérios competitivos estabelecidos pela KODA."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <InfoCard
                title="Performance competitiva"
                value={`${ranking.metrics.attacksUsed} ataques considerados`}
              >
                <p>
                  A classificação utiliza o desempenho competitivo consolidado
                  dentro da janela analisada.
                </p>
              </InfoCard>
              <InfoCard
                title="Elegibilidade"
                value="Todos os critérios obrigatórios atendidos"
              >
                <p>
                  O jogador passou pelos gates de elegibilidade antes de ser
                  comparado com os demais jogadores elegíveis.
                </p>
              </InfoCard>
            </div>
            <RankingPositionComparison
              rankedPlayers={rankedPlayers}
              target={ranking}
            />
          </div>
        </section>
      ) : null}
      {/* ==================================================
          ELEGIBILIDADE
      ================================================== */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Elegibilidade"
            title="Critérios avaliados pela KODA"
            description="Cada critério é apresentado com o valor observado e o requisito correspondente."
          />
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(eligibility.criteria).map(([key, criterion]) => {
              const label =
                criterionLabels[key as keyof typeof criterionLabels];
              return (
                <CriterionCard
                  key={key}
                  label={label}
                  passed={criterion.passed}
                  value={formatCriterionValue(key, criterion.value)}
                  required={formatCriterionValue(key, criterion.required)}
                />
              );
            })}
          </div>
          {eligibility.failedCriteria.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
              <p className="text-sm font-black uppercase tracking-wider text-red-300">
                Critérios não atendidos
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {eligibility.failedCriteria.map((criterion) => (
                  <span
                    key={criterion}
                    className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-bold text-red-300"
                  >
                    {criterionLabels[criterion]}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <p className="text-sm font-black uppercase tracking-wider text-emerald-300">
                Todos os critérios atendidos
              </p>
              <p className="mt-2 text-sm text-slate-400">
                O jogador foi considerado elegível para a comparação
                competitiva.
              </p>
            </div>
          )}
        </div>
      </section>
      {/* ==================================================
          INTELIGÊNCIA CONTEXTUAL
      ================================================== */}
      {ranking ? (
        <section className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Inteligência contextual"
              title="Contexto competitivo"
              description="A KODA interpreta o desempenho considerando comparabilidade dos ataques, recuperação de bases e dificuldade dos alvos."
            />
            {(() => {
              const context = ranking.contextualMetrics as unknown as Record<
                string,
                unknown
              >;
              return (
                <div className="mt-6 space-y-6">
                  <ContextGroup
                    eyebrow="Comparabilidade"
                    title="Ataques comparáveis"
                    description="Mostra o desempenho do jogador nos ataques utilizados pela KODA para comparação competitiva."
                    items={[
                      {
                        symbol: "🎯",
                        label: "Ataques comparáveis",
                        value: formatContextValue(
                          "comparableAttacks",
                          context.comparableAttacks,
                        ),
                      },
                      {
                        symbol: "★",
                        label: "Triplas comparáveis",
                        value: formatContextValue(
                          "comparableTriples",
                          context.comparableTriples,
                        ),
                      },
                      {
                        symbol: "📈",
                        label: "Taxa de PT comparável",
                        value: formatContextValue(
                          "comparableTripleRate",
                          context.comparableTripleRate,
                        ),
                      },
                    ]}
                  />
                  <ContextGroup
                    eyebrow="Recuperação"
                    title="Recuperação de bases"
                    description="Indica como o jogador respondeu quando atacou bases que já haviam sido enfrentadas anteriormente."
                    items={[
                      {
                        symbol: "⚔",
                        label: "Ataques de recuperação",
                        value: formatContextValue(
                          "recoveryAttacks",
                          context.recoveryAttacks,
                        ),
                      },
                      {
                        symbol: "★",
                        label: "Triplas de recuperação",
                        value: formatContextValue(
                          "recoveryTriples",
                          context.recoveryTriples,
                        ),
                      },
                      {
                        symbol: "📈",
                        label: "Taxa de recuperação",
                        value: formatContextValue(
                          "recoveryTripleRate",
                          context.recoveryTripleRate,
                        ),
                      },
                      {
                        symbol: "🔒",
                        label: "Bases fechadas",
                        value: formatContextValue(
                          "recoveryBasesClosed",
                          context.recoveryBasesClosed,
                        ),
                      },
                    ]}
                  />
                  <ContextGroup
                    eyebrow="Dificuldade dos alvos"
                    title="Desempenho contra bases difíceis"
                    description="A KODA considera o histórico anterior dos alvos para contextualizar o resultado obtido pelo jogador."
                    items={[
                      {
                        symbol: "🎯",
                        label: "Ataques em alvos difíceis",
                        value: formatContextValue(
                          "hardestRecoveryAttempts",
                          context.hardestRecoveryAttempts,
                        ),
                      },
                      {
                        symbol: "★",
                        label: "Melhor resultado anterior",
                        value: formatStarsAndDestruction(
                          context.hardestRecoveryBestPreviousStars,
                          context.hardestRecoveryBestPreviousDestruction,
                        ),
                      },
                      {
                        symbol: "🔁",
                        label: "Média de tentativas anteriores",
                        value: formatContextValue(
                          "averagePreviousFailedAttempts",
                          context.averagePreviousFailedAttempts,
                        ),
                      },
                    ]}
                  />
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                      Impacto competitivo
                    </p>
                    <h3 className="mt-1 text-xl font-black text-white">
                      Resultado consolidado
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                      Indicadores que ajudam a entender o impacto produzido pelo
                      jogador dentro da janela competitiva analisada.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <ContextMetricCard
                        symbol="★"
                        label="Estrelas adicionadas"
                        value={formatContextValue(
                          "starsAdded",
                          context.starsAdded,
                        )}
                      />
                      <ContextMetricCard
                        symbol="★"
                        label="Estrelas por ataque"
                        value={formatContextValue(
                          "starsAddedPerAttack",
                          context.starsAddedPerAttack,
                        )}
                      />
                      <ContextMetricCard
                        symbol="🔒"
                        label="Bases fechadas"
                        value={formatContextValue(
                          "recoveryBasesClosed",
                          context.recoveryBasesClosed,
                        )}
                      />
                      <ContextMetricCard
                        symbol="⚔"
                        label="Ataques considerados"
                        value={formatContextValue(
                          "comparableAttacks",
                          context.comparableAttacks,
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      ) : null}
    </main>
  );
}
/**
 * ==========================================================
 * COMPONENTES VISUAIS
 * ==========================================================
 */
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}
function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
function MetricCard({
  symbol,
  label,
  value,
}: {
  symbol: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{symbol}</span>
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
function InfoCard({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
      <div className="mt-2 text-sm leading-6 text-slate-400">{children}</div>
    </div>
  );
}
function CriterionCard({
  label,
  passed,
  value,
  required,
}: {
  label: string;
  passed: boolean;
  value: string;
  required: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        passed
          ? "border-emerald-400/20 bg-emerald-400/5"
          : "border-red-400/20 bg-red-400/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-white">{label}</p>
        <span
          className={`text-lg ${passed ? "text-emerald-300" : "text-red-300"}`}
        >
          {passed ? "✓" : "✕"}
        </span>
      </div>
      <p className="mt-3 text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">Requisito: {required}</p>
    </div>
  );
}
/**
 * ==========================================================
 * FORMATADORES
 * ==========================================================
 */
function formatCriterionValue(key: string, value: number): string {
  switch (key) {
    case "activity":
      return value.toFixed(0);
    case "reliability":
    case "tripleRate":
      return `${(value * 100).toFixed(1)}%`;
    case "averageStars":
      return value.toFixed(2);
    case "averageDestruction":
      return `${value.toFixed(1)}%`;
    default:
      return String(value);
  }
}
function formatContextValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "number") {
    if (key === "comparableTripleRate" || key === "recoveryTripleRate") {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (
      key === "averagePreviousFailedAttempts" ||
      key === "starsAddedPerAttack"
    ) {
      return value.toFixed(2);
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }
  if (typeof value === "string") {
    return value;
  }
  return "—";
}
function formatStarsAndDestruction(
  stars: unknown,
  destruction: unknown,
): string {
  const formattedStars =
    typeof stars === "number" ? `${stars.toFixed(0)} ★` : "—";
  const formattedDestruction =
    typeof destruction === "number" ? `${destruction.toFixed(0)}%` : "—";
  if (formattedStars === "—" && formattedDestruction === "—") {
    return "—";
  }
  return `${formattedStars} / ${formattedDestruction}`;
}
function ContextGroup({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    symbol: string;
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-black text-white">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        {description}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContextMetricCard
            key={item.label}
            symbol={item.symbol}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
}
function ContextMetricCard({
  symbol,
  label,
  value,
}: {
  symbol: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2">
        <span className="text-base">{symbol}</span>
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
function ComparisonGroup({
  title,
  description,
  comparisons,
  target,
}: {
  title: string;
  description: string;
  comparisons: CwlRankingComparison[];
  target: NonNullable<(typeof comparisons)[number]["player"]>;
}) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">
          {title}
        </h4>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="space-y-3">
        {comparisons.map((comparison) => (
          <ComparisonCard
            key={comparison.player.playerTag}
            comparison={comparison}
            target={target}
          />
        ))}
      </div>
    </div>
  );
}
function RankingPositionComparison({
  rankedPlayers,
  target,
}: {
  rankedPlayers: CwlRankedPlayer[];
  target: CwlRankedPlayer;
}) {
  const comparisons = getRankingNeighbors(rankedPlayers, target.rank);
  if (comparisons.length === 0) {
    return null;
  }
  const above = comparisons
    .filter((comparison) => comparison.position < target.rank)
    .sort((a, b) => b.position - a.position);
  const below = comparisons
    .filter((comparison) => comparison.position > target.rank)
    .sort((a, b) => a.position - b.position);
  return (
    <section className="mt-6 rounded-3xl border border-amber-400/20 bg-slate-950/70 p-5 sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
          Evidência da posição
        </p>
        <h3 className="mt-2 text-xl font-black text-white">
          Comparação com jogadores próximos
        </h3>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          A KODA compara o jogador com até dois jogadores imediatamente acima e
          dois imediatamente abaixo da sua posição. Os valores abaixo mostram os
          indicadores utilizados para contextualizar a classificação.
        </p>
      </div>
      <div className="mt-6 space-y-6">
        {above.length > 0 ? (
          <ComparisonGroup
            title="Jogadores acima"
            description="Estes jogadores ocupam posições superiores no ranking."
            comparisons={above}
            target={target}
          />
        ) : null}
        <TargetComparisonCard target={target} />
        {below.length > 0 ? (
          <ComparisonGroup
            title="Jogadores abaixo"
            description="Estes jogadores ocupam posições inferiores no ranking."
            comparisons={below}
            target={target}
          />
        ) : null}
      </div>
    </section>
  );
}
function ComparisonCard({
  comparison,
  target,
}: {
  comparison: CwlRankingComparison;
  target: CwlRankedPlayer;
}) {
  const player = comparison.player;
  const comparableDelta =
    target.contextualMetrics.comparableTripleRate -
    comparison.metrics.comparableTripleRate;
  const starsDelta =
    target.metrics.averageStars - comparison.metrics.averageStars;
  const destructionDelta =
    target.metrics.averageDestruction - comparison.metrics.averageDestruction;
  const reliabilityDelta =
    target.metrics.reliabilityRate - comparison.metrics.reliabilityRate;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-black text-amber-300">
              #{comparison.position}
            </span>
            <span className="font-black text-white">
              {player.playerName ?? player.playerTag}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-slate-600">
            {player.playerTag}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[560px]">
          <ComparisonMetric
            label="PT comparável"
            value={formatPercentage(comparison.metrics.comparableTripleRate)}
            delta={formatPercentagePointDelta(comparableDelta)}
          />
          <ComparisonMetric
            label="Estrelas"
            value={comparison.metrics.averageStars.toFixed(2)}
            delta={formatNumberDelta(starsDelta)}
          />
          <ComparisonMetric
            label="Destruição"
            value={`${comparison.metrics.averageDestruction.toFixed(1)}%`}
            delta={formatPercentagePointDelta(destructionDelta)}
          />
          <ComparisonMetric
            label="Confiabilidade"
            value={formatPercentage(comparison.metrics.reliabilityRate)}
            delta={formatPercentagePointDelta(reliabilityDelta)}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800 pt-4 sm:grid-cols-4">
        <ComparisonMetric
          label="Alvos superiores"
          value={formatPercentage(comparison.metrics.higherTargetTripleRate)}
        />
        <ComparisonMetric
          label="Posição semelhante"
          value={formatPercentage(comparison.metrics.similarPositionTripleRate)}
        />
        <ComparisonMetric
          label="Alvos inferiores"
          value={formatPercentage(comparison.metrics.lowerTargetTripleRate)}
        />
        <ComparisonMetric
          label="Recuperação"
          value={formatPercentage(comparison.metrics.recoveryTripleRate)}
        />
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
          Diferenças em relação ao jogador analisado
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {describeComparison(target, comparison)}
        </p>
      </div>
    </div>
  );
}
function TargetComparisonCard({ target }: { target: CwlRankedPlayer }) {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.04] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Jogador analisado
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-black text-slate-950">
              #{target.rank}
            </span>
            <span className="text-lg font-black text-white">
              {target.playerName ?? target.playerTag}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-slate-500">
            {target.playerTag}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ComparisonMetric
            label="PT comparável"
            value={formatPercentage(
              target.contextualMetrics.comparableTripleRate,
            )}
          />
          <ComparisonMetric
            label="Estrelas"
            value={target.metrics.averageStars.toFixed(2)}
          />
          <ComparisonMetric
            label="Destruição"
            value={`${target.metrics.averageDestruction.toFixed(1)}%`}
          />
          <ComparisonMetric
            label="Confiabilidade"
            value={formatPercentage(target.metrics.reliabilityRate)}
          />
        </div>
      </div>
    </div>
  );
}
function ComparisonMetric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
      {delta ? (
        <p className="mt-1 text-[10px] font-bold text-slate-500">{delta}</p>
      ) : null}
    </div>
  );
}
function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
function formatPercentagePointDelta(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${(value * 100).toFixed(1)} p.p.`;
}
function formatNumberDelta(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}`;
}
function describeComparison(
  target: CwlRankedPlayer,
  comparison: CwlRankingComparison,
): string {
  const comparableDelta =
    target.contextualMetrics.comparableTripleRate -
    comparison.metrics.comparableTripleRate;
  const starsDelta =
    target.metrics.averageStars - comparison.metrics.averageStars;
  const destructionDelta =
    target.metrics.averageDestruction - comparison.metrics.averageDestruction;
  const reliabilityDelta =
    target.metrics.reliabilityRate - comparison.metrics.reliabilityRate;
  const parts: string[] = [];
  if (Math.abs(comparableDelta) >= 0.0001) {
    parts.push(
      `PT comparável ${
        comparableDelta > 0 ? "superior" : "inferior"
      } em ${Math.abs(comparableDelta * 100).toFixed(1)} p.p.`,
    );
  }
  if (Math.abs(starsDelta) >= 0.01) {
    parts.push(
      `média de estrelas ${
        starsDelta > 0 ? "superior" : "inferior"
      } em ${Math.abs(starsDelta).toFixed(2)}`,
    );
  }
  if (Math.abs(destructionDelta) >= 0.1) {
    parts.push(
      `destruição média ${
        destructionDelta > 0 ? "superior" : "inferior"
      } em ${Math.abs(destructionDelta).toFixed(1)} p.p.`,
    );
  }
  if (Math.abs(reliabilityDelta) >= 0.0001) {
    parts.push(
      `confiabilidade ${
        reliabilityDelta > 0 ? "superior" : "inferior"
      } em ${Math.abs(reliabilityDelta * 100).toFixed(1)} p.p.`,
    );
  }
  if (parts.length === 0) {
    return "Os principais indicadores gerais estão muito próximos entre os dois jogadores.";
  }
  return `Em relação a ${
    comparison.player.playerName ?? comparison.player.playerTag
  }, ${parts.join("; ")}.`;
}
