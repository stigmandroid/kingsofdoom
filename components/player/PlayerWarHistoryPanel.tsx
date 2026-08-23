/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/PlayerWarHistoryPanel.tsx
 *
 * Responsabilidade:
 * Apresentar o histórico individual de guerras do jogador
 * utilizando os dados já persistidos no War Archive.
 *
 * A interface apresenta apenas métricas atualmente
 * consideradas confiáveis:
 *
 * • guerras participadas;
 * • ataques realizados;
 * • estrelas conquistadas;
 * • média de estrelas;
 * • média de destruição;
 * • triples;
 * • taxa de triples.
 *
 * Importante:
 *
 * Vitórias, derrotas e ataques não utilizados ainda não são
 * destacados visualmente porque guerras arquivadas em estado
 * "ongoing" podem não ter sido atualizadas após o término.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { PlayerWarHistorySummary } from "@/services/player-war-history.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type PlayerWarHistoryPanelProps = {
  history: PlayerWarHistorySummary | null;
};

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * ==========================================================
 * COMPONENTE PRINCIPAL
 * ==========================================================
 */

export function PlayerWarHistoryPanel({ history }: PlayerWarHistoryPanelProps) {
  if (!history || history.warsParticipated === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Guerras
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Ainda não há histórico de guerras persistido para este jogador.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      {/**
       * ====================================================
       * CABEÇALHO
       * ====================================================
       */}

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
          Guerras
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">
            Desempenho em guerra
          </h3>

          <div className="shrink-0 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1">
            <span className="text-[10px] font-black text-white">
              {numberFormatter.format(history.warsParticipated)}
            </span>

            <span className="ml-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">
              {history.warsParticipated === 1
                ? "participação"
                : "participações"}
            </span>
          </div>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-400">
          Histórico individual reconstruído a partir das guerras persistidas
          pelo Command Center.
        </p>
      </div>

      {/**
       * ====================================================
       * MÉTRICAS
       * ====================================================
       */}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <WarMetric
          label="Ataques"
          value={numberFormatter.format(history.attacksUsed)}
        />

        <WarMetric
          label="Estrelas"
          value={numberFormatter.format(history.stars)}
        />

        <WarMetric
          label="Média de estrelas"
          value={history.averageStars.toFixed(2)}
        />

        <WarMetric
          label="Destruição média"
          value={`${history.averageDestruction.toFixed(1)}%`}
        />

        <WarMetric
          label="Triples"
          value={numberFormatter.format(history.triples)}
          accent
        />

        <WarMetric
          label="Taxa de triples"
          value={`${history.tripleRate.toFixed(1)}%`}
          accent
        />
      </div>

      {/**
       * ====================================================
       * DISTRIBUIÇÃO DOS RESULTADOS
       * ====================================================
       */}

      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
          Distribuição dos ataques
        </p>

        <div className="mt-3 grid grid-cols-4 gap-2">
          <AttackResultMetric stars="★★★" value={history.triples} />

          <AttackResultMetric stars="★★☆" value={history.twoStars} />

          <AttackResultMetric stars="★☆☆" value={history.oneStars} />

          <AttackResultMetric stars="☆☆☆" value={history.zeroStars} />
        </div>
      </div>

      {/**
       * ====================================================
       * ÚLTIMAS GUERRAS
       * ====================================================
       */}

      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
            Guerras recentes
          </p>

          <p className="text-[9px] font-bold text-slate-600">
            Últimas {Math.min(history.history.length, 3)}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {history.history.slice(0, 3).map((war) => (
            <WarHistoryRow
              key={war.warId}
              opponentName={war.opponentName}
              attacksUsed={war.attacksUsed}
              stars={war.stars}
              averageDestruction={war.averageDestruction}
              triples={war.triples}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-[10px] leading-4 text-slate-600">
        Métricas de vitória, derrota e ataques não utilizados serão adicionadas
        após a validação da atualização final das guerras arquivadas.
      </p>
    </div>
  );
}

/**
 * ==========================================================
 * MÉTRICA
 * ==========================================================
 */

function WarMetric({
  label,
  value,
  accent = false,
}: {
  label: string;

  value: string;

  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/55 px-3 py-3 text-center">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-base font-black",
          accent ? "text-amber-300" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * ==========================================================
 * RESULTADO DE ATAQUE
 * ==========================================================
 */

function AttackResultMetric({
  stars,
  value,
}: {
  stars: string;

  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/45 px-2 py-2 text-center">
      <p className="text-[11px] tracking-tight text-amber-300">{stars}</p>

      <p className="mt-1 text-sm font-black text-white">
        {numberFormatter.format(value)}
      </p>
    </div>
  );
}

/**
 * ==========================================================
 * LINHA DE GUERRA
 * ==========================================================
 */

function WarHistoryRow({
  opponentName,
  attacksUsed,
  stars,
  averageDestruction,
  triples,
}: {
  opponentName: string;

  attacksUsed: number;

  stars: number;

  averageDestruction: number;

  triples: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/45 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-white">
          vs. {opponentName}
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          {attacksUsed} ataques · {stars} estrelas ·{" "}
          {averageDestruction.toFixed(1)}%
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-black text-amber-300">
          {triples} {triples === 1 ? "triple" : "triples"}
        </p>
      </div>
    </div>
  );
}
