/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/clan/RoleBadge.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente o cargo ocupado por um jogador
 * dentro do clã.
 *
 * A conversão dos identificadores técnicos da API para
 * textos legíveis fica centralizada neste componente.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { ClanMemberRole } from "@/types/clan";

/**
 * Define os dados necessários para cada cargo.
 *
 * O objeto Record garante que todos os valores possíveis
 * de ClanMemberRole estejam obrigatoriamente configurados.
 */
const roleConfiguration: Record<
  ClanMemberRole,
  {
    label: string;
    icon: string;
    className: string;
  }
> = {
  leader: {
    label: "Líder",
    icon: "👑",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },

  coLeader: {
    label: "Co-líder",
    icon: "⭐",
    className: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },

  admin: {
    label: "Ancião",
    icon: "◆",
    className: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },

  member: {
    label: "Membro",
    icon: "●",
    className: "border-slate-600 bg-slate-800 text-slate-300",
  },
};

type RoleBadgeProps = {
  /**
   * Identificador técnico do cargo retornado pela API.
   */
  role: ClanMemberRole;
};

/**
 * Renderiza um identificador visual para o cargo do membro.
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  /**
   * Recupera a configuração correspondente ao cargo.
   */
  const configuration = roleConfiguration[role];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${configuration.className}`}
    >
      <span aria-hidden="true">{configuration.icon}</span>

      <span>{configuration.label}</span>
    </span>
  );
}
