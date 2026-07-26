/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/clan/MemberCard.tsx
 *
 * Responsabilidade:
 * Apresentar as principais informações de um único jogador
 * pertencente ao clã.
 *
 * Este componente não realiza chamadas à API e não altera
 * a ordenação dos membros. Ele apenas apresenta os dados
 * recebidos por meio das propriedades.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { ClanMember } from "@/types/clan";

import { RoleBadge } from "./RoleBadge";
import { TownHallBadge } from "./TownHallBadge";

type MemberCardProps = {
  /**
   * Dados completos do jogador apresentado no card.
   */
  member: ClanMember;
};

/**
 * Formata números utilizando a convenção brasileira.
 *
 * Exemplo:
 * 12345 será apresentado como 12.345.
 */
const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * Renderiza o card individual de um membro do clã.
 */
export function MemberCard({ member }: MemberCardProps) {
  /**
   * Seleciona o melhor ícone de liga disponível.
   *
   * A API pode retornar tamanhos diferentes dependendo
   * do objeto recebido. Por isso utilizamos uma sequência
   * de fallback.
   */
  const leagueIconUrl =
    member.league?.iconUrls?.medium ??
    member.league?.iconUrls?.small ??
    member.league?.iconUrls?.tiny;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-black/30">
      {/*
       * Linha decorativa exibida no topo do card.
       *
       * Ela ganha destaque durante o hover e reforça
       * a identidade visual dourada do portal.
       */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent transition duration-300 group-hover:via-amber-400/70" />

      {/*
       * Cabeçalho principal do card.
       */}
      <header className="flex items-start gap-4">
        <TownHallBadge level={member.townHallLevel} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                translate="no"
                className="notranslate truncate text-base font-bold text-white sm:text-lg"
              >
                {member.name}
              </h3>

              <p
                translate="no"
                className="notranslate mt-0.5 text-xs font-medium text-slate-500"
              >
                {member.tag}
              </p>
            </div>

            {/*
             * Posição atual do jogador dentro do clã.
             */}
            <span
              aria-label={`Posição ${member.clanRank} no clã`}
              className="shrink-0 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-slate-300"
            >
              #{member.clanRank}
            </span>
          </div>

          <div className="mt-3">
            <RoleBadge role={member.role} />
          </div>
        </div>
      </header>

      {/*
       * Informações da liga atual do jogador.
       *
       * A seção é exibida apenas quando a API retorna
       * uma liga associada ao membro.
       */}
      {member.league && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5">
          {leagueIconUrl ? (
            /*
             * Utilizamos uma imagem HTML comum neste momento
             * para evitar a necessidade de configurar domínios
             * remotos no next.config.
             *
             * Posteriormente podemos migrar para next/image.
             */
            <img
              src={leagueIconUrl}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 object-contain"
            />
          ) : (
            /*
             * Estado visual de fallback caso a liga não possua
             * um ícone disponível.
             */
            <div
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-lg"
            >
              🏆
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Liga atual
            </p>

            <p className="truncate text-sm font-semibold text-slate-200">
              {member.league.name}
            </p>
          </div>
        </div>
      )}

      {/*
       * Indicadores principais do jogador.
       */}
      <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
        <div className="px-2 py-3 text-center sm:px-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            Troféus
          </dt>

          <dd className="mt-1 text-sm font-bold text-amber-300 sm:text-base">
            {numberFormatter.format(member.trophies)}
          </dd>
        </div>

        <div className="px-2 py-3 text-center sm:px-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            Doações
          </dt>

          <dd className="mt-1 text-sm font-bold text-emerald-300 sm:text-base">
            {numberFormatter.format(member.donations)}
          </dd>
        </div>

        <div className="px-2 py-3 text-center sm:px-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            Recebidas
          </dt>

          <dd className="mt-1 text-sm font-bold text-sky-300 sm:text-base">
            {numberFormatter.format(member.donationsReceived)}
          </dd>
        </div>
      </dl>

      {/*
       * Rodapé com informações secundárias.
       */}
      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-500">
        <span>
          Nível de experiência{" "}
          <strong className="font-semibold text-slate-300">
            {member.expLevel}
          </strong>
        </span>

        <span>
          Melhor marca{" "}
          <strong className="font-semibold text-slate-300">
            {numberFormatter.format(member.bestTrophies)}
          </strong>
        </span>
      </footer>
    </article>
  );
}
