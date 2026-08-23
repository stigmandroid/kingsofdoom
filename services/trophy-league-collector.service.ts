/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/trophy-league-collector.service.ts
 *
 * Responsabilidade:
 * Coletar snapshots da Liga de Troféus para todos os membros
 * dos clãs acompanhados pelo Command Center.
 *
 * Fluxo:
 *
 * clã
 *  ↓
 * memberList
 *  ↓
 * Player API de cada membro
 *  ↓
 * captureTrophyLeagueSnapshot()
 *  ↓
 * snapshot salvo somente quando houver mudança
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { getClan } from "@/services/clan.service";
import { getPlayer } from "@/services/player.service";
import { captureTrophyLeagueSnapshot } from "@/services/trophy-league-snapshot.service";

type TrophyLeagueCollectorClan = {
  tag: string;
  name: string;
};

export type TrophyLeagueCollectorResult = {
  clanTag: string;
  clanName: string;

  membersProcessed: number;
  snapshotsSaved: number;
  snapshotsUnchanged: number;
  errors: number;
};

export type TrophyLeagueCollectorSummary = {
  startedAt: string;
  finishedAt: string;

  clans: TrophyLeagueCollectorResult[];

  totalMembersProcessed: number;
  totalSnapshotsSaved: number;
  totalSnapshotsUnchanged: number;
  totalErrors: number;
};

/**
 * Pequena pausa entre consultas individuais.
 *
 * Isso evita disparar muitas requisições simultâneas contra
 * a Clash API e deixa o coletor mais previsível.
 */
function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Coleta todos os membros de um único clã.
 */
async function collectClanTrophyLeagueSnapshots(
  clanConfig: TrophyLeagueCollectorClan,
): Promise<TrophyLeagueCollectorResult> {
  const result: TrophyLeagueCollectorResult = {
    clanTag: clanConfig.tag,
    clanName: clanConfig.name,

    membersProcessed: 0,
    snapshotsSaved: 0,
    snapshotsUnchanged: 0,
    errors: 0,
  };

  const clan = await getClan(clanConfig.tag);

  for (const member of clan.memberList) {
    try {
      const player = await getPlayer(member.tag);

      const captureResult = captureTrophyLeagueSnapshot(player, {
        trackedClanTag: clanConfig.tag,

        trackedClanName: clanConfig.name,
      });

      result.membersProcessed += 1;

      if (captureResult.saved) {
        result.snapshotsSaved += 1;
      } else {
        result.snapshotsUnchanged += 1;
      }
    } catch (error) {
      result.errors += 1;

      console.error("[TROPHY LEAGUE COLLECTOR] Erro ao processar jogador", {
        clanTag: clanConfig.tag,
        clanName: clanConfig.name,

        playerTag: member.tag,
        playerName: member.name,

        error,
      });
    }

    /**
     * Intervalo curto entre jogadores.
     *
     * Pode ser ajustado posteriormente caso seja necessário.
     */
    await sleep(150);
  }

  return result;
}

/**
 * Executa a coleta para uma lista de clãs.
 */
export async function collectTrophyLeagueSnapshots(
  clans: TrophyLeagueCollectorClan[],
): Promise<TrophyLeagueCollectorSummary> {
  const startedAt = new Date().toISOString();

  const clanResults: TrophyLeagueCollectorResult[] = [];

  for (const clan of clans) {
    try {
      const result = await collectClanTrophyLeagueSnapshots(clan);

      clanResults.push(result);
    } catch (error) {
      console.error("[TROPHY LEAGUE COLLECTOR] Erro ao processar clã", {
        clan,
        error,
      });

      clanResults.push({
        clanTag: clan.tag,
        clanName: clan.name,

        membersProcessed: 0,
        snapshotsSaved: 0,
        snapshotsUnchanged: 0,
        errors: 1,
      });
    }
  }

  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,

    clans: clanResults,

    totalMembersProcessed: clanResults.reduce(
      (total, clan) => total + clan.membersProcessed,
      0,
    ),

    totalSnapshotsSaved: clanResults.reduce(
      (total, clan) => total + clan.snapshotsSaved,
      0,
    ),

    totalSnapshotsUnchanged: clanResults.reduce(
      (total, clan) => total + clan.snapshotsUnchanged,
      0,
    ),

    totalErrors: clanResults.reduce((total, clan) => total + clan.errors, 0),
  };
}
