/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/trophy-league-audit.mjs
 *
 * Responsabilidade:
 * Auditar a relação entre os snapshots persistidos da
 * Liga de Troféus e o Clan Score oficial dos clãs.
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
 * identificar empiricamente como a contribuição individual
 * das ligas se relaciona com a pontuação geral do clã.
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

import { DatabaseSync } from "node:sqlite";

/**
 * ==========================================================
 * CONFIGURAÇÃO
 * ==========================================================
 */

const database = new DatabaseSync("data/kings-of-doom.sqlite");

/**
 * Pontuações oficiais atuais.
 *
 * Preencheremos esses valores com os dados retornados
 * pela Clash API antes da comparação final.
 */
const clans = [
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
 * SNAPSHOTS MAIS RECENTES
 * ==========================================================
 */

function getLatestClanSnapshots(clanTag) {
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
    .all(clanTag);
}

/**
 * ==========================================================
 * SOMAS
 * ==========================================================
 */

function sumContribution(players) {
  return players.reduce(
    (total, player) => total + Number(player.estimated_clan_contribution ?? 0),
    0,
  );
}

function sumTop(players, amount) {
  return sumContribution(players.slice(0, amount));
}

/**
 * ==========================================================
 * AUDITORIA
 * ==========================================================
 */

function auditClan(clanConfig) {
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

  console.log("");

  console.table([
    {
      cenário: "Top 10",
      pesoCalculado: top10,
    },
    {
      cenário: "Top 20",
      pesoCalculado: top20,
    },
    {
      cenário: "Top 30",
      pesoCalculado: top30,
    },
    {
      cenário: "Top 40",
      pesoCalculado: top40,
    },
    {
      cenário: "Todos",
      pesoCalculado: total,
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

for (const clan of clans) {
  auditClan(clan);
}

database.close();
