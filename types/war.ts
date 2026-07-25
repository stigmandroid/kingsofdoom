export type WarState =
  | "notInWar"
  | "preparation"
  | "inWar"
  | "warEnded";

export type WarBadgeUrls = {
  small: string;
  medium: string;
  large: string;
};

export type WarClan = {
  tag: string;
  name: string;
  clanLevel: number;
  attacks: number;
  stars: number;
  destructionPercentage: number;
  badgeUrls: WarBadgeUrls;
};

export type CurrentWar = {
  state: WarState;
  teamSize?: number;
  attacksPerMember?: number;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  clan?: WarClan;
  opponent?: WarClan;
};

export type CurrentWarResult =
  | {
      available: true;
      war: CurrentWar;
    }
  | {
      available: false;
      reason: "notInWar" | "privateWarLog" | "unavailable";
    };