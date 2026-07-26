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

import type { Clan } from "@/types/clan";
import type { CurrentWarResult } from "@/types/war";

import { ClanMembers } from "@/components/clan/ClanMembers";

import { ClanHeader } from "./ClanHeader";
import { CurrentWarPreview } from "./CurrentWarPreview";
import { Hero } from "./Hero";
import { StatsOverview } from "./StatsOverview";

type DashboardProps = {
  /**
   * Dados completos do clã atualmente selecionado.
   */
  clan: Clan;

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
export function Dashboard({ clan, currentWar }: DashboardProps) {
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
      <CurrentWarPreview result={currentWar} />

      {/*
       * Lista completa de jogadores do clã.
       */}
      <ClanMembers members={clan.memberList} clanName={clan.name} />
    </>
  );
}
