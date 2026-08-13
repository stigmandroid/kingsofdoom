"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlPostSeasonSummary.tsx
 *
 * Responsabilidade:
 * Exibir o desempenho ofensivo dos participantes
 * da última CWL arquivada.
 *
 * Regras visuais:
 *
 * - 3 estrelas: verde;
 * - qualquer ataque não perfeito: vermelho;
 * - ataque não utilizado: vermelho;
 * - valores zerados permanecem neutros.
 *
 * ==========================================================
 */

import type {
  CwlPostSeasonPlayer,
  CwlPostSeasonSummary as CwlPostSeasonSummaryData,
} from "@/services/cwl-archive.service";

type CwlPostSeasonSummaryProps = {
  data: CwlPostSeasonSummaryData;
};

export function CwlPostSeasonSummary({ data }: CwlPostSeasonSummaryProps) {
  if (data.players.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-sky-400">
            Participantes
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Desempenho dos jogadores
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Quantidade de ataques por resultado na última CWL.
          </p>
        </div>

        {/*
         * ==========================================================
         * MOBILE
         * ==========================================================
         *
         * Não utiliza scroll horizontal.
         * Cada jogador ocupa um card próprio.
         */}
        <div className="mt-8 space-y-3 md:hidden">
          {data.players.map((player) => (
            <MobilePlayerCard key={player.tag} player={player} />
          ))}
        </div>

        {/*
         * ==========================================================
         * DESKTOP / TABLET
         * ==========================================================
         */}
        <div className="mt-10 hidden overflow-hidden rounded-2xl border border-slate-800 md:block">
          <div className="grid grid-cols-[minmax(220px,1.6fr)_90px_90px_90px_90px_110px_110px] bg-slate-900/80 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
            <span>Jogador</span>
            <span className="text-center text-amber-300">⭐⭐⭐</span>
            <span className="text-center text-amber-300">⭐⭐☆</span>
            <span className="text-center text-amber-300">⭐☆☆</span>
            <span className="text-center text-slate-500">☆☆☆</span>
            <span className="text-center">Ataques</span>
            <span className="text-center">Não usados</span>
          </div>

          <div className="divide-y divide-slate-800">
            {data.players.map((player) => (
              <div
                key={player.tag}
                className="grid grid-cols-[minmax(220px,1.6fr)_90px_90px_90px_90px_110px_110px] items-center bg-slate-950/70 px-4 py-4"
              >
                <div className="min-w-0">
                  <p
                    translate="no"
                    className="notranslate truncate font-black text-white"
                  >
                    {player.name}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {player.warsPlayed} guerra
                    {player.warsPlayed === 1 ? "" : "s"}
                  </p>
                </div>

                <AttackResult value={player.triples} kind="perfect" />
                <AttackResult value={player.twoStars} kind="failure" />
                <AttackResult value={player.oneStar} kind="failure" />
                <AttackResult value={player.zeroStars} kind="failure" />

                <span className="text-center font-black text-slate-200">
                  {player.attacksUsed}/{player.attacksAvailable}
                </span>

                <AttackResult value={player.unusedAttacks} kind="failure" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobilePlayerCard({ player }: { player: CwlPostSeasonPlayer }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="px-4 py-4">
        <p
          translate="no"
          className="notranslate break-words font-black text-white"
        >
          {player.name}
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-600">
          {player.warsPlayed} guerra
          {player.warsPlayed === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-4 border-t border-slate-800">
        <MobileMetric label="⭐⭐⭐" value={player.triples} kind="perfect" />

        <MobileMetric label="⭐⭐☆" value={player.twoStars} kind="failure" />

        <MobileMetric label="⭐☆☆" value={player.oneStar} kind="failure" />

        <MobileMetric label="☆☆☆" value={player.zeroStars} kind="failure" />
      </div>

      <div className="grid grid-cols-2 border-t border-slate-800">
        <div className="px-3 py-3 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
            Ataques
          </p>

          <p className="mt-1 text-lg font-black text-white">
            {player.attacksUsed}/{player.attacksAvailable}
          </p>
        </div>

        <div className="border-l border-slate-800 px-3 py-3 text-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
            Não usados
          </p>

          <p
            className={`mt-1 text-lg font-black ${
              player.unusedAttacks > 0 ? "text-red-400" : "text-slate-300"
            }`}
          >
            {player.unusedAttacks}
          </p>
        </div>
      </div>
    </article>
  );
}

function MobileMetric({
  label,
  value,
  kind,
}: {
  label: string;
  value: number;
  kind: "perfect" | "failure";
}) {
  return (
    <div className="border-r border-slate-800 px-1 py-3 text-center last:border-r-0">
      <p className="text-[11px] font-black tracking-tight text-amber-300">
        {label}
      </p>

      <p className={`mt-1 text-lg font-black ${getMetricColor(value, kind)}`}>
        {value}
      </p>
    </div>
  );
}

function AttackResult({
  value,
  kind,
}: {
  value: number;
  kind: "perfect" | "failure";
}) {
  return (
    <span className={`text-center font-black ${getMetricColor(value, kind)}`}>
      {value}
    </span>
  );
}

function getMetricColor(value: number, kind: "perfect" | "failure"): string {
  if (value === 0) {
    return "text-slate-300";
  }

  if (kind === "perfect") {
    return "text-emerald-400";
  }

  return "text-red-400";
}
