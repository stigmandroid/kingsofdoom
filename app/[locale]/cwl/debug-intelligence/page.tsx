/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cwl/debug-intelligence/page.tsx
 *
 * Responsabilidade:
 * Página interna de auditoria da inteligência competitiva
 * da CWL.
 *
 * Objetivo:
 * Permitir validar visualmente a classificação e os fatores
 * contextuais antes da integração definitiva ao dashboard.
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

import { CwlPlayerContextCard } from "@/components/cwl/CwlPlayerContextCard";
import { getCwlIntelligenceRanking } from "@/services/cwl-intelligence.service";

type DebugIntelligencePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function DebugIntelligencePage({
  params,
}: DebugIntelligencePageProps) {
  await params;

  const players = getCwlIntelligenceRanking();

  const eligiblePlayers = players.filter(
    (player) => player.eligibility.status === "eligible",
  );

  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ====================================================
            CABEÇALHO
            ==================================================== */}

        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Kings of Doom Command Center
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                CWL Intelligence
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Auditoria da classificação contextual dos jogadores elegíveis
                para a composição competitiva da CWL.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <p className="text-xs text-white/40">Jogadores elegíveis</p>

              <p className="mt-1 text-2xl font-bold text-white">
                {eligiblePlayers.length}
              </p>
            </div>
          </div>
        </header>

        {/* ====================================================
            AVISO DE AUDITORIA
            ==================================================== */}

        <section className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
          <h2 className="text-sm font-semibold text-amber-200">
            Página de auditoria
          </h2>

          <p className="mt-2 max-w-4xl text-xs leading-6 text-white/55">
            Esta página existe para validar a inteligência antes de sua
            integração à escalação oficial da CWL. Os dados abaixo mostram tanto
            o desempenho bruto quanto o contexto dos ataques utilizados na
            classificação.
          </p>
        </section>

        {/* ====================================================
            RESUMO
            ==================================================== */}

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs text-white/40">Jogadores no ranking</p>

            <p className="mt-1 text-2xl font-bold">{players.length}</p>
          </div>

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-white/40">Elegíveis</p>

            <p className="mt-1 text-2xl font-bold text-emerald-300">
              {eligiblePlayers.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs text-white/40">Vagas titulares</p>

            <p className="mt-1 text-2xl font-bold">30</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs text-white/40">Vagas reservas</p>

            <p className="mt-1 text-2xl font-bold">6</p>
          </div>
        </section>

        {/* ====================================================
            RANKING
            ==================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Ranking contextual</h2>

            <p className="mt-1 text-xs text-white/45">
              Cada card apresenta os fatores utilizados para compreender a
              posição competitiva do jogador.
            </p>
          </div>

          <div className="space-y-5">
            {players.map((player) => (
              <CwlPlayerContextCard key={player.playerTag} player={player} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
