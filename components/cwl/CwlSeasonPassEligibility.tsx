/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlSeasonPassEligibility.tsx
 *
 * Responsabilidade:
 * Exibir temporariamente os jogadores elegíveis ao
 * sorteio do Passe de Temporada da CWL.
 *
 * Objetivo:
 * Validar a regra de elegibilidade antes da implementação
 * do evento automático de sorteio.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CwlRoundWar } from "./CwlRounds";

import {
  calculateSeasonPassEligibility,
  type SeasonPassEligiblePlayer,
} from "@/lib/cwl/calculate-season-pass-eligibility";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlSeasonPassEligibilityProps = {
  wars: CwlRoundWar[];
  clanTag: string;
};

/**
 * Exibe a lista atual de jogadores elegíveis.
 *
 * Esta implementação é temporária e será substituída
 * posteriormente pelo evento oficial do Passe.
 */
export function CwlSeasonPassEligibility({
  wars,
  clanTag,
}: CwlSeasonPassEligibilityProps) {
  const eligiblePlayers = calculateSeasonPassEligibility(wars, clanTag);

  return (
    <section className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-400">
            Passe de Temporada
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Jogadores elegíveis
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Participam do sorteio os jogadores que disputaram pelo menos 3
            guerras, utilizaram todos os ataques disponíveis e conquistaram 3
            estrelas com 100% de destruição em todos eles.
          </p>
        </div>

        <div className="mt-8">
          {eligiblePlayers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {eligiblePlayers.map((player) => (
                <EligiblePlayerCard key={player.tag} player={player} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
              <p className="font-black text-white">
                Nenhum jogador elegível até o momento
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                A elegibilidade será atualizada conforme as guerras da CWL forem
                encerradas.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Propriedades do card de jogador elegível.
 */
type EligiblePlayerCardProps = {
  player: SeasonPassEligiblePlayer;
};

/**
 * Exibe os dados consolidados de um jogador elegível.
 */
function EligiblePlayerCard({ player }: EligiblePlayerCardProps) {
  return (
    <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
      <p translate="no" className="notranslate truncate font-black text-white">
        {player.name}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-600">{player.tag}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="Guerras" value={player.warsPlayed} />

        <Metric
          label="Ataques"
          value={`${player.attacksUsed}/${player.attacksAvailable}`}
        />

        <Metric label="Estrelas" value={player.stars} />

        <Metric label="Destruição" value={`${player.destruction}%`} />
      </div>

      <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
          100% de aproveitamento
        </p>
      </div>
    </article>
  );
}

/**
 * Propriedades de uma métrica resumida.
 */
type MetricProps = {
  label: string;
  value: string | number;
};

/**
 * Exibe uma pequena métrica dentro do card.
 */
function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}
