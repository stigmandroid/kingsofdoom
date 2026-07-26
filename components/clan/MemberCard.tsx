/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/clan/MemberCard.tsx
 *
 * Responsabilidade:
 * Apresentar as principais informações de um jogador,
 * combinando dados resumidos do clã com os dados detalhados
 * do endpoint individual.
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

import { RoleBadge } from "./RoleBadge";
import { TownHallBadge } from "./TownHallBadge";

type MemberCardProps = {
  /**
   * Dados resumidos do membro e dados detalhados do jogador.
   */
  data: ClanMemberWithPlayer<ClanMember>;
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
export function MemberCard({ data }: MemberCardProps) {
  /**
   * Facilita o acesso aos dois objetos sem misturar suas
   * respectivas responsabilidades.
   */
  const { member, player } = data;

  /**
   * O endpoint individual possui prioridade para a liga.
   *
   * Caso a consulta individual tenha falhado, utilizamos
   * a liga resumida do endpoint do clã como fallback.
   */
  const leagueName = player?.leagueTier?.name ?? member.league?.name;

  /**
   * Seleciona o melhor ícone disponível.
   */
  const leagueIconUrl =
    player?.leagueTier?.iconUrls?.large ??
    player?.leagueTier?.iconUrls?.medium ??
    player?.leagueTier?.iconUrls?.small ??
    member.league?.iconUrls?.medium ??
    member.league?.iconUrls?.small ??
    member.league?.iconUrls?.tiny;

  /**
   * Evita apresentar "Unranked" quando não houver uma liga
   * válida disponível.
   */
  const shouldShowLeague =
    Boolean(leagueName) && leagueName?.toLowerCase() !== "unranked";

  /**
   * Melhor resultado do jogador no sistema ranqueado atual.
   *
   * Não utilizamos `bestTrophies`, pois esse campo representa
   * o recorde histórico do sistema legado.
   */
  const bestRankedTrophies = player?.legendStatistics?.bestSeason?.trophies;

  /**
   * Melhor colocação global associada à melhor temporada.
   */
  const bestRankedPosition = player?.legendStatistics?.bestSeason?.rank;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-slate-900 hover:shadow-2xl hover:shadow-black/30">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent transition duration-300 group-hover:via-amber-400/70" />

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

      {shouldShowLeague && leagueName && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5">
          {leagueIconUrl ? (
            <img
              src={leagueIconUrl}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 object-contain"
            />
          ) : (
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
              {leagueName}
            </p>
          </div>
        </div>
      )}

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

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-500">
        <span>
          Nível de experiência{" "}
          <strong className="font-semibold text-slate-300">
            {member.expLevel}
          </strong>
        </span>

        <span className="text-right">
          Melhor marca{" "}
          <strong className="font-semibold text-slate-300">
            {typeof bestRankedTrophies === "number"
              ? numberFormatter.format(bestRankedTrophies)
              : "—"}
          </strong>
          {typeof bestRankedPosition === "number" && (
            <small className="ml-1 text-[10px] text-slate-500">
              (#{numberFormatter.format(bestRankedPosition)})
            </small>
          )}
        </span>
      </footer>
    </article>
  );
}
