/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlCompetitiveClassification.tsx
 *
 * Responsabilidade:
 * Exibir a classificação competitiva da KODA para CWL,
 * incluindo a posição dos jogadores elegíveis e a
 * justificativa dos jogadores inelegíveis ou provisórios.
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

import type { CwlPlayerFullEvaluation } from "@/lib/intelligence/cwl/rank-cwl-players";

type CwlCompetitiveClassificationProps = {
  players: CwlPlayerFullEvaluation[];
};

export function CwlCompetitiveClassification({
  players,
}: CwlCompetitiveClassificationProps) {
  const rankedPlayers = players
    .filter((player) => player.ranking !== null)
    .sort(
      (a, b) =>
        (a.ranking?.rank ?? Number.MAX_SAFE_INTEGER) -
        (b.ranking?.rank ?? Number.MAX_SAFE_INTEGER),
    );

  const nonRankedPlayers = players.filter((player) => player.ranking === null);

  const eligibleCount = rankedPlayers.length;

  const provisionalCount = players.filter(
    (player) => player.eligibility.status === "provisional",
  ).length;

  const ineligibleCount = players.filter(
    (player) => player.eligibility.status === "ineligible",
  ).length;

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-400/20 bg-slate-900/60 p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
                KODA Competitive Intelligence
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Classificação competitiva
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Classificação dos jogadores elegíveis para a CWL, acompanhada
                dos critérios utilizados para determinar a posição de cada
                jogador e dos motivos que impediram os demais de entrar no
                ranking.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Summary label="Elegíveis" value={eligibleCount} highlight />

              <Summary label="Provisórios" value={provisionalCount} />

              <Summary label="Inelegíveis" value={ineligibleCount} />
            </div>
          </div>

          <div className="mt-8">
            <SectionHeading
              eyebrow="Ranking competitivo"
              title="Jogadores elegíveis"
              description="A posição é definida pela comparação entre os jogadores que atenderam aos critérios mínimos de elegibilidade."
            />

            <div className="mt-4 space-y-2">
              {rankedPlayers.map((player) => (
                <RankedPlayer key={player.playerTag} player={player} />
              ))}
            </div>
          </div>

          {nonRankedPlayers.length > 0 ? (
            <div className="mt-10 border-t border-slate-800 pt-8">
              <SectionHeading
                eyebrow="Avaliação do elenco"
                title="Jogadores fora da classificação"
                description="Jogadores que não aparecem no ranking continuam visíveis para que a liderança possa consultar exatamente quais critérios foram ou não atingidos."
              />

              <div className="mt-4 space-y-2">
                {nonRankedPlayers.map((player) => (
                  <NonRankedPlayer key={player.playerTag} player={player} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 border-t border-slate-800 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              A classificação apresenta a análise competitiva produzida pela
              KODA. A decisão final sobre titulares, reservas e composição da
              CWL permanece com a liderança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
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
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-xl font-black text-white">{title}</h3>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function RankedPlayer({ player }: { player: CwlPlayerFullEvaluation }) {
  const ranking = player.ranking!;

  return (
    <details className="group rounded-2xl border border-slate-800 bg-slate-950/80">
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-sm font-black text-amber-300">
            #{ranking.rank}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-black text-white">
                {player.playerName ?? player.playerTag}
              </p>

              <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Elegível
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-slate-500">
              {player.playerTag}
            </p>

            <PlayerMetrics player={player} />
          </div>

          <span className="hidden text-xs font-bold text-slate-600 transition group-open:rotate-180 sm:block">
            ▼
          </span>
        </div>
      </summary>

      <div className="border-t border-slate-800 px-4 pb-5 pt-4">
        <RankingReason player={player} />
      </div>
    </details>
  );
}

function NonRankedPlayer({ player }: { player: CwlPlayerFullEvaluation }) {
  const { eligibility } = player;

  const isProvisional = eligibility.status === "provisional";

  return (
    <details className="group rounded-2xl border border-slate-800 bg-slate-950/80">
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-center gap-4">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-black",
              isProvisional
                ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                : "border-red-400/20 bg-red-400/10 text-red-300",
            ].join(" ")}
          >
            {isProvisional ? "◐" : "✕"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-black text-white">
                {player.playerName ?? player.playerTag}
              </p>

              <span
                className={[
                  "rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                  isProvisional
                    ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                    : "border-red-400/20 bg-red-400/10 text-red-300",
                ].join(" ")}
              >
                {isProvisional ? "Provisório" : "Inelegível"}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-slate-500">
              {player.playerTag}
            </p>

            <PlayerMetrics player={player} />
          </div>

          <span className="hidden text-xs font-bold text-slate-600 transition group-open:rotate-180 sm:block">
            ▼
          </span>
        </div>
      </summary>

      <div className="border-t border-slate-800 px-4 pb-5 pt-4">
        <EligibilityReason player={player} />
      </div>
    </details>
  );
}

function PlayerMetrics({ player }: { player: CwlPlayerFullEvaluation }) {
  const metrics = player.ranking?.metrics ?? {
    attacksUsed: player.eligibility.summary.attacksUsed,
    attacksAvailable: player.eligibility.summary.attacksAvailable,
    reliabilityRate: player.eligibility.summary.reliabilityRate,
    averageStars: player.eligibility.summary.averageStars,
    averageDestruction: player.eligibility.summary.averageDestruction,
    tripleRate: player.eligibility.summary.tripleRate,
  };

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
      <span>{(metrics.tripleRate * 100).toFixed(1)}% PT</span>

      <span>{metrics.averageStars.toFixed(2)} ★</span>

      <span>{metrics.averageDestruction.toFixed(1)}%</span>

      <span>
        {metrics.attacksUsed}/{metrics.attacksAvailable}
      </span>
    </div>
  );
}

function RankingReason({ player }: { player: CwlPlayerFullEvaluation }) {
  const ranking = player.ranking!;

  const context = ranking.contextualMetrics;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
          Justificativa da classificação
        </p>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          A posição é determinada pela comparação hierárquica dos critérios
          competitivos. Os critérios seguintes são utilizados quando os
          anteriores não são suficientes para separar os jogadores.
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          Evidências competitivas
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Evidence
            label="Ataques comparáveis"
            value={`${context.comparableAttacks}`}
          />

          <Evidence
            label="PT comparável"
            value={`${(context.comparableTripleRate * 100).toFixed(1)}%`}
          />

          <Evidence label="Recuperações" value={`${context.recoveryAttacks}`} />

          <Evidence
            label="PT em recuperações"
            value={rate(context.recoveryTriples, context.recoveryAttacks)}
          />

          <Evidence
            label="Alvos superiores"
            value={`${context.mapPosition.higherTargetAttacks}`}
          />

          <Evidence
            label="PT contra alvos superiores"
            value={rate(
              context.mapPosition.higherTargetTriples,
              context.mapPosition.higherTargetAttacks,
            )}
          />

          <Evidence label="Bases fechadas" value={`${context.basesClosed}`} />

          <Evidence
            label="Estrelas adicionadas"
            value={`${context.starsAdded}`}
          />

          <Evidence
            label="Ataques evitáveis"
            value={`${context.avoidableAlreadyClosedTargetAttacks}`}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          Indicadores gerais
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Evidence
            label="PT geral"
            value={`${(ranking.metrics.tripleRate * 100).toFixed(1)}%`}
          />

          <Evidence
            label="Média de estrelas"
            value={ranking.metrics.averageStars.toFixed(2)}
          />

          <Evidence
            label="Destruição"
            value={`${ranking.metrics.averageDestruction.toFixed(1)}%`}
          />

          <Evidence
            label="Confiabilidade"
            value={`${(ranking.metrics.reliabilityRate * 100).toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
}

function EligibilityReason({ player }: { player: CwlPlayerFullEvaluation }) {
  const { eligibility } = player;

  const labels: Record<keyof typeof eligibility.criteria, string> = {
    activity: "Atividade mínima",
    reliability: "Confiabilidade",
    averageStars: "Média de estrelas",
    averageDestruction: "Média de destruição",
    tripleRate: "Taxa de PT",
  };

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        Critérios de elegibilidade
      </p>

      <div className="mt-4 space-y-2">
        {(
          Object.entries(eligibility.criteria) as Array<
            [
              keyof typeof eligibility.criteria,
              (typeof eligibility.criteria)[keyof typeof eligibility.criteria],
            ]
          >
        ).map(([key, criterion]) => (
          <div
            key={key}
            className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-bold text-slate-300">
              {labels[key]}
            </span>

            <span
              className={
                criterion.passed
                  ? "text-xs font-black text-emerald-400"
                  : "text-xs font-black text-red-400"
              }
            >
              {criterion.passed ? "✓ Aprovado" : "✕ Não atingido"}
              {" · "}
              {formatCriterionValue(key, criterion.value)}
              {" / "}
              {formatCriterionValue(key, criterion.required)}
            </span>
          </div>
        ))}
      </div>

      {eligibility.failedCriteria.length > 0 ? (
        <div className="mt-4 rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wider text-red-300">
            Critérios não atingidos
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {eligibility.failedCriteria
              .map((criterion) => labels[criterion])
              .join(" · ")}
          </p>
        </div>
      ) : null}

      {eligibility.status === "provisional" ? (
        <div className="mt-4 rounded-xl border border-sky-400/10 bg-sky-400/5 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wider text-sky-300">
            Amostra insuficiente
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            O jogador ainda não atingiu a quantidade mínima de ataques
            necessária para entrar na classificação competitiva.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Evidence({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Summary({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-24 rounded-xl border border-slate-800 bg-slate-950 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={
          highlight
            ? "mt-1 text-xl font-black text-amber-300"
            : "mt-1 text-xl font-black text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}

function rate(triples: number, attacks: number): string {
  if (attacks <= 0) {
    return "—";
  }

  return `${((triples / attacks) * 100).toFixed(1)}%`;
}

function formatCriterionValue(
  key: keyof CwlPlayerFullEvaluation["eligibility"]["criteria"],
  value: number,
): string {
  if (key === "reliability" || key === "tripleRate") {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (key === "averageDestruction") {
    return `${value.toFixed(1)}%`;
  }

  if (key === "averageStars") {
    return value.toFixed(2);
  }

  return value.toString();
}
