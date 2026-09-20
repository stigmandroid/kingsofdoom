/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/build-cwl-player-history.ts
 *
 * Responsabilidade:
 * Construir o histórico competitivo consolidado de jogadores
 * a partir das temporadas CWL arquivadas de K.O.D. e K.O.D.rec.
 *
 * Funcionalidades:
 *
 * - consultar temporadas CWL arquivadas;
 * - consolidar jogadores pela player tag;
 * - preservar o histórico mesmo quando o jogador muda de clã;
 * - separar métricas por temporada;
 * - identificar automaticamente a temporada mais recente;
 * - calcular métricas consolidadas de carreira na CWL;
 * - reconstruir CV e contexto dos ataques pelas guerras arquivadas.
 *
 * Regras:
 *
 * - player tag é a identidade permanente do jogador;
 * - K.O.D. e K.O.D.rec formam um único histórico competitivo;
 * - o clã representa contexto da temporada, não identidade;
 * - somente ataques do clã acompanhado são contabilizados;
 * - guerras dos adversários presentes no archive não alimentam
 *   o histórico dos nossos jogadores;
 * - este módulo não determina elegibilidade;
 * - este módulo não calcula ranking;
 * - este módulo não seleciona titulares ou reservas;
 * - guerras normais não são processadas neste módulo.
 *
 * Arquitetura:
 *
 * CWL Archive
 *      ↓
 * Histórico por temporada
 *      ↓
 * Histórico consolidado do jogador  ← este módulo
 *      ↓
 * Elegibilidade
 *      ↓
 * Ranking
 *      ↓
 * Alocação K.O.D. / K.O.D.rec
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 19/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * 🚧 Base histórica da CWL Intelligence
 * ==========================================================
 */

import {
  getCwlArchiveSeasons,
  getCwlPostSeasonSummary,
} from "../../../services/cwl-archive.service";

import type { CurrentWar } from "../../../types/war";

import {
  calculateCwlPlayerMetrics,
  type CwlAttackSample,
  type CwlPlayerMetrics,
} from "./calculate-cwl-player-score";

const CWL_INTELLIGENCE_CLANS = [
  {
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },
  {
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
] as const;

type CwlIntelligenceClan = (typeof CWL_INTELLIGENCE_CLANS)[number];

type ArchivedCwlWar = {
  warTag: string;
  roundIndex: number;
  war: CurrentWar;
};

type MutableSeasonHistory = {
  season: string;
  clanTag: string;
  clanName: string;

  playerTag: string;
  playerName: string;
  townHallLevel: number | null;

  warsPlayed: number;
  attacksExpected: number;
  attacks: CwlAttackSample[];
};

type MutablePlayerHistory = {
  playerTag: string;
  playerName: string;
  townHallLevel: number | null;

  seasons: Map<string, MutableSeasonHistory>;
};

export type CwlPlayerSeasonHistory = {
  season: string;

  clanTag: string;
  clanName: string;

  metrics: CwlPlayerMetrics;
};

export type CwlPlayerHistory = {
  playerTag: string;
  playerName: string;
  townHallLevel: number | null;

  seasonsPlayed: number;

  /**
   * Histórico completo disponível, em ordem cronológica.
   */
  seasons: CwlPlayerSeasonHistory[];

  /**
   * Temporada mais recente em que o jogador participou.
   */
  latestSeason: CwlPlayerSeasonHistory;

  /**
   * Métricas calculadas sobre todas as temporadas
   * CWL disponíveis para o jogador.
   */
  career: CwlPlayerMetrics;
};

function getTrackedAndOpposingSides(war: CurrentWar, trackedClanTag: string) {
  if (war.clan?.tag === trackedClanTag) {
    return {
      trackedSide: war.clan,
      opposingSide: war.opponent ?? null,
    };
  }

  if (war.opponent?.tag === trackedClanTag) {
    return {
      trackedSide: war.opponent,
      opposingSide: war.clan ?? null,
    };
  }

  return {
    trackedSide: null,
    opposingSide: null,
  };
}

function collectPlayerAttacksFromWars({
  wars,
  trackedClanTag,
  playerTag,
}: {
  wars: ArchivedCwlWar[];
  trackedClanTag: string;
  playerTag: string;
}): {
  townHallLevel: number | null;
  attacks: CwlAttackSample[];
} {
  let townHallLevel: number | null = null;

  const attacks: CwlAttackSample[] = [];

  for (const { war } of wars) {
    const { trackedSide, opposingSide } = getTrackedAndOpposingSides(
      war,
      trackedClanTag,
    );

    if (!trackedSide) {
      continue;
    }

    const member = trackedSide.members?.find(
      (candidate) => candidate.tag === playerTag,
    );

    if (!member) {
      continue;
    }

    if (member.townhallLevel != null) {
      townHallLevel = member.townhallLevel;
    }

    for (const attack of member.attacks ?? []) {
      const defender = opposingSide?.members?.find(
        (candidate) => candidate.tag === attack.defenderTag,
      );

      const attackerTownHall = member.townhallLevel ?? null;

      const defenderTownHall = defender?.townhallLevel ?? null;

      attacks.push({
        stars: attack.stars,

        destruction: attack.destructionPercentage,

        attackerTownHall,
        defenderTownHall,

        townHallDifference:
          attackerTownHall != null && defenderTownHall != null
            ? attackerTownHall - defenderTownHall
            : null,
      });
    }
  }

  return {
    townHallLevel,
    attacks,
  };
}

function buildSeasonMetrics(season: MutableSeasonHistory): CwlPlayerMetrics {
  return calculateCwlPlayerMetrics({
    playerTag: season.playerTag,
    playerName: season.playerName,
    townHallLevel: season.townHallLevel,

    warsPlayed: season.warsPlayed,
    attacksExpected: season.attacksExpected,
    attacks: season.attacks,
  });
}

function buildCareerMetrics(player: MutablePlayerHistory): CwlPlayerMetrics {
  const seasons = [...player.seasons.values()];

  const warsPlayed = seasons.reduce(
    (total, season) => total + season.warsPlayed,
    0,
  );

  const attacksExpected = seasons.reduce(
    (total, season) => total + season.attacksExpected,
    0,
  );

  const attacks = seasons.flatMap((season) => season.attacks);

  return calculateCwlPlayerMetrics({
    playerTag: player.playerTag,
    playerName: player.playerName,
    townHallLevel: player.townHallLevel,

    warsPlayed,
    attacksExpected,
    attacks,
  });
}

/**
 * Constrói o histórico CWL consolidado de todos os jogadores
 * encontrados nos archives dos clãs acompanhados.
 *
 * A mesma player tag é preservada como uma única identidade,
 * mesmo que o jogador tenha disputado temporadas por clãs
 * diferentes.
 */
export function buildCwlPlayerHistory(): CwlPlayerHistory[] {
  const players = new Map<string, MutablePlayerHistory>();

  for (const clan of CWL_INTELLIGENCE_CLANS) {
    const seasons = getCwlArchiveSeasons(clan.tag);

    for (const seasonItem of seasons) {
      const summary = getCwlPostSeasonSummary({
        trackedClanTag: clan.tag,
        season: seasonItem.season,
      });

      if (!summary) {
        continue;
      }

      const wars = summary.wars as ArchivedCwlWar[];

      for (const player of summary.players) {
        const seasonKey = `${seasonItem.season}:${clan.tag}`;

        const { townHallLevel, attacks } = collectPlayerAttacksFromWars({
          wars,
          trackedClanTag: clan.tag,
          playerTag: player.tag,
        });

        let history = players.get(player.tag);

        if (!history) {
          history = {
            playerTag: player.tag,
            playerName: player.name,
            townHallLevel,
            seasons: new Map(),
          };

          players.set(player.tag, history);
        }

        history.playerName = player.name;

        if (townHallLevel != null) {
          history.townHallLevel = townHallLevel;
        }

        history.seasons.set(seasonKey, {
          season: seasonItem.season,

          clanTag: clan.tag,
          clanName: clan.name,

          playerTag: player.tag,
          playerName: player.name,
          townHallLevel,

          warsPlayed: player.warsPlayed,

          attacksExpected: player.attacksAvailable,

          attacks,
        });
      }
    }
  }

  return [...players.values()]
    .map((player) => {
      const seasons = [...player.seasons.values()]
        .sort((a, b) => a.season.localeCompare(b.season))
        .map<CwlPlayerSeasonHistory>((season) => ({
          season: season.season,

          clanTag: season.clanTag,
          clanName: season.clanName,

          metrics: buildSeasonMetrics(season),
        }));

      const latestSeason = seasons.at(-1);

      if (!latestSeason) {
        return null;
      }

      return {
        playerTag: player.playerTag,
        playerName: player.playerName,
        townHallLevel: player.townHallLevel,

        seasonsPlayed: seasons.length,

        seasons,

        latestSeason,

        career: buildCareerMetrics(player),
      } satisfies CwlPlayerHistory;
    })
    .filter((player): player is CwlPlayerHistory => player !== null);
}
