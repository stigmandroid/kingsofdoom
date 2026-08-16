/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/dashboard/Dashboard.tsx
 *
 * Responsabilidade:
 * Compor as principais seções do painel de um clã,
 * incluindo apresentação geral, estatísticas e guerra atual.
 *
 * A listagem completa de membros deixa de fazer parte
 * do Dashboard e passa a pertencer ao módulo dedicado
 * de Membros.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.8.7
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { getLocale } from "next-intl/server";

import { clans } from "@/config/clans";

import type { Clan } from "@/types/clan";
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
   * Resultado da consulta da guerra atual.
   */
  currentWar: CurrentWarResult;
};

/**
 * Renderiza o painel principal do clã selecionado.
 *
 * O componente monta o endereço correto da Sala de Guerra
 * com base no idioma e na configuração do clã atual.
 */
export async function Dashboard({ clan, currentWar }: DashboardProps) {
  /**
   * Recupera o idioma atualmente utilizado pela aplicação.
   *
   * Exemplos:
   *
   * pt-BR
   * en
   * es
   */
  const locale = await getLocale();

  /**
   * Localiza no catálogo central a configuração
   * correspondente ao clã carregado pela API.
   *
   * A comparação utiliza a tag oficial do clã.
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
   * Endereço localizado da Sala de Guerra.
   *
   * Exemplos:
   *
   * /pt-BR/war/kod
   * /pt-BR/war/kod-rec
   */
  const warRoomHref = `/${locale}/war/${clanSlug}`;

  return (
    <>
      {/**
       * ======================================================
       * APRESENTAÇÃO
       * ======================================================
       */}

      <Hero clan={clan} warRoomHref={warRoomHref} />

      {/**
       * ======================================================
       * IDENTIDADE E INFORMAÇÕES DO CLÃ
       * ======================================================
       */}

      <ClanHeader clan={clan} />

      {/**
       * ======================================================
       * INDICADORES PRINCIPAIS
       * ======================================================
       */}

      <StatsOverview clan={clan} />

      {/**
       * ======================================================
       * GUERRA ATUAL
       * ======================================================
       *
       * O Dashboard mantém somente uma visão resumida
       * do confronto atual.
       *
       * A Sala de Guerra completa continua disponível
       * através do botão do próprio componente.
       */}

      <WarOverview result={currentWar} warRoomHref={warRoomHref} />

      {/**
       * ======================================================
       * PRÓXIMA EVOLUÇÃO DO DASHBOARD
       * ======================================================
       *
       * O espaço anteriormente ocupado pela lista completa
       * de membros ficará disponível para novos blocos
       * resumidos do Command Center.
       *
       * Exemplos futuros:
       *
       * - resumo da composição do clã;
       * - distribuição por Centro de Vila;
       * - atividade dos membros;
       * - destaques recentes;
       * - atalhos para Membros, CWL, Guerra e eventos;
       * - Raid Weekend;
       * - Jogos do Clã.
       *
       * A implementação será feita posteriormente para
       * evitar acoplamento entre o Dashboard e módulos
       * especializados.
       */}
    </>
  );
}
