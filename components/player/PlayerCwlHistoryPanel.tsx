/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/PlayerCwlHistoryPanel.tsx
 *
 * Responsabilidade:
 * Apresentar o histórico individual de CWL do jogador
 * utilizando os dados persistidos no CWL Archive.
 *
 * Métricas:
 *
 * • temporadas participadas;
 * • guerras disputadas;
 * • ataques realizados;
 * • estrelas;
 * • média de estrelas;
 * • destruição média;
 * • triples;
 * • taxa de triples;
 * • distribuição dos resultados;
 * • últimas rodadas registradas.
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

import type { PlayerCwlHistorySummary } from "@/services/player-cwl-history.service";

type PlayerCwlHistoryPanelProps = {
  history: PlayerCwlHistorySummary | null;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function PlayerCwlHistoryPanel({ history }: PlayerCwlHistoryPanelProps) {
  if (!history || history.seasonsParticipated === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">
          CWL
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          Desempenho na CWL
        </h3>

        <p className="mt-2 text-sm leading-5 text-slate-400">
          Ainda não há participação em CWL persistida para este jogador.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-400">
          CWL
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">Desempenho na CWL</h3>

          <div className="shrink-0 rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1">
            <span className="text-[10px] font-black text-white">
              {numberFormatter.format(history.seasonsParticipated)}
            </span>

            <span className="ml-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">
              {history.seasonsParticipated === 1 ? "temporada" : "temporadas"}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm leading-5 text-slate-400">
          Histórico individual reconstruído a partir das temporadas persistidas
          pelo Command Center.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <CwlMetric
          label="Guerras"
          value={numberFormatter.format(history.warsPlayed)}
        />

        <CwlMetric
          label="Ataques"
          value={numberFormatter.format(history.attacksUsed)}
        />

        <CwlMetric
          label="Estrelas"
          value={numberFormatter.format(history.stars)}
        />

        <CwlMetric
          label="Média de estrelas"
          value={history.averageStars.toFixed(2)}
        />

        <CwlMetric
          label="Destruição média"
          value={`${history.averageDestruction.toFixed(1)}%`}
        />

        <CwlMetric
          label="Triple rate"
          value={`${history.tripleRate.toFixed(1)}%`}
          accent
        />
      </div>

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

      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
            Rodadas recentes
          </p>

          <p className="text-[9px] font-bold text-slate-600">
            Últimas {Math.min(history.seasons[0]?.wars.length ?? 0, 3)}
          </p>
        </div>

        <div className="mt-3 space-y-2">
          {(history.seasons[0]?.wars ?? []).slice(0, 3).map((war) => (
            <CwlHistoryRow
              key={war.warId}
              roundIndex={war.roundIndex}
              opponentName={war.opponentName}
              stars={war.stars}
              averageDestruction={war.averageDestruction}
              triples={war.triples}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CwlMetric({
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
          accent ? "text-sky-300" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

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

function CwlHistoryRow({
  roundIndex,
  opponentName,
  stars,
  averageDestruction,
  triples,
}: {
  roundIndex: number;
  opponentName: string;
  stars: number;
  averageDestruction: number;
  triples: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/45 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-white">
          Rodada {roundIndex + 1} · vs. {opponentName}
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          {stars} estrelas · {averageDestruction.toFixed(1)}%
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-black text-sky-300">
          {triples} {triples === 1 ? "triple" : "triples"}
        </p>
      </div>
    </div>
  );
}
