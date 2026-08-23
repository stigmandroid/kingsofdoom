/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/trophy-league-season-history.service.ts
 *
 * Responsabilidade:
 * Agrupar o histórico observado da Liga de Troféus por
 * temporada.
 *
 * O serviço:
 *
 * • utiliza a timeline já interpretada do jogador;
 * • separa os registros por leagueSeasonId;
 * • preserva a ordem cronológica;
 * • calcula resumo individual de cada temporada;
 * • evita misturar movimentos entre temporadas diferentes;
 * • prepara os dados para consumo direto pela interface.
 *
 * Importante:
 *
 * As movimentações representam apenas deltas observados
 * entre snapshots persistidos.
 *
 * Elas não devem ser interpretadas como battle log oficial
 * ou como registro individual confirmado de cada batalha.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import {
  getTrophyLeaguePlayerHistory,
  type TrophyLeagueTimelinePoint,
} from "@/services/trophy-league-history.service";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

/**
 * Resumo individual de uma temporada.
 */
export type TrophyLeagueSeasonHistory = {
  /**
   * Identificador retornado pela Clash API.
   *
   * Pode ser null caso o jogador esteja sem temporada
   * identificada no momento da captura.
   */
  leagueSeasonId: number | null;

  /**
   * Grupo da liga associado à temporada.
   */
  leagueGroupTag: string | null;

  /**
   * Liga observada mais recentemente dentro da temporada.
   */
  leagueTierName: string | null;

  /**
   * Quantidade de snapshots conhecidos na temporada.
   */
  totalSnapshots: number;

  /**
   * Primeiro momento observado.
   */
  firstCapturedAt: string;

  /**
   * Último momento observado.
   */
  lastCapturedAt: string;

  /**
   * Pontuação do primeiro snapshot conhecido.
   *
   * Importante:
   * isso representa o início OBSERVADO pelo Command Center,
   * e não necessariamente o início oficial da temporada.
   */
  initialObservedTrophies: number;

  /**
   * Pontuação mais recente conhecida.
   */
  currentTrophies: number;

  /**
   * Saldo observado dentro da temporada.
   */
  observedNetChange: number;

  /**
   * Quantidade de intervalos com ganho líquido.
   */
  gainsObserved: number;

  /**
   * Quantidade de intervalos com perda líquida.
   */
  lossesObserved: number;

  /**
   * Quantidade de intervalos sem alteração líquida.
   */
  unchangedObserved: number;

  /**
   * Movimentos compatíveis com possível ataque individual.
   */
  possibleAttacks: number;

  /**
   * Movimentos compatíveis com possível defesa ou saldo
   * negativo individual.
   */
  possibleDefenses: number;

  /**
   * Movimentos cuja magnitude indica intervalo agregado.
   */
  aggregateMovements: number;

  /**
   * Timeline completa da temporada.
   */
  timeline: TrophyLeagueTimelinePoint[];
};

/**
 * Resultado completo agrupado por temporadas.
 */
export type TrophyLeaguePlayerSeasonHistory = {
  playerTag: string;

  playerName: string | null;

  totalSeasons: number;

  currentSeasonId: number | null;

  seasons: TrophyLeagueSeasonHistory[];
};

/**
 * ==========================================================
 * HELPERS
 * ==========================================================
 */

/**
 * Cria uma chave estável para temporadas que ainda não
 * possuem leagueSeasonId identificado.
 */
function getSeasonKey(point: TrophyLeagueTimelinePoint): string {
  if (point.leagueSeasonId !== null) {
    return String(point.leagueSeasonId);
  }

  return "unknown";
}

/**
 * ==========================================================
 * AGRUPAMENTO
 * ==========================================================
 */

/**
 * Agrupa a timeline completa do jogador por temporada.
 */
function groupTimelineBySeason(
  timeline: TrophyLeagueTimelinePoint[],
): Map<string, TrophyLeagueTimelinePoint[]> {
  const groups = new Map<string, TrophyLeagueTimelinePoint[]>();

  for (const point of timeline) {
    const key = getSeasonKey(point);

    const existing = groups.get(key) ?? [];

    existing.push(point);

    groups.set(key, existing);
  }

  return groups;
}

/**
 * ==========================================================
 * RESUMO DE TEMPORADA
 * ==========================================================
 */

/**
 * Converte um conjunto cronológico de pontos pertencentes à
 * mesma temporada em um resumo pronto para consumo.
 */
function buildSeasonHistory(
  timeline: TrophyLeagueTimelinePoint[],
): TrophyLeagueSeasonHistory {
  const firstPoint = timeline[0];

  const lastPoint = timeline[timeline.length - 1];

  const observedNetChange = lastPoint.trophies - firstPoint.trophies;

  const gainsObserved = timeline.filter(
    (point) => point.direction === "gain",
  ).length;

  const lossesObserved = timeline.filter(
    (point) => point.direction === "loss",
  ).length;

  const unchangedObserved = timeline.filter(
    (point) => point.direction === "unchanged",
  ).length;

  const possibleAttacks = timeline.filter(
    (point) => point.eventType === "possible-attack",
  ).length;

  const possibleDefenses = timeline.filter(
    (point) => point.eventType === "possible-defense",
  ).length;

  const aggregateMovements = timeline.filter(
    (point) => point.eventType === "aggregate",
  ).length;

  return {
    leagueSeasonId: lastPoint.leagueSeasonId,

    leagueGroupTag: lastPoint.leagueGroupTag,

    leagueTierName: lastPoint.leagueTierName,

    totalSnapshots: timeline.length,

    firstCapturedAt: firstPoint.capturedAt,

    lastCapturedAt: lastPoint.capturedAt,

    initialObservedTrophies: firstPoint.trophies,

    currentTrophies: lastPoint.trophies,

    observedNetChange,

    gainsObserved,

    lossesObserved,

    unchangedObserved,

    possibleAttacks,

    possibleDefenses,

    aggregateMovements,

    timeline,
  };
}

/**
 * ==========================================================
 * HISTÓRICO AGRUPADO POR TEMPORADA
 * ==========================================================
 */

/**
 * Recupera o histórico observado do jogador agrupado por
 * temporadas.
 *
 * As temporadas mais recentes são retornadas primeiro.
 */
export function getTrophyLeaguePlayerSeasonHistory(
  playerTag: string,
): TrophyLeaguePlayerSeasonHistory {
  const history = getTrophyLeaguePlayerHistory(playerTag);

  /**
   * ========================================================
   * SEM HISTÓRICO
   * ========================================================
   */

  if (history.timeline.length === 0) {
    return {
      playerTag,

      playerName: history.playerName,

      totalSeasons: 0,

      currentSeasonId: null,

      seasons: [],
    };
  }

  /**
   * ========================================================
   * AGRUPAMENTO
   * ========================================================
   */

  const grouped = groupTimelineBySeason(history.timeline);

  const seasons = Array.from(grouped.values())
    .map(buildSeasonHistory)
    .sort((a, b) => {
      const aTime = new Date(a.lastCapturedAt).getTime();

      const bTime = new Date(b.lastCapturedAt).getTime();

      return bTime - aTime;
    });

  /**
   * ========================================================
   * TEMPORADA ATUAL
   * ========================================================
   *
   * Como as temporadas estão ordenadas da mais recente para
   * a mais antiga, o primeiro elemento representa o período
   * observado mais atual.
   */

  const currentSeason = seasons[0] ?? null;

  return {
    playerTag: history.playerTag,

    playerName: history.playerName,

    totalSeasons: seasons.length,

    currentSeasonId: currentSeason?.leagueSeasonId ?? null,

    seasons,
  };
}
