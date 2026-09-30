/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlPlayerContextCard.tsx
 *
 * Responsabilidade:
 * Exibir de forma transparente os fatores utilizados pela
 * inteligência competitiva para avaliar um jogador da CWL.
 *
 * Princípios:
 *
 * - mostrar resultado e contexto separadamente;
 * - não esconder fatores utilizados pela classificação;
 * - permitir que jogadores e liderança compreendam a análise;
 * - não transformar esta camada visual em regra competitiva.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 30/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Desenvolvimento
 * ==========================================================
 */

import type { CwlRankedPlayer } from "@/lib/intelligence/cwl/rank-cwl-players";

type CwlPlayerContextCardProps = {
  player: CwlRankedPlayer;
};

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value: number): string {
  return value.toFixed(2);
}

function getStatusLabel(status: CwlRankedPlayer["eligibility"]["status"]) {
  switch (status) {
    case "eligible":
      return "Elegível";

    case "provisional":
      return "Provisório";

    case "ineligible":
      return "Não elegível";

    default:
      return status;
  }
}

function getStatusClasses(
  status: CwlRankedPlayer["eligibility"]["status"],
): string {
  switch (status) {
    case "eligible":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";

    case "provisional":
      return "border-amber-400/30 bg-amber-500/10 text-amber-300";

    case "ineligible":
      return "border-red-400/30 bg-red-500/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-white/70";
  }
}

function ContextMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-white/45">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-white">{value}</p>

      {description ? (
        <p className="mt-1 text-xs leading-5 text-white/45">{description}</p>
      ) : null}
    </div>
  );
}

export function CwlPlayerContextCard({ player }: CwlPlayerContextCardProps) {
  const performance = player.performance;
  const contextual = player.contextualMetrics;
  const eligibility = player.eligibility;

  const harder = performance.contextualExecution.harder;

  const equivalent = performance.contextualExecution.equivalent;

  const constrained = performance.contextualExecution.easierConstrained;

  const optional = performance.contextualExecution.easierOptional;

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-xl">
      {/* ======================================================
          CABEÇALHO
          ====================================================== */}

      <div className="border-b border-white/10 bg-black/20 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-white">
                #{player.rank}
              </span>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  {player.playerName ?? "Jogador sem nome"}
                </h2>

                <p className="mt-0.5 font-mono text-xs text-white/40">
                  {player.playerTag}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
              eligibility.status,
            )}`}
          >
            {getStatusLabel(eligibility.status)}
          </div>
        </div>
      </div>

      {/* ======================================================
          RESUMO
          ====================================================== */}

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ContextMetric
            label="Ataques"
            value={`${player.metrics.attacksUsed}/${player.metrics.attacksAvailable}`}
            description={`${player.metrics.attacksMissed} ataque(s) perdido(s)`}
          />

          <ContextMetric
            label="Confiabilidade"
            value={formatPercentage(player.metrics.reliabilityRate)}
          />

          <ContextMetric
            label="Média de estrelas"
            value={formatNumber(player.metrics.averageStars)}
          />

          <ContextMetric
            label="Destruição"
            value={`${player.metrics.averageDestruction.toFixed(1)}%`}
          />
        </div>

        {/* ====================================================
            RESULTADO BRUTO
            ==================================================== */}

        <section className="mt-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">
              Resultado bruto
            </h3>

            <p className="mt-1 text-xs text-white/45">
              Métricas de execução sem considerar ainda o contexto da escolha
              dos alvos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ContextMetric
              label="PT"
              value={formatPercentage(player.metrics.tripleRate)}
            />

            <ContextMetric label="Triplas" value={player.metrics.triples} />

            <ContextMetric
              label="Estrelas"
              value={performance.execution.stars}
            />

            <ContextMetric
              label="Ataques"
              value={performance.activity.attacksUsed}
            />
          </div>
        </section>

        {/* ====================================================
            CONTEXTO DOS ATAQUES
            ==================================================== */}

        <section className="mt-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">
              Contexto dos ataques
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/45">
              A inteligência considera a dificuldade e as opções disponíveis no
              momento da escolha do alvo.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ContextMetric
              label="CV superior"
              value={harder.attacks}
              description={`${harder.triples} PT`}
            />

            <ContextMetric
              label="CV equivalente"
              value={equivalent.attacks}
              description={`${equivalent.triples} PT`}
            />

            <ContextMetric
              label="CV inferior condicionado"
              value={constrained.attacks}
              description={`${constrained.triples} PT`}
            />

            <ContextMetric
              label="CV inferior opcional"
              value={optional.attacks}
              description={`${optional.triples} PT`}
            />
          </div>
        </section>

        {/* ====================================================
            DESEMPENHO CONTEXTUAL
            ==================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Desempenho contextual
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/45">
              Ataques contra alvos competitivamente comparáveis são analisados
              separadamente dos ataques inferiores considerados opcionais.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-white/45">Ataques comparáveis</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {contextual.comparableAttacks}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/45">PT comparáveis</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {formatPercentage(contextual.comparableTripleRate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/45">Estrelas adicionadas</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {contextual.starsAdded}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/45">Estrelas / ataque</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {formatNumber(contextual.starsAddedPerAttack)}
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            CONTRIBUIÇÃO
            ==================================================== */}

        <section className="mt-6">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white">
              Contribuição para o campo
            </h3>

            <p className="mt-1 text-xs text-white/45">
              Medidas de impacto geradas pelos ataques registrados.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ContextMetric
              label="Bases fechadas"
              value={performance.closure.basesClosed}
            />

            <ContextMetric
              label="Falhas recuperadas"
              value={performance.closure.recoveredPreviousFailures}
            />

            <ContextMetric
              label="Estrelas adicionadas"
              value={performance.contribution.starsAdded}
            />

            <ContextMetric
              label="Melhorias de destruição"
              value={performance.contribution.attacksImprovingDestruction}
            />
          </div>
        </section>

        {/* ====================================================
            ATAQUES EM ALVOS JÁ FECHADOS
            ==================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Alvos já fechados
              </h3>

              <p className="mt-1 text-xs leading-5 text-white/45">
                A inteligência registra separadamente ataques feitos contra
                alvos que já estavam fechados.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 px-3 py-2">
              <span className="text-xs text-white/45">Ataques registrados</span>

              <p className="mt-0.5 text-lg font-semibold text-white">
                {performance.contribution.attacksOnAlreadyClosedTargets}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <ContextMetric
              label="Ataques evitáveis"
              value={contextual.avoidableAlreadyClosedTargetAttacks}
              description="Quando havia alternativa aberta"
            />

            <ContextMetric
              label="Bases fechadas"
              value={performance.closure.basesClosed}
              description="Fechamentos realizados pelo jogador"
            />
          </div>
        </section>

        {/* ====================================================
            EXPLICAÇÃO
            ==================================================== */}

        <section className="mt-6 border-t border-white/10 pt-5">
          <h3 className="text-sm font-semibold text-white">
            Como a avaliação funciona
          </h3>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-white/55">
            <li>✓ A elegibilidade é avaliada antes da classificação.</li>

            <li>
              ✓ O resultado do ataque é analisado junto com o contexto
              disponível antes da escolha.
            </li>

            <li>
              ✓ Atacar uma vila inferior não é automaticamente considerado uma
              decisão ruim.
            </li>

            <li>
              ✓ Ataques contra alvos inferiores opcionais permanecem registrados
              e visíveis, mas são separados dos ataques competitivamente
              comparáveis.
            </li>

            <li>
              ✓ Ataques de limpeza e recuperação de falhas anteriores permanecem
              identificados separadamente.
            </li>

            <li>✓ A liderança mantém a decisão final sobre a escalação.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
