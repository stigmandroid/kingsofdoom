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
 * A ordenação é realizada neste componente para manter o
 * MemberCard responsável apenas pela apresentação visual.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { ClanMember } from "@/types/clan";

import { MemberCard } from "./MemberCard";

type ClanMembersProps = {
  /**
   * Lista de membros retornada pela Clash of Clans API.
   */
  members: ClanMember[];

  /**
   * Nome do clã utilizado no título acessível da seção.
   */
  clanName: string;
};

/**
 * Renderiza a seção completa de membros do clã.
 */
export function ClanMembers({ members, clanName }: ClanMembersProps) {
  /**
   * Cria uma cópia da lista antes de ordenar.
   *
   * Array.sort modifica o array original. O uso de spread
   * impede que os dados recebidos pelas props sejam alterados.
   *
   * Os membros são ordenados pela posição atual dentro do clã.
   */
  const sortedMembers = [...members].sort(
    (firstMember, secondMember) => firstMember.clanRank - secondMember.clanRank,
  );

  return (
    /**
     * A seção utiliza:
     *
     * mx-auto:
     * Centraliza horizontalmente o conteúdo.
     *
     * w-full:
     * Permite que a seção utilize a largura disponível.
     *
     * max-w-[1600px]:
     * Impede que os cards fiquem excessivamente largos em
     * monitores grandes.
     *
     * px-4 sm:px-6 lg:px-8:
     * Adiciona espaçamento lateral progressivo conforme o
     * tamanho da tela.
     */
    <section
      aria-labelledby="clan-members-title"
      className="mx-auto mt-10 w-full max-w-[1600px] px-4 sm:px-6 lg:px-8"
    >
      <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Formação do clã
          </p>

          <h2
            id="clan-members-title"
            className="mt-2 text-2xl font-bold text-white sm:text-3xl"
          >
            Membros
          </h2>

          <p className="mt-2 text-sm text-slate-400">
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

        {/*
         * A quantidade exibida utiliza o tamanho real da lista,
         * evitando divergência caso a API retorne dados parciais.
         */}
        <div className="w-fit rounded-xl border border-slate-800 bg-slate-900 px-4 py-2">
          <span className="text-sm text-slate-400">
            Total:{" "}
            <strong className="text-white">{sortedMembers.length}</strong>
          </span>
        </div>
      </header>

      {sortedMembers.length > 0 ? (
        /**
         * O grid adapta a quantidade de colunas conforme a tela:
         *
         * mobile:
         * Uma coluna.
         *
         * tablet:
         * Duas colunas.
         *
         * desktop:
         * Três colunas.
         */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedMembers.map((member) => (
            <MemberCard key={member.tag} member={member} />
          ))}
        </div>
      ) : (
        /**
         * Estado vazio apresentado caso a API não retorne
         * membros para o clã.
         */
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
