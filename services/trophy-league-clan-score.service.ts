/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/trophy-league-clan-score.service.ts
 *
 * Responsabilidade:
 * Calcular e validar a pontuação da Liga de Troféus do clã
 * utilizando os snapshots mais recentes persistidos.
 *
 * A regra atualmente validada empiricamente considera:
 *
 * • o peso individual calculado pela liga atual;
 * • ordenação decrescente por contribuição;
 * • somente os 30 jogadores de maior peso;
 * • comparação com o clanPoints oficial da Clash API.
 *
 * Objetivos:
 *
 * • reproduzir o Clan Score oficial;
 * • identificar divergências futuras na fórmula;
 * • permitir ranking interno por contribuição;
 * • informar quais jogadores entram no Top 30;
 * • sustentar futuras simulações de crescimento do clã.
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

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

/**
 * Snapshot mais recente utilizado no cálculo do clã.
 */
export type TrophyLeagueClanScorePlayer = {
  playerTag: string;
  playerName: string;

  leagueTierName: string | null;

  trophies: number;

  baseScore: number;

  estimatedClanContribution: number;

  contributionRank: number;

  countsTowardClanScore: boolean;
};

/**
 * Resultado completo do cálculo de Clan Score.
 */
export type TrophyLeagueClanScoreResult = {
  clanTag: string;

  players: TrophyLeagueClanScorePlayer[];

  totalPlayers: number;

  countedPlayers: number;

  calculatedClanScore: number;
};

/**
 * Estrutura bruta retornada pelo SQLite.
 */
type TrophyLeagueClanScoreRow = {
  player_tag: string;
  player_name: string;

  league_tier_name: string | null;

  trophies: number;

  base_score: number;

  estimated_clan_contribution: number;
};

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

/**
 * Quantidade de jogadores atualmente identificada como
 * relevante para a composição do Clan Score.
 *
 * Essa regra foi validada empiricamente comparando:
 *
 * K.O.D.
 * cálculo Top 30: 147.500
 * Clash API:      147.500
 *
 * K.O.D.rec
 * cálculo Top 30: 125.750
 * Clash API:      125.750
 */
const CLAN_SCORE_PLAYER_LIMIT = 30;

/**
 * ==========================================================
 * SNAPSHOTS MAIS RECENTES
 * ==========================================================
 */

/**
 * Recupera o snapshot mais recente de cada jogador
 * associado ao clã informado.
 *
 * A consulta evita utilizar snapshots antigos do mesmo
 * jogador dentro do cálculo atual.
 */
function getLatestClanSnapshots(clanTag: string): TrophyLeagueClanScoreRow[] {
  return database
    .prepare(
      `
      SELECT
        s.player_tag,
        s.player_name,

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
    .all(clanTag) as TrophyLeagueClanScoreRow[];
}

/**
 * ==========================================================
 * CÁLCULO DO CLAN SCORE
 * ==========================================================
 */

/**
 * Calcula a pontuação estimada atual do clã.
 *
 * Somente os 30 jogadores de maior contribuição entram
 * na soma utilizada para reproduzir o clanPoints oficial.
 */
export function calculateTrophyLeagueClanScore(
  clanTag: string,
): TrophyLeagueClanScoreResult {
  const rows = getLatestClanSnapshots(clanTag);

  const players = rows.map((row, index): TrophyLeagueClanScorePlayer => {
    const contributionRank = index + 1;

    const countsTowardClanScore = contributionRank <= CLAN_SCORE_PLAYER_LIMIT;

    return {
      playerTag: row.player_tag,

      playerName: row.player_name,

      leagueTierName: row.league_tier_name,

      trophies: row.trophies,

      baseScore: row.base_score,

      estimatedClanContribution: row.estimated_clan_contribution,

      contributionRank,

      countsTowardClanScore,
    };
  });

  const countedPlayers = players.filter(
    (player) => player.countsTowardClanScore,
  );

  const calculatedClanScore = countedPlayers.reduce(
    (total, player) => total + player.estimatedClanContribution,
    0,
  );

  return {
    clanTag,

    players,

    totalPlayers: players.length,

    countedPlayers: countedPlayers.length,

    calculatedClanScore,
  };
}

/**
 * ==========================================================
 * VALIDAÇÃO CONTRA A CLASH API
 * ==========================================================
 */

/**
 * Compara o cálculo interno com o clanPoints oficial.
 *
 * Essa validação é importante porque a regra atual foi
 * descoberta empiricamente.
 *
 * Caso a Supercell altere pesos ou quantidade de jogadores
 * considerados, a diferença passará a ser detectada.
 */
export function validateTrophyLeagueClanScore({
  clanTag,
  officialClanPoints,
}: {
  clanTag: string;
  officialClanPoints: number;
}) {
  const result = calculateTrophyLeagueClanScore(clanTag);

  const difference = officialClanPoints - result.calculatedClanScore;

  return {
    ...result,

    officialClanPoints,

    difference,

    matchesOfficialScore: difference === 0,
  };
}
