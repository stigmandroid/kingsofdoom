export type ClanBadgeUrls = {
  small: string;
  medium: string;
  large: string;
};

export type ClanLeague = {
  id: number;
  name: string;
  iconUrls?: {
    small?: string;
    tiny?: string;
    medium?: string;
  };
};

export type Clan = {
  tag: string;
  name: string;
  description?: string;
  clanLevel: number;
  clanPoints: number;
  clanBuilderBasePoints?: number;
  members: number;
  warWins?: number;
  warWinStreak?: number;
  warTies?: number;
  warLosses?: number;
  isWarLogPublic?: boolean;
  warFrequency?: string;
  requiredTrophies?: number;
  badgeUrls: ClanBadgeUrls;
  warLeague?: ClanLeague;
};