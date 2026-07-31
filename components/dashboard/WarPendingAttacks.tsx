/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * WarPendingAttacks.tsx
 *
 * Responsabilidade:
 * Exibir quais jogadores ainda possuem ataques
 * disponíveis na guerra atual.
 *
 * Autor:
 * stigmandroid
 * ==========================================================
 */

import type { CurrentWarResult, WarMember } from "@/types/war";

type WarPendingAttacksProps = {
  result: CurrentWarResult;
};

export function WarPendingAttacks({ result }: WarPendingAttacksProps) {
  /**
   * Não existe guerra disponível.
   */
  if (!result.available) {
    return null;
  }

  const war = result.war;

  /**
   * Segurança contra dados incompletos.
   */
  if (!war.clan) {
    return null;
  }

  /**
   * Quantidade máxima de ataques por jogador.
   *
   * A API normalmente retorna 2.
   */
  const attacksPerMember = war.attacksPerMember ?? 2;

  /**
   * Jogadores separados por situação.
   */
  const completed: WarMember[] = [];
  const oneRemaining: WarMember[] = [];
  const twoRemaining: WarMember[] = [];

  for (const member of war.clan.members) {
    const attacksUsed = member.attacks?.length ?? 0;

    const remaining = attacksPerMember - attacksUsed;

    if (remaining <= 0) {
      completed.push(member);
    } else if (remaining === 1) {
      oneRemaining.push(member);
    } else {
      twoRemaining.push(member);
    }
  }

  /**
   * Ordena pela posição do mapa.
   */
  const sortMembers = (a: WarMember, b: WarMember) =>
    a.mapPosition - b.mapPosition;

  completed.sort(sortMembers);
  oneRemaining.sort(sortMembers);
  twoRemaining.sort(sortMembers);

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-red-400">
            Sala de Guerra
          </p>

          <h2 className="mt-4 text-3xl font-black">Pendências</h2>

          <p className="mt-3 text-slate-400">
            Identifique rapidamente quem ainda possui ataques disponíveis.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <PendingColumn
              emoji="🟢"
              title={`Concluído (${completed.length})`}
              members={completed}
            />

            <PendingColumn
              emoji="🟡"
              title={`1 ataque restante (${oneRemaining.length})`}
              members={oneRemaining}
            />

            <PendingColumn
              emoji="🔴"
              title={`2 ataques restantes (${twoRemaining.length})`}
              members={twoRemaining}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type PendingColumnProps = {
  emoji: string;
  title: string;
  members: WarMember[];
};

function PendingColumn({ emoji, title, members }: PendingColumnProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <h3 className="font-black text-lg">
        {emoji} {title}
      </h3>

      <div className="mt-5 space-y-2">
        {members.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum jogador.</p>
        )}

        {members.map((member) => (
          <div
            key={member.tag}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
          >
            <span className="font-semibold">#{member.mapPosition}</span>

            <span className="flex-1 px-3">{member.name}</span>

            <span className="rounded bg-slate-800 px-2 py-1 text-xs">
              TH{member.townhallLevel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
