/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * WarAttackHistory.tsx
 *
 * Responsabilidade:
 * Exibir, de forma compacta, o histórico ofensivo e
 * defensivo de um participante da guerra.
 *
 * Funcionalidades:
 *
 * - Exibe todos os ataques realizados pelo jogador;
 * - Identifica nome e posição da base atacada;
 * - Exibe estrelas, destruição e duração;
 * - Exibe todos os ataques recebidos pela base;
 * - Identifica nome e posição do atacante;
 * - Trata jogadores que ainda não atacaram;
 * - Trata bases que ainda não receberam ataques.
 *
 * Autor:
 * stigmandroid
 *
 * Versão:
 * 0.7.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { WarAttack, WarMember } from "@/types/war";

/**
 * Propriedades recebidas pelo histórico.
 */
type WarAttackHistoryProps = {
  /**
   * Jogador cujo histórico será exibido.
   */
  member: WarMember;

  /**
   * Participantes do lado adversário.
   *
   * Essa lista permite:
   *
   * - localizar os alvos atacados pelo jogador;
   * - descobrir quais adversários atacaram esta base.
   */
  enemyMembers: WarMember[];
};

/**
 * Representa um ataque recebido junto com
 * os dados do atacante.
 */
type ReceivedAttack = {
  attack: WarAttack;
  attacker: WarMember;
};

/**
 * Exibe o histórico compacto de ataques realizados
 * e recebidos por um jogador.
 */
export function WarAttackHistory({
  member,
  enemyMembers,
}: WarAttackHistoryProps) {
  /**
   * A API pode omitir attacks quando o jogador
   * ainda não utilizou nenhum ataque.
   */
  const outgoingAttacks = [...(member.attacks ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  /**
   * Percorre os ataques dos adversários para descobrir
   * quais deles tiveram este jogador como alvo.
   */
  const receivedAttacks: ReceivedAttack[] = enemyMembers
    .flatMap((attacker) =>
      (attacker.attacks ?? []).map((attack) => ({
        attack,
        attacker,
      })),
    )
    .filter(({ attack }) => attack.defenderTag === member.tag)
    .sort((a, b) => a.attack.order - b.attack.order);

  return (
    <div className="mt-5 w-full border-t border-slate-800 pt-5">
      <div className="grid gap-4 xl:grid-cols-2">
        {/*
         * Ataques realizados pelo jogador.
         */}
        <AttackSection title="Ataques realizados">
          {outgoingAttacks.length === 0 ? (
            <EmptyAttackState message="Nenhum ataque realizado" />
          ) : (
            <div className="space-y-2">
              {outgoingAttacks.map((attack) => {
                /**
                 * Localiza o jogador adversário que recebeu
                 * o ataque atual.
                 */
                const defender = enemyMembers.find(
                  (enemyMember) => enemyMember.tag === attack.defenderTag,
                );

                return (
                  <AttackHistoryRow
                    key={`${attack.order}-${attack.defenderTag}`}
                    player={defender}
                    attack={attack}
                    direction="outgoing"
                  />
                );
              })}
            </div>
          )}
        </AttackSection>

        {/*
         * Ataques recebidos pela base.
         */}
        <AttackSection title="Ataques recebidos">
          {receivedAttacks.length === 0 ? (
            <EmptyAttackState message="Base ainda não atacada" />
          ) : (
            <div className="space-y-2">
              {receivedAttacks.map(({ attack, attacker }) => (
                <AttackHistoryRow
                  key={`${attack.order}-${attack.attackerTag}`}
                  player={attacker}
                  attack={attack}
                  direction="incoming"
                />
              ))}
            </div>
          )}
        </AttackSection>
      </div>
    </div>
  );
}

/**
 * Propriedades de uma seção do histórico.
 */
type AttackSectionProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Container visual utilizado pelas áreas de
 * ataques realizados e recebidos.
 */
function AttackSection({ title, children }: AttackSectionProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h4>

      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Propriedades de uma linha individual de ataque.
 */
type AttackHistoryRowProps = {
  /**
   * Atacante ou defensor relacionado ao ataque.
   */
  player?: WarMember;

  /**
   * Resultado completo do ataque.
   */
  attack: WarAttack;

  /**
   * Define se o jogador exibido foi o alvo
   * ou o atacante.
   */
  direction: "outgoing" | "incoming";
};

/**
 * Exibe um ataque de forma compacta.
 */
function AttackHistoryRow({
  player,
  attack,
  direction,
}: AttackHistoryRowProps) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
      <span className="font-black text-slate-300">
        {player ? formatMapPosition(player.mapPosition) : "#--"}
      </span>

      <span
        translate="no"
        className="notranslate truncate text-sm font-bold text-white"
      >
        {player?.name ?? "Jogador não identificado"}
      </span>

      <span className="font-black tracking-wider text-amber-300">
        {formatStars(attack.stars)}
      </span>

      <div className="text-right">
        <p className="text-xs font-bold text-slate-300">
          {formatPercentage(attack.destructionPercentage)}
        </p>

        <p className="text-[10px] font-semibold text-slate-500">
          {formatDuration(attack.duration)}
        </p>
      </div>
    </div>
  );
}

/**
 * Mensagem utilizada quando não existem ataques.
 */
function EmptyAttackState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-800 px-3 py-4 text-center text-xs font-semibold text-slate-500">
      {message}
    </p>
  );
}

/**
 * Formata estrelas utilizando sempre três posições.
 */
function formatStars(stars: number): string {
  return `${"★".repeat(stars)}${"☆".repeat(Math.max(0, 3 - stars))}`;
}

/**
 * Formata a posição utilizando dois dígitos.
 */
function formatMapPosition(position: number): string {
  return `#${position.toString().padStart(2, "0")}`;
}

/**
 * Formata o percentual de destruição.
 */
function formatPercentage(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

/**
 * Converte segundos para minutos e segundos.
 */
function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${seconds}s`;
}
