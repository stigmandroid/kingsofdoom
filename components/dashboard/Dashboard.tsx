import type { Clan } from "@/types/clan";
import type { CurrentWarResult } from "@/types/war";
import { ClanHeader } from "./ClanHeader";
import { CurrentWarPreview } from "./CurrentWarPreview";
import { Hero } from "./Hero";
import { StatsOverview } from "./StatsOverview";

type DashboardProps = {
  clan: Clan;
  currentWar: CurrentWarResult;
};

export function Dashboard({ clan, currentWar }: DashboardProps) {
  return (
    <>
      <Hero clan={clan} />

      <ClanHeader clan={clan} />

      <StatsOverview clan={clan} />

      <CurrentWarPreview result={currentWar} />
    </>
  );
}
