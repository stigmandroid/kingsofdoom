/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/trophy-league-audit.ts
 *
 * Responsabilidade:
 * Auditar a relação entre os snapshots persistidos da
 * Liga de Troféus e o Clan Score oficial retornado pela
 * Clash API.
 *
 * O diagnóstico compara:
 *
 * • soma bruta de todos os jogadores;
 * • soma dos Top 10;
 * • soma dos Top 20;
 * • soma dos Top 30;
 * • soma dos Top 40;
 * • Clan Score oficial.
 *
 * Objetivo:
 * identificar empiricamente como a pontuação individual
 * das ligas contribui para o ranking geral do clã.
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

import { database } from "@/lib/db/database";
import { getClan } from "@/services/clan.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type LatestPlayerSnapshotRow = {
  player_tag: string;
  player_name: string;

  tracked_clan_tag: string;
  tracked_clan_name: string;

  league_tier_name: string | null;

  trophies: number;

  base_score: number;

  estimated_clan_contribution: number;
};

type AuditClan = {
  tag: string;
  name: string;
};

/**
 * ==========================================================
 * CONFIGURAÇÃO
 * ==========================================================
 */

const clans: AuditClan[] = [
  {
    tag: "#2GQ2UC2PV",
    name: "K.O.D.",
  },
  {
    tag: "#2RU9QG9CG",
    name: "K.O.D.rec",
  },
];

/**
 * ==========================================================
 * CONSULTA DOS SNAPSHOTS
 * ==========================================================
 */

/**
 * Recupera apenas o snapshot mais recente de cada jogador
 * pertencente ao clã informado.
 */
function getLatestClanSnapshots(clanTag: string): LatestPlayerSnapshotRow[] {
  return database
    .prepare(
      `
      SELECT
        s.player_tag,
        s.player_name,

        s.tracked_clan_tag,
        s.tracked_clan_name,

        s.league_tier_name,

        s.trophies,

        s.base_score,

        s.estimated_clan_contribution

      FROM trophy_league_snapshots s

      INNER JOIN (
        SELECT
          player_tag,
          MAX(id) AS latest_id

        FROM trophy_league_snapshots

        WHERE tracked_clan_tag = ?

        GROUP BY player_tag
      ) latest
        ON latest.latest_id = s.id

      ORDER BY
        s.estimated_clan_contribution DESC,
        s.trophies DESC,
        s.player_name ASC
    `,
    )
    .all(clanTag) as LatestPlayerSnapshotRow[];
}

/**
 * ==========================================================
 * SOMAS
 * ==========================================================
 */

function sumContribution(players: LatestPlayerSnapshotRow[]): number {
  return players.reduce(
    (total, player) => total + player.estimated_clan_contribution,
    0,
  );
}

function sumTop(players: LatestPlayerSnapshotRow[], amount: number): number {
  return sumContribution(players.slice(0, amount));
}

/**
 * ==========================================================
 * AUDITORIA
 * ==========================================================
 */

async function auditClan(clanConfig: AuditClan): Promise<void> {
  const clan = await getClan(clanConfig.tag);

  const players = getLatestClanSnapshots(clanConfig.tag);

  const total = sumContribution(players);

  const top10 = sumTop(players, 10);

  const top20 = sumTop(players, 20);

  const top30 = sumTop(players, 30);

  const top40 = sumTop(players, 40);

  console.log("");
  console.log("============================================================");

  console.log(`${clanConfig.name} — TROPHY LEAGUE AUDIT`);

  console.log("============================================================");

  console.log("");

  console.log("Jogadores analisados:", players.length);

  console.log("Clan Score oficial:", clan.clanPoints);

  console.log("");

  console.table([
    {
      cenário: "Top 10",
      pesoCalculado: top10,
      diferença: clan.clanPoints - top10,
    },
    {
      cenário: "Top 20",
      pesoCalculado: top20,
      diferença: clan.clanPoints - top20,
    },
    {
      cenário: "Top 30",
      pesoCalculado: top30,
      diferença: clan.clanPoints - top30,
    },
    {
      cenário: "Top 40",
      pesoCalculado: top40,
      diferença: clan.clanPoints - top40,
    },
    {
      cenário: "Todos",
      pesoCalculado: total,
      diferença: clan.clanPoints - total,
    },
  ]);

  console.log("");

  console.log("Top 30 jogadores por contribuição estimada:");

  console.table(
    players.slice(0, 30).map((player, index) => ({
      posição: index + 1,

      jogador: player.player_name,

      liga: player.league_tier_name ?? "Unranked",

      troféus: player.trophies,

      base: player.base_score,

      peso: player.estimated_clan_contribution,
    })),
  );
}

/**
 * ==========================================================
 * EXECUÇÃO
 * ==========================================================
 */

async function main(): Promise<void> {
  for (const clan of clans) {
    await auditClan(clan);
  }
}

main().catch((error) => {
  console.error("[TROPHY LEAGUE AUDIT]", error);

  process.exitCode = 1;
});
