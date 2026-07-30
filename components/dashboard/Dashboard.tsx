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
 * 26/07/2026
 * ==========================================================
 */

import { ClanMembers } from "@/components/clan/ClanMembers";

import type { Clan, ClanMember } from "@/types/clan";
import type { ClanMemberWithPlayer } from "@/types/player";
import type { CurrentWarResult } from "@/types/war";

import { ClanHeader } from "./ClanHeader";
import { WarOverview } from "./WarOverview";
import { Hero } from "./Hero";
import { StatsOverview } from "./StatsOverview";

/**
 * Propriedades recebidas pelo painel principal.
 */
type DashboardProps = {
  /**
   * Dados completos do clã atualmente selecionado.
   */
  clan: Clan;

  /**
   * Lista de membros combinando:
   *
   * • os dados resumidos retornados pelo endpoint do clã;
   * • os dados detalhados retornados pelo endpoint individual
   *   de cada jogador.
   *
   * Essa lista é utilizada pela seção de membros para exibir
   * corretamente a liga atual e o histórico ranqueado.
   */
  members: ClanMemberWithPlayer<ClanMember>[];

  /**
   * Resultado da consulta da guerra atual.
   */
  currentWar: CurrentWarResult;
};

/**
 * Renderiza o painel principal de um clã.
 *
 * Cada seção recebe apenas os dados necessários para cumprir
 * sua própria responsabilidade.
 */
export function Dashboard({ clan, members, currentWar }: DashboardProps) {
  return (
    <>
      {/*
       * Apresentação principal do clã.
       */}
      <Hero clan={clan} />

      {/*
       * Informações gerais e identidade do clã.
       */}
      <ClanHeader clan={clan} />

      {/*
       * Resumo das principais estatísticas.
       */}
      <StatsOverview clan={clan} />

      {/*
       * Prévia da guerra atual ou estado correspondente.
       */}
      <WarOverview result={currentWar} />

      {/*
       * Lista completa de jogadores do clã.
       *
       * Aqui utilizamos a lista enriquecida com os dados
       * individuais dos jogadores, em vez de clan.memberList.
       */}
      <ClanMembers members={members} clanName={clan.name} />
    </>
  );
}
