/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/clan/ClanMembers.tsx
 *
 * Responsabilidade:
 * Organizar e apresentar a lista completa de membros de
 * um clã em formato de grid responsivo.
 *
 * Cada item combina:
 * • dados resumidos do endpoint do clã;
 * • dados detalhados do endpoint do jogador.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { ClanMember } from "@/types/clan";
import type { ClanMemberWithPlayer } from "@/types/player";

import { MemberCard } from "./MemberCard";

type ClanMembersProps = {
  /**
   * Lista combinada de membros e perfis individuais.
   */
  members: ClanMemberWithPlayer<ClanMember>[];

  /**
   * Nome do clã utilizado no título acessível da seção.
   */
  clanName: string;
  locale: string;
  clanSlug: string;
};

/**
 * Renderiza a seção completa de membros do clã.
 */
export function ClanMembers({
  members,
  clanName,
  locale,
  clanSlug,
}: ClanMembersProps) {
  /**
   * A ordenação utiliza o objeto resumido do membro,
   * pois `clanRank` pertence ao endpoint do clã.
   */
  const sortedMembers = [...members].sort(
    (firstMember, secondMember) =>
      firstMember.member.clanRank - secondMember.member.clanRank,
  );

  return (
    <section
      aria-label={`Membros do clã ${clanName}`}
      className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Formação atual
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Jogadores atualmente pertencentes ao{" "}
            <span
              translate="no"
              className="notranslate font-semibold text-slate-300"
            >
              {clanName}
            </span>
            .
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2">
          <span className="text-sm text-slate-400">
            <strong className="text-white">{sortedMembers.length}</strong>{" "}
            jogadores
          </span>
        </div>
      </header>

      {sortedMembers.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedMembers.map((member) => (
            <MemberCard
              key={member.member.tag}
              data={member}
              locale={locale}
              clanSlug={clanSlug}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-200">
            Nenhum membro encontrado
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            A API não retornou jogadores para este clã.
          </p>
        </div>
      )}
    </section>
  );
}
