/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/dashboard/Dashboard.tsx
 *
 * Responsabilidade:
 * Compor as principais seções do painel de um clã,
 * incluindo apresentação geral, estatísticas, guerra atual
 * e lista completa de membros.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/08/2026
 * ==========================================================
 */

import { getLocale } from "next-intl/server";

import { ClanMembers } from "@/components/clan/ClanMembers";
import { clans } from "@/config/clans";

import type { Clan, ClanMember } from "@/types/clan";
import type { ClanMemberWithPlayer } from "@/types/player";
import type { CurrentWarResult } from "@/types/war";

import { ClanHeader } from "./ClanHeader";
import { Hero } from "./Hero";
import { StatsOverview } from "./StatsOverview";
import { WarOverview } from "./WarOverview";

/**
 * Propriedades recebidas pelo painel principal.
 */
type DashboardProps = {
  /**
   * Dados completos do clã atualmente selecionado.
   */
  clan: Clan;

  /**
   * Lista de membros enriquecida com os dados
   * individuais retornados pela Player API.
   */
  members: ClanMemberWithPlayer<ClanMember>[];

  /**
   * Resultado da consulta da guerra atual.
   */
  currentWar: CurrentWarResult;
};

/**
 * Renderiza o painel principal do clã selecionado.
 *
 * O componente também monta o endereço correto da Sala
 * de Guerra com base no idioma e na tag do clã atual.
 */
export async function Dashboard({ clan, members, currentWar }: DashboardProps) {
  /**
   * Recupera o idioma atualmente utilizado pela aplicação.
   *
   * Exemplos:
   * pt-BR
   * en
   * es
   */
  const locale = await getLocale();

  /**
   * Localiza no catálogo central a configuração
   * correspondente ao clã carregado pela API.
   *
   * A comparação é feita pela tag oficial, que é única.
   */
  const clanConfig = Object.values(clans).find(
    (configuredClan) => configuredClan.tag === clan.tag,
  );

  /**
   * Utiliza o K.O.D. como fallback defensivo caso a tag
   * retornada pela API não esteja cadastrada no catálogo.
   */
  const clanSlug = clanConfig?.slug ?? clans.kod.slug;

  /**
   * Endereço localizado da Sala de Guerra do clã atual.
   *
   * Exemplos:
   * /pt-BR/war/kod
   * /pt-BR/war/kod-rec
   */
  const warRoomHref = `/${locale}/war/${clanSlug}`;

  return (
    <>
      {/*
       * Apresentação principal do clã.
       */}
      <Hero clan={clan} warRoomHref={warRoomHref} />

      {/*
       * Informações gerais e identidade do clã.
       */}
      <ClanHeader clan={clan} />

      {/*
       * Resumo das principais estatísticas.
       */}
      <StatsOverview clan={clan} />

      {/*
       * Prévia da guerra atual.
       *
       * O botão agora respeita o clã selecionado.
       */}
      <WarOverview result={currentWar} warRoomHref={warRoomHref} />

      {/*
       * Lista completa de jogadores do clã.
       */}
      <ClanMembers members={members} clanName={clan.name} />
    </>
  );
}
