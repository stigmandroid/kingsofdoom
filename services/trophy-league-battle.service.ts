/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/trophy-league-battle.service.ts
 *
 * Responsabilidade:
 * Consultar e interpretar os registros reais de ataques e
 * defesas da Liga de Troféus de um jogador.
 *
 * Estratégia:
 *
 * • utiliza currentLeagueGroupTag e currentLeagueSeasonId
 *   retornados pela Player API;
 * • consulta o endpoint leagueGroup da Clash API;
 * • separa attackLogs e defenseLogs;
 * • preserva estrelas, destruição, adversário, pontos e
 *   horário da batalha;
 * • calcula totais ofensivos e defensivos da temporada.
 *
 * Fonte principal:
 *
 * /leaguegroup/{leagueGroupTag}/{seasonId}
 *   ?playerTag={playerTag}
 *
 * Esse endpoint foi escolhido como fonte principal porque
 * retorna o conjunto completo de ataques e defesas da
 * temporada observada, enquanto /players/{tag}/battlelog
 * possui uma janela limitada de eventos recentes.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { Player } from "@/types/player";

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

const DEFAULT_DEV_PROXY_BASE_URL = "https://kingsofdoom.com";

/**
 * ==========================================================
 * TIPOS DA CLASH API
 * ==========================================================
 */

/**
 * Estrutura bruta observada em attackLogs e defenseLogs.
 */
type TrophyLeagueBattleLogEntry = {
  opponentPlayerTag?: string;
  opponentName?: string;

  stars?: number;

  destructionPercentage?: number;

  trophies?: number;

  creationTime?: string;
};

/**
 * Estrutura bruta do leagueGroup utilizada pelo service.
 */
type TrophyLeagueGroupResponse = {
  attackLogs?: TrophyLeagueBattleLogEntry[];
  defenseLogs?: TrophyLeagueBattleLogEntry[];
};

/**
 * Resposta do gateway interno utilizada em desenvolvimento.
 */
type DevProxyLeagueGroupResponse = {
  success: boolean;

  data?: TrophyLeagueGroupResponse;

  error?: string;
};

/**
 * ==========================================================
 * TIPOS DE DOMÍNIO
 * ==========================================================
 */

export type TrophyLeagueBattleType = "attack" | "defense";

export type TrophyLeagueBattle = {
  type: TrophyLeagueBattleType;

  opponentPlayerTag: string | null;
  opponentName: string | null;

  stars: number;

  destructionPercentage: number;

  /**
   * Pontos associados ao evento conforme retornados pelo
   * leagueGroup.
   *
   * Em ataques:
   * representa os pontos conquistados pelo jogador.
   *
   * Em defesas:
   * representa os pontos preservados pelo defensor.
   */
  trophies: number;

  creationTime: string | null;
};

export type TrophyLeagueBattleSummary = {
  playerTag: string;
  playerName: string;

  leagueGroupTag: string;
  leagueSeasonId: number;

  attackCount: number;
  defenseCount: number;

  attackTrophies: number;
  defenseTrophies: number;

  totalBattleTrophies: number;

  attacks: TrophyLeagueBattle[];
  defenses: TrophyLeagueBattle[];
};

/**
 * ==========================================================
 * HELPERS
 * ==========================================================
 */

/**
 * Normaliza valores numéricos retornados pela API.
 */
function normalizeNumber(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

/**
 * Converte uma entrada bruta em modelo de domínio.
 */
function mapBattle(
  entry: TrophyLeagueBattleLogEntry,
  type: TrophyLeagueBattleType,
): TrophyLeagueBattle {
  return {
    type,

    opponentPlayerTag: entry.opponentPlayerTag ?? null,

    opponentName: entry.opponentName ?? null,

    stars: normalizeNumber(entry.stars),

    destructionPercentage: normalizeNumber(entry.destructionPercentage),

    trophies: normalizeNumber(entry.trophies),

    creationTime: entry.creationTime ?? null,
  };
}

/**
 * ==========================================================
 * CONSULTA DIRETA
 * ==========================================================
 */

/**
 * Consulta o leagueGroup diretamente na Clash API.
 *
 * Utilizado em produção, onde a VPS possui IP autorizado.
 */
async function getLeagueGroupDirectlyFromClash({
  playerTag,
  leagueGroupTag,
  leagueSeasonId,
}: {
  playerTag: string;
  leagueGroupTag: string;
  leagueSeasonId: number;
}): Promise<TrophyLeagueGroupResponse> {
  const token = process.env.CLASH_API_TOKEN;

  if (!token) {
    throw new Error("A variável CLASH_API_TOKEN não foi configurada.");
  }

  const path =
    `/leaguegroup/${encodeURIComponent(leagueGroupTag)}/${leagueSeasonId}` +
    `?playerTag=${encodeURIComponent(playerTag)}`;

  const response = await fetch(`${CLASH_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,

      Accept: "application/json",
    },

    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(
      body?.message ??
        body?.reason ??
        `League Group respondeu com status ${response.status}.`,
    );
  }

  return response.json() as Promise<TrophyLeagueGroupResponse>;
}

/**
 * ==========================================================
 * CONSULTA VIA GATEWAY
 * ==========================================================
 */

/**
 * Consulta o leagueGroup através da VPS quando a aplicação
 * está rodando localmente.
 *
 * O endpoint utilizado aqui será criado em seguida para
 * evitar exposição do CLASH_API_TOKEN no ambiente local.
 */
async function getLeagueGroupThroughDevProxy({
  playerTag,
  leagueGroupTag,
  leagueSeasonId,
}: {
  playerTag: string;
  leagueGroupTag: string;
  leagueSeasonId: number;
}): Promise<TrophyLeagueGroupResponse> {
  const secret = process.env.KOD_DEV_PROXY_SECRET;

  if (!secret) {
    throw new Error(
      "A variável KOD_DEV_PROXY_SECRET não foi configurada no .env.local.",
    );
  }

  const proxyBaseUrl = (
    process.env.KOD_DEV_PROXY_BASE_URL ?? DEFAULT_DEV_PROXY_BASE_URL
  ).replace(/\/+$/, "");

  const query = new URLSearchParams({
    playerTag,
    leagueGroupTag,
    leagueSeasonId: String(leagueSeasonId),
  });

  const response = await fetch(
    `${proxyBaseUrl}/api/internal/clash/trophy-league-battles?${query.toString()}`,
    {
      headers: {
        Accept: "application/json",

        "x-kod-dev-proxy-secret": secret,
      },

      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as DevProxyLeagueGroupResponse | null;

    throw new Error(
      body?.error ??
        `Gateway da Liga de Troféus respondeu com status ${response.status}.`,
    );
  }

  const data = (await response.json()) as DevProxyLeagueGroupResponse;

  if (!data.success || !data.data) {
    throw new Error(
      data.error ??
        "O gateway da Liga de Troféus retornou uma resposta inválida.",
    );
  }

  return data.data;
}

/**
 * ==========================================================
 * CONSULTA PRINCIPAL
 * ==========================================================
 */

/**
 * Recupera os ataques e defesas reais da temporada atual
 * de um jogador.
 *
 * Retorna null quando o jogador ainda não possui dados
 * suficientes de Ranked League para consulta.
 */
export async function getTrophyLeagueBattles(
  player: Player,
): Promise<TrophyLeagueBattleSummary | null> {
  const leagueGroupTag = player.currentLeagueGroupTag;

  const leagueSeasonId = player.currentLeagueSeasonId;

  /**
   * Sem grupo ou temporada não existe contexto suficiente
   * para consultar o leagueGroup.
   */
  if (!leagueGroupTag || !leagueSeasonId) {
    return null;
  }

  /**
   * ========================================================
   * ORIGEM DA CONSULTA
   * ========================================================
   */

  const leagueGroup =
    process.env.KOD_USE_DEV_PROXY === "true"
      ? await getLeagueGroupThroughDevProxy({
          playerTag: player.tag,

          leagueGroupTag,

          leagueSeasonId,
        })
      : await getLeagueGroupDirectlyFromClash({
          playerTag: player.tag,

          leagueGroupTag,

          leagueSeasonId,
        });

  /**
   * ========================================================
   * ATAQUES
   * ========================================================
   */

  const attacks = (leagueGroup.attackLogs ?? []).map((entry) =>
    mapBattle(entry, "attack"),
  );

  /**
   * ========================================================
   * DEFESAS
   * ========================================================
   */

  const defenses = (leagueGroup.defenseLogs ?? []).map((entry) =>
    mapBattle(entry, "defense"),
  );

  /**
   * ========================================================
   * TOTAIS
   * ========================================================
   */

  const attackTrophies = attacks.reduce(
    (total, battle) => total + battle.trophies,
    0,
  );

  const defenseTrophies = defenses.reduce(
    (total, battle) => total + battle.trophies,
    0,
  );

  return {
    playerTag: player.tag,

    playerName: player.name,

    leagueGroupTag,

    leagueSeasonId,

    attackCount: attacks.length,

    defenseCount: defenses.length,

    attackTrophies,

    defenseTrophies,

    totalBattleTrophies: attackTrophies + defenseTrophies,

    attacks,

    defenses,
  };
}
