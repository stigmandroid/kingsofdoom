import { createHash } from "node:crypto";

import {
  getWarArchiveSummary,
  upsertWarHistory,
  upsertWarHistoryAttack,
  upsertWarHistoryMember,
  type WarArchiveResultType,
} from "@/repositories/war-archive.repository";

import type { CurrentWar, WarAttack, WarMember } from "@/types/war";

export type WarArchiveResult = {
  trackedClanTag: string;
  warKey: string;
  result: WarArchiveResultType;
  wars: number;
  members: number;
  attacks: number;
};

export function archiveCurrentWar({
  war,
  trackedClanTag,
}: {
  war: CurrentWar;
  trackedClanTag: string;
}): WarArchiveResult {
  const clan = war.clan;
  const opponent = war.opponent;

  if (!clan || !opponent) {
    throw new Error(
      `[Kings of Doom] Guerra incompleta para archive. trackedClanTag=${trackedClanTag}`,
    );
  }

  const warKey = createHash("sha256")
    .update(
      [
        trackedClanTag,
        opponent.tag,
        war.preparationStartTime ?? "",
        war.startTime ?? "",
      ].join("|"),
    )
    .digest("hex");

  const result = calculateWarResult(war);

  const warId = upsertWarHistory({
    warKey,
    trackedClanTag,
    state: war.state,
    result,
    teamSize: war.teamSize,
    attacksPerMember: war.attacksPerMember,
    preparationStartTime: war.preparationStartTime,
    startTime: war.startTime,
    endTime: war.endTime,
    clanTag: clan.tag,
    clanName: clan.name,
    clanLevel: clan.clanLevel,
    clanStars: clan.stars,
    clanDestruction: clan.destructionPercentage,
    clanAttacks: clan.attacks,
    clanBadgeUrlsJson: JSON.stringify(clan.badgeUrls),
    opponentTag: opponent.tag,
    opponentName: opponent.name,
    opponentLevel: opponent.clanLevel,
    opponentStars: opponent.stars,
    opponentDestruction: opponent.destructionPercentage,
    opponentAttacks: opponent.attacks,
    opponentBadgeUrlsJson: JSON.stringify(opponent.badgeUrls),
    rawJson: JSON.stringify(war),
  });

  const allMembers = [...(clan.members ?? []), ...(opponent.members ?? [])];

  archiveMembers(warId, "clan", clan.tag, clan.members ?? [], allMembers);
  archiveMembers(
    warId,
    "opponent",
    opponent.tag,
    opponent.members ?? [],
    allMembers,
  );

  const summary = getWarArchiveSummary(trackedClanTag);

  return {
    trackedClanTag,
    warKey,
    result,
    wars: summary.wars,
    members: summary.members,
    attacks: summary.attacks,
  };
}

function archiveMembers(
  warId: number,
  side: "clan" | "opponent",
  clanTag: string,
  members: WarMember[],
  allMembers: WarMember[],
): void {
  members.forEach((member) => {
    upsertWarHistoryMember({
      warId,
      side,
      clanTag,
      playerTag: member.tag,
      playerName: member.name,
      townHallLevel: member.townhallLevel,
      mapPosition: member.mapPosition,
      opponentAttacks: member.opponentAttacks,
      bestOpponentAttackJson: member.bestOpponentAttack
        ? JSON.stringify(member.bestOpponentAttack)
        : undefined,
      rawJson: JSON.stringify(member),
    });

    (member.attacks ?? []).forEach((attack) => {
      archiveAttack(warId, attack, allMembers);
    });
  });
}

function archiveAttack(
  warId: number,
  attack: WarAttack,
  allMembers: WarMember[],
): void {
  const attacker = allMembers.find((m) => m.tag === attack.attackerTag);
  const defender = allMembers.find((m) => m.tag === attack.defenderTag);

  const attackerTownHall = attacker?.townhallLevel;
  const defenderTownHall = defender?.townhallLevel;

  const townHallDifference =
    attackerTownHall !== undefined && defenderTownHall !== undefined
      ? attackerTownHall - defenderTownHall
      : undefined;

  upsertWarHistoryAttack({
    warId,
    attackerTag: attack.attackerTag,
    defenderTag: attack.defenderTag,
    attackerTownHall,
    defenderTownHall,
    stars: attack.stars,
    destruction: attack.destructionPercentage,
    attackOrder: attack.order,
    duration: attack.duration,
    townHallDifference,
    resultType: getAttackResultType(attack.stars),
    rawJson: JSON.stringify(attack),
  });
}

function calculateWarResult(war: CurrentWar): WarArchiveResultType {
  if (war.state === "preparation") {
    return "preparation";
  }

  if (war.state !== "warEnded") {
    return "ongoing";
  }

  const clan = war.clan;
  const opponent = war.opponent;

  if (!clan || !opponent) {
    return "draw";
  }

  if (clan.stars > opponent.stars) return "win";
  if (clan.stars < opponent.stars) return "loss";

  if (clan.destructionPercentage > opponent.destructionPercentage) return "win";
  if (clan.destructionPercentage < opponent.destructionPercentage)
    return "loss";

  return "draw";
}

function getAttackResultType(stars: number) {
  switch (stars) {
    case 3:
      return "triple" as const;
    case 2:
      return "two_star" as const;
    case 1:
      return "one_star" as const;
    default:
      return "zero_star" as const;
  }
}
