/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlAttackStatus.tsx
 *
 * Responsabilidade:
 * Exibir quem já realizou o ataque e quem ainda possui
 * ataque pendente no confronto do clã selecionado.
 *
 * Funcionalidades:
 *
 * - Identifica o lado correspondente ao clã selecionado;
 * - considera somente os jogadores escalados na guerra;
 * - separa jogadores que atacaram e jogadores pendentes;
 * - apresenta estrelas e destruição dos ataques realizados;
 * - calcula o progresso total dos ataques;
 * - mantém os jogadores ordenados pela posição no mapa;
 * - funciona durante preparação, batalha e guerra encerrada.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 04/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CurrentWar, WarAttack, WarMember } from "@/types/war";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlAttackStatusProps = {
  /**
   * Guerra da CWL atualmente apresentada.
   */
  war: CurrentWar;

  /**
   * Tag do clã selecionado no portal.
   */
  highlightedClanTag: string;
};

/**
 * Representa um jogador e os resultados acumulados
 * de seus ataques na guerra.
 */
type CwlMemberAttackStatus = {
  member: WarMember;
  attacks: WarAttack[];
  attacksUsed: number;
  attacksRemaining: number;
  stars: number;
  destruction: number;
};

/**
 * Exibe o acompanhamento individual dos ataques
 * do clã selecionado na guerra da CWL.
 */
export function CwlAttackStatus({
  war,
  highlightedClanTag,
}: CwlAttackStatusProps) {
  /**
   * Identifica se o clã selecionado aparece como
   * clan ou opponent no retorno da Clash API.
   */
  const selectedWarClan =
    war.clan?.tag === highlightedClanTag
      ? war.clan
      : war.opponent?.tag === highlightedClanTag
        ? war.opponent
        : undefined;

  /**
   * Evita renderizar informações incorretas quando
   * o clã selecionado não participar deste confronto.
   */
  if (!selectedWarClan) {
    return null;
  }

  /**
   * Na CWL cada participante normalmente possui um ataque.
   *
   * Mantemos o valor vindo da API para que o componente
   * continue reutilizável caso a regra seja diferente.
   */
  const attacksPerMember = war.attacksPerMember ?? 1;

  /**
   * Organiza os jogadores pela posição no mapa e calcula
   * o status individual de seus ataques.
   */
  const memberStatuses = [...selectedWarClan.members]
    .sort(
      (firstMember, secondMember) =>
        firstMember.mapPosition - secondMember.mapPosition,
    )
    .map((member): CwlMemberAttackStatus => {
      const attacks = member.attacks ?? [];
      const attacksUsed = attacks.length;

      return {
        member,
        attacks,
        attacksUsed,
        attacksRemaining: Math.max(attacksPerMember - attacksUsed, 0),
        stars: attacks.reduce((total, attack) => total + attack.stars, 0),
        destruction: attacks.reduce(
          (total, attack) => total + attack.destructionPercentage,
          0,
        ),
      };
    });

  /**
   * Separa jogadores com ataque realizado
   * e jogadores que ainda possuem ataques.
   */
  const playersWhoAttacked = memberStatuses.filter(
    (status) => status.attacksUsed > 0,
  );

  const playersWithPendingAttacks = memberStatuses.filter(
    (status) => status.attacksRemaining > 0,
  );

  /**
   * Totais gerais do confronto.
   */
  const totalAvailableAttacks = memberStatuses.length * attacksPerMember;

  const totalAttacksUsed = memberStatuses.reduce(
    (total, status) => total + status.attacksUsed,
    0,
  );

  const totalPendingAttacks = Math.max(
    totalAvailableAttacks - totalAttacksUsed,
    0,
  );

  const progressPercentage =
    totalAvailableAttacks > 0
      ? (totalAttacksUsed / totalAvailableAttacks) * 100
      : 0;

  const isPreparation = war.state === "preparation";
  const isWarEnded = war.state === "warEnded";

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
      {/*
       * Cabeçalho e resumo geral dos ataques.
       */}
      <div className="border-b border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              Status dos ataques
            </p>

            <h4
              translate="no"
              className="notranslate mt-2 text-xl font-black text-white"
            >
              {selectedWarClan.name}
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              {isPreparation
                ? "Escalação confirmada. Os ataques serão liberados quando a batalha começar."
                : isWarEnded
                  ? "Relatório final dos ataques realizados nesta guerra."
                  : "Acompanhamento atualizado dos jogadores escalados nesta rodada."}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-2xl font-black text-white">
              {totalAttacksUsed}/{totalAvailableAttacks}
            </p>

            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
              ataques realizados
            </p>
          </div>
        </div>

        {/*
         * Barra de progresso dos ataques.
         */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-4 text-xs font-bold">
            <span className="text-slate-500">Progresso da rodada</span>

            <span
              className={
                totalPendingAttacks === 0
                  ? "text-emerald-300"
                  : "text-amber-300"
              }
            >
              {totalPendingAttacks === 0
                ? "Todos os ataques realizados"
                : `${totalPendingAttacks} pendente${
                    totalPendingAttacks === 1 ? "" : "s"
                  }`}
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-[width] duration-500"
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/*
       * Durante a preparação, todos aparecem como escalados,
       * sem classificá-los incorretamente como pendentes.
       */}
      {isPreparation ? (
        <div className="p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Jogadores escalados
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {memberStatuses.map(({ member }) => (
              <CwlPreparationMember key={member.tag} member={member} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2">
          {/*
           * Jogadores que já atacaram.
           */}
          <div className="border-b border-slate-800 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Já atacaram
              </p>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-black text-emerald-300">
                {playersWhoAttacked.length}
              </span>
            </div>

            {playersWhoAttacked.length > 0 ? (
              <div className="mt-4 space-y-2">
                {playersWhoAttacked.map((status) => (
                  <CwlCompletedAttackMember
                    key={status.member.tag}
                    status={status}
                  />
                ))}
              </div>
            ) : (
              <CwlEmptyAttackList message="Nenhum jogador realizou ataques até o momento." />
            )}
          </div>

          {/*
           * Jogadores que ainda possuem ataque.
           */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                Ainda não atacaram
              </p>

              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-black text-amber-300">
                {playersWithPendingAttacks.length}
              </span>
            </div>

            {playersWithPendingAttacks.length > 0 ? (
              <div className="mt-4 space-y-2">
                {playersWithPendingAttacks.map((status) => (
                  <CwlPendingAttackMember
                    key={status.member.tag}
                    status={status}
                  />
                ))}
              </div>
            ) : (
              <CwlEmptyAttackList message="Todos os jogadores concluíram seus ataques." />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Propriedades de um jogador durante a preparação.
 */
type CwlPreparationMemberProps = {
  member: WarMember;
};

/**
 * Exibe um jogador escalado antes do início da guerra.
 */
function CwlPreparationMember({ member }: CwlPreparationMemberProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-black text-slate-300">
          #{formatMapPosition(member.mapPosition)}
        </span>

        <div className="min-w-0">
          <p
            translate="no"
            className="notranslate truncate text-sm font-black text-white"
          >
            {member.name}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-slate-600">
            TH{member.townhallLevel}
          </p>
        </div>
      </div>

      <span className="shrink-0 text-xs font-bold text-slate-500">
        Escalado
      </span>
    </article>
  );
}

/**
 * Propriedades do jogador que já atacou.
 */
type CwlCompletedAttackMemberProps = {
  status: CwlMemberAttackStatus;
};

/**
 * Exibe o resultado ofensivo de um jogador.
 */
function CwlCompletedAttackMember({ status }: CwlCompletedAttackMemberProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-xs font-black text-emerald-300">
          ✓
        </span>

        <div className="min-w-0">
          <p
            translate="no"
            className="notranslate truncate text-sm font-black text-white"
          >
            #{formatMapPosition(status.member.mapPosition)} {status.member.name}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-slate-600">
            TH{status.member.townhallLevel}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          aria-label={`${status.stars} estrelas`}
          className="whitespace-nowrap text-sm font-black text-amber-300"
        >
          {"★".repeat(status.stars)}
          {"☆".repeat(Math.max(0, 3 - status.stars))}
        </p>

        <p className="mt-1 text-xs font-black text-slate-400">
          {formatPercentage(status.destruction)}
        </p>
      </div>
    </article>
  );
}

/**
 * Propriedades do jogador com ataque pendente.
 */
type CwlPendingAttackMemberProps = {
  status: CwlMemberAttackStatus;
};

/**
 * Exibe um jogador que ainda possui ataque.
 */
function CwlPendingAttackMember({ status }: CwlPendingAttackMemberProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-xs font-black text-amber-300">
          ○
        </span>

        <div className="min-w-0">
          <p
            translate="no"
            className="notranslate truncate text-sm font-black text-white"
          >
            #{formatMapPosition(status.member.mapPosition)} {status.member.name}
          </p>

          <p className="mt-0.5 text-xs font-semibold text-slate-600">
            TH{status.member.townhallLevel}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
        Pendente
      </span>
    </article>
  );
}

/**
 * Propriedades do estado vazio de uma lista.
 */
type CwlEmptyAttackListProps = {
  message: string;
};

/**
 * Exibe uma mensagem quando determinada lista
 * não possui jogadores.
 */
function CwlEmptyAttackList({ message }: CwlEmptyAttackListProps) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-5 text-center">
      <p className="text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}

/**
 * Padroniza a posição no mapa com dois dígitos.
 *
 * Exemplos:
 * 1  → 01
 * 9  → 09
 * 15 → 15
 */
function formatMapPosition(position: number): string {
  return String(position).padStart(2, "0");
}

/**
 * Formata a porcentagem de destruição.
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2).replace(".", ",")}%`;
}
