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

import { getCwlPlayerFullEvaluations } from "@/services/cwl-intelligence.service";

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

  children: React.ReactNode;
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
