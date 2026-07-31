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

type DashboardProps = {
  clan: Clan;
  members: ClanMemberWithPlayer<ClanMember>[];
  currentWar: CurrentWarResult;
};

export function Dashboard({ clan, members, currentWar }: DashboardProps) {
  return (
    <>
      <Hero clan={clan} />

      <ClanHeader clan={clan} />

      <StatsOverview clan={clan} />

      <WarOverview result={currentWar} />

      <ClanMembers members={members} clanName={clan.name} />
    </>
  );
}
