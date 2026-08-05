/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlAttackOverview.tsx
 *
 * Responsabilidade:
 * Exibir os jogadores que já realizaram seu ataque e
 * aqueles que ainda possuem ataque pendente na guerra
 * atual da CWL.
 *
 * Também apresenta as informações básicas do alvo
 * atingido por cada ataque.
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

import type { WarMember } from "@/types/war";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlAttackOverviewProps = {
  /**
   * Nome do clã acompanhado.
   */
  clanName: string;

  /**
   * Jogadores do clã atacante.
   */
  members: WarMember[];

  /**
   * Jogadores do clã adversário.
   *
   * Usado para localizar o alvo pelo defenderTag.
   */
  opponentMembers: WarMember[];
};

/**
 * Renderiza o acompanhamento ofensivo de um dos clãs.
 */
export function CwlAttackOverview({
  clanName,
  members,
  opponentMembers,
}: CwlAttackOverviewProps) {
  /**
   * Mantém os jogadores organizados pela posição
   * ocupada no mapa da guerra.
   */
  const orderedMembers = [...members].sort(
    (firstMember, secondMember) =>
      firstMember.mapPosition - secondMember.mapPosition,
  );

  /**
   * Um jogador é considerado como tendo atacado quando
   * possui ao menos um ataque registrado pela Clash API.
   */
  const membersWhoAttacked = orderedMembers.filter(
    (member) => (member.attacks?.length ?? 0) > 0,
  );

  /**
   * Jogadores sem ataque registrado permanecem pendentes.
   */
  const pendingMembers = orderedMembers.filter(
    (member) => (member.attacks?.length ?? 0) === 0,
  );

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
      <div className="border-b border-slate-800 p-6 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-400">
          Acompanhamento ofensivo
        </p>

        <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2
              translate="no"
              className="notranslate text-2xl font-black text-white"
            >
              Ataques de {clanName}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Consulte quem já atacou, o alvo escolhido e quem ainda precisa
              realizar seu ataque.
            </p>
          </div>

          <div className="flex gap-3">
            <AttackOverviewMetric
              label="Realizados"
              value={membersWhoAttacked.length}
              variant="completed"
            />

            <AttackOverviewMetric
              label="Pendentes"
              value={pendingMembers.length}
              variant="pending"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-slate-800 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Já atacaram
            </h3>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
              {membersWhoAttacked.length}
            </span>
          </div>

          {membersWhoAttacked.length > 0 ? (
            <div className="mt-5 space-y-3">
              {membersWhoAttacked.map((member) => (
                <AttackOverviewMember
                  key={member.tag}
                  member={member}
                  opponentMembers={opponentMembers}
                  completed
                />
              ))}
            </div>
          ) : (
            <EmptyOverviewState message="Nenhum jogador realizou seu ataque até o momento." />
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Aguardando ataque
            </h3>

            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
              {pendingMembers.length}
            </span>
          </div>

          {pendingMembers.length > 0 ? (
            <div className="mt-5 space-y-2">
              {pendingMembers.map((member) => (
                <AttackOverviewMember
                  key={member.tag}
                  member={member}
                  opponentMembers={opponentMembers}
                  completed={false}
                />
              ))}
            </div>
          ) : (
            <EmptyOverviewState message="Todos os jogadores já realizaram seus ataques." />
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Propriedades das métricas do cabeçalho.
 */
type AttackOverviewMetricProps = {
  label: string;
  value: number;
  variant: "completed" | "pending";
};

/**
 * Exibe uma métrica resumida.
 */
function AttackOverviewMetric({
  label,
  value,
  variant,
}: AttackOverviewMetricProps) {
  const variantClasses =
    variant === "completed"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300";

  return (
    <div
      className={`min-w-24 rounded-xl border px-4 py-3 text-center ${variantClasses}`}
    >
      <p className="text-2xl font-black">{value}</p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

/**
 * Propriedades da linha de jogador.
 */
type AttackOverviewMemberProps = {
  member: WarMember;
  opponentMembers: WarMember[];
  completed: boolean;
};

/**
 * Exibe um jogador, seu ataque e o alvo atingido.
 */
/**
 * Exibe um jogador, o resultado do ataque
 * e as informações básicas do alvo.
 */
function AttackOverviewMember({
  member,
  opponentMembers,
  completed,
}: AttackOverviewMemberProps) {
  /**
   * Na CWL cada jogador normalmente possui apenas
   * um ataque por guerra.
   */
  const attack = member.attacks?.[0];

  /**
   * Localiza o alvo utilizando a defenderTag
   * registrada no ataque.
   */
  const defender = attack
    ? opponentMembers.find(
        (opponentMember) => opponentMember.tag === attack.defenderTag,
      )
    : undefined;

  return (
    <article
      className={`rounded-xl border px-4 py-3 ${
        completed
          ? "border-emerald-400/15 bg-emerald-400/5"
          : "border-amber-400/15 bg-amber-400/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${
              completed
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/20 bg-amber-400/10 text-amber-300"
            }`}
          >
            {completed ? "✓" : formatMapPosition(member.mapPosition)}
          </span>

          <div className="min-w-0">
            <p
              translate="no"
              className="notranslate truncate text-sm font-black text-white"
            >
              #{formatMapPosition(member.mapPosition)} {member.name}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              TH{member.townhallLevel}
            </p>
          </div>
        </div>

        {completed && attack ? (
          <div className="shrink-0 text-right">
            <p
              aria-label={`${attack.stars} estrelas`}
              className="whitespace-nowrap text-sm font-black text-amber-300"
            >
              {"★".repeat(attack.stars)}
              {"☆".repeat(Math.max(3 - attack.stars, 0))}
            </p>

            <p className="mt-1 text-xs font-black text-slate-400">
              {formatPercentage(attack.destructionPercentage)}
            </p>
          </div>
        ) : (
          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-amber-300">
            Pendente
          </span>
        )}
      </div>

      {completed && attack && (
        <div className="mt-3 border-t border-emerald-400/10 pt-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
            Alvo atacado
          </p>

          {defender ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  translate="no"
                  className="notranslate truncate text-sm font-black text-slate-300"
                >
                  #{formatMapPosition(defender.mapPosition)} {defender.name}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  TH{defender.townhallLevel}
                </p>
              </div>

              <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[10px] font-black text-slate-400">
                Base #{formatMapPosition(defender.mapPosition)}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Alvo não localizado.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

/**
 * Propriedades do estado vazio.
 */
type EmptyOverviewStateProps = {
  message: string;
};

/**
 * Exibe uma mensagem quando uma lista estiver vazia.
 */
function EmptyOverviewState({ message }: EmptyOverviewStateProps) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center">
      <p className="text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}

/**
 * Padroniza a posição do mapa com dois dígitos.
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
