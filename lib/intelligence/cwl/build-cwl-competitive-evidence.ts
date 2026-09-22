/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/build-cwl-competitive-evidence.ts
 *
 * Responsabilidade:
 * Construir a evidência competitiva recente dos jogadores
 * utilizada pela CWL Intelligence.
 *
 * Funcionalidades:
 *
 * - consolidar ataques de CWL e guerras normais;
 * - utilizar player tag como identidade permanente;
 * - considerar uma janela móvel de 30 dias;
 * - preservar a origem de cada ataque competitivo;
 * - contabilizar ataques realizados, disponíveis e perdidos;
 * - preservar estrelas, destruição e contexto de CV;
 * - permitir avaliação de jogadores mesmo sem participação
 *   na CWL anterior;
 * - preparar os dados para a camada de elegibilidade.
 * - processar CWL e guerras normais pelo mesmo pipeline contextual;
 * - reconstruir o contexto competitivo de cada ataque;
 * - incorporar avaliação contextual individual por ataque;
 *
 * Regras:
 *
 * - CWL e guerra normal são fontes competitivas válidas;
 * - enquanto a CWL estiver na Champions, guerras normais
 *   compõem a atividade competitiva recente;
 * - somente evidências dentro dos últimos 30 dias contam;
 * - ataques de farm, amistosos e Capital não são considerados;
 * - este módulo não determina elegibilidade;
 * - este módulo não calcula ranking;
 * - este módulo não seleciona titulares ou reservas.
 *
 * Arquitetura:
 *
 * CWL Archive ───────────────┐
 *                            │
 * War History ───────────────┤
 *                            ↓
 *                  Competitive Evidence
 *                            ↓
 *                       Elegibilidade
 *                            ↓
 *                         Ranking
 *                            ↓
 *                Alocação K.O.D. / K.O.D.rec
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 21/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * 🚧 Base de evidência competitiva da CWL Intelligence
 * ==========================================================
 */

import {
  getCwlArchiveSeasons,
  getCwlPostSeasonSummary,
} from "../../../services/cwl-archive.service";

import { findRecentWarHistory } from "../../../repositories/war-history.repository";

import type { CurrentWar } from "../../../types/war";

import {
  buildCwlAttackContext,
  type CwlAttackContext,
} from "./build-cwl-attack-context";

import {
  evaluateCwlAttack,
  type CwlAttackEvaluation,
} from "./evaluate-cwl-attack";

const COMPETITIVE_WINDOW_DAYS = 30;

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

export type CompetitiveEvidenceSource = "cwl" | "regular_war";

export type CompetitiveAttackEvidence = {
  source: CompetitiveEvidenceSource;

  occurredAt: string;

  trackedClanTag: string;

  attackOrder: number;

  stars: number;
  destruction: number;

  attackerTownHall: number | null;
  attackerMapPosition: number | null;

  defenderTownHall: number | null;
  defenderMapPosition: number | null;

  townHallDifference: number | null;
  mapPositionDifference: number | null;

  context: CwlAttackContext;

  evaluation: CwlAttackEvaluation;
};

export type CompetitiveEvidenceSourceSummary = {
  attacksUsed: number;
  attacksAvailable: number;
  attacksMissed: number;
};

export type CwlCompetitiveEvidence = {
  playerTag: string;
  playerName: string | null;

  window: {
    days: number;
    from: string;
    to: string;
  };

  cwl: CompetitiveEvidenceSourceSummary;

  regularWar: CompetitiveEvidenceSourceSummary;

  total: CompetitiveEvidenceSourceSummary;

  attacks: CompetitiveAttackEvidence[];
};

type ArchivedCwlWar = {
  warTag: string;
  roundIndex: number;
  war: CurrentWar;
};

type MutableCompetitiveEvidence = {
  playerTag: string;
  playerName: string | null;

  cwl: CompetitiveEvidenceSourceSummary;

  regularWar: CompetitiveEvidenceSourceSummary;

  attacks: CompetitiveAttackEvidence[];
};

function emptySummary(): CompetitiveEvidenceSourceSummary {
  return {
    attacksUsed: 0,
    attacksAvailable: 0,
    attacksMissed: 0,
  };
}

function getWindowStart(evaluationDate: Date): Date {
  const start = new Date(evaluationDate);

  start.setUTCDate(start.getUTCDate() - COMPETITIVE_WINDOW_DAYS);

  return start;
}

function parseClashDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const compactMatch = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/,
  );

  if (compactMatch) {
    const [, year, month, day, hour, minute, second] = compactMatch;

    return new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
      ),
    );
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isInsideWindow({
  occurredAt,
  windowStart,
  evaluationDate,
}: {
  occurredAt: string | null | undefined;
  windowStart: Date;
  evaluationDate: Date;
}): boolean {
  const date = parseClashDate(occurredAt);

  if (!date) {
    return false;
  }

  return (
    date.getTime() >= windowStart.getTime() &&
    date.getTime() <= evaluationDate.getTime()
  );
}

function getWarDate(war: CurrentWar): string | null {
  return war.endTime ?? war.startTime ?? war.preparationStartTime ?? null;
}

function getTrackedSide(war: CurrentWar, trackedClanTag: string) {
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

function getOrCreatePlayer(
  players: Map<string, MutableCompetitiveEvidence>,
  playerTag: string,
  playerName: string | null,
): MutableCompetitiveEvidence {
  const existing = players.get(playerTag);

  if (existing) {
    if (playerName) {
      existing.playerName = playerName;
    }

    return existing;
  }

  const created: MutableCompetitiveEvidence = {
    playerTag,
    playerName,

    cwl: emptySummary(),
    regularWar: emptySummary(),

    attacks: [],
  };

  players.set(playerTag, created);

  return created;
}

type ProcessCompetitiveWarInput = {
  players: Map<string, MutableCompetitiveEvidence>;

  source: CompetitiveEvidenceSource;

  trackedClanTag: string;

  war: CurrentWar;

  occurredAt: string;

  attacksAvailablePerPlayer: number;
};

function processCompetitiveWar({
  players,
  source,
  trackedClanTag,
  war,
  occurredAt,
  attacksAvailablePerPlayer,
}: ProcessCompetitiveWarInput): void {
  const { trackedSide } = getTrackedSide(war, trackedClanTag);

  if (!trackedSide) {
    return;
  }

  const contexts = buildCwlAttackContext({
    source,
    trackedClanTag,
    war,
  });

  const contextsByAttack = new Map(
    contexts.map((context) => [
      `${context.attacker.tag}:${context.attackOrder}`,
      context,
    ]),
  );

  for (const member of trackedSide.members ?? []) {
    const player = getOrCreatePlayer(players, member.tag, member.name ?? null);

    const attacks = member.attacks ?? [];

    const summary = source === "cwl" ? player.cwl : player.regularWar;

    summary.attacksUsed += attacks.length;

    summary.attacksAvailable += attacksAvailablePerPlayer;

    summary.attacksMissed += Math.max(
      0,
      attacksAvailablePerPlayer - attacks.length,
    );

    for (const attack of attacks) {
      const context = contextsByAttack.get(`${member.tag}:${attack.order}`);

      if (!context) {
        continue;
      }

      const evaluation = evaluateCwlAttack(context);

      player.attacks.push({
        source,

        occurredAt,

        trackedClanTag,

        attackOrder: attack.order,

        stars: context.result.stars,
        destruction: context.result.destruction,

        attackerTownHall: context.attacker.townHallLevel,

        attackerMapPosition: context.attacker.mapPosition,

        defenderTownHall: context.defender.townHallLevel,

        defenderMapPosition: context.defender.mapPosition,

        townHallDifference: context.matchup.townHallDifference,

        mapPositionDifference: context.matchup.mapPositionDifference,

        context,

        evaluation,
      });
    }
  }
}

function addCwlEvidence({
  players,
  evaluationDate,
  windowStart,
}: {
  players: Map<string, MutableCompetitiveEvidence>;
  evaluationDate: Date;
  windowStart: Date;
}): void {
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

      for (const { war } of wars) {
        const occurredAt = getWarDate(war);

        if (
          !isInsideWindow({
            occurredAt,
            windowStart,
            evaluationDate,
          })
        ) {
          continue;
        }

        processCompetitiveWar({
          players,

          source: "cwl",

          trackedClanTag: clan.tag,

          war,

          occurredAt: occurredAt as string,

          attacksAvailablePerPlayer: 1,
        });
      }
    }
  }
}

function addRegularWarEvidence({
  players,
  evaluationDate,
  windowStart,
}: {
  players: Map<string, MutableCompetitiveEvidence>;
  evaluationDate: Date;
  windowStart: Date;
}): void {
  for (const clan of CWL_INTELLIGENCE_CLANS) {
    const wars = findRecentWarHistory({
      trackedClanTag: clan.tag,
      limit: 100,
    });

    for (const archivedWar of wars) {
      const occurredAt =
        archivedWar.endTime ??
        archivedWar.startTime ??
        archivedWar.preparationStartTime;

      if (
        !isInsideWindow({
          occurredAt,
          windowStart,
          evaluationDate,
        })
      ) {
        continue;
      }

      let war: CurrentWar;

      try {
        war = JSON.parse(archivedWar.rawJson) as CurrentWar;
      } catch {
        continue;
      }

      processCompetitiveWar({
        players,

        source: "regular_war",

        trackedClanTag: clan.tag,

        war,

        occurredAt: occurredAt as string,

        attacksAvailablePerPlayer: 2,
      });
    }
  }
}

function buildTotalSummary(
  player: MutableCompetitiveEvidence,
): CompetitiveEvidenceSourceSummary {
  return {
    attacksUsed: player.cwl.attacksUsed + player.regularWar.attacksUsed,

    attacksAvailable:
      player.cwl.attacksAvailable + player.regularWar.attacksAvailable,

    attacksMissed: player.cwl.attacksMissed + player.regularWar.attacksMissed,
  };
}

/**
 * Constrói a evidência competitiva recente dos jogadores
 * considerando a janela móvel dos últimos 30 dias.
 *
 * A função recebe a data de avaliação para permitir
 * reprodutibilidade histórica e testes determinísticos.
 */
export function buildCwlCompetitiveEvidence(
  evaluationDate = new Date(),
): CwlCompetitiveEvidence[] {
  const players = new Map<string, MutableCompetitiveEvidence>();

  const windowStart = getWindowStart(evaluationDate);

  addCwlEvidence({
    players,
    evaluationDate,
    windowStart,
  });

  addRegularWarEvidence({
    players,
    evaluationDate,
    windowStart,
  });

  return [...players.values()]
    .map((player) => ({
      playerTag: player.playerTag,
      playerName: player.playerName,

      window: {
        days: COMPETITIVE_WINDOW_DAYS,
        from: windowStart.toISOString(),
        to: evaluationDate.toISOString(),
      },

      cwl: {
        ...player.cwl,
      },

      regularWar: {
        ...player.regularWar,
      },

      total: buildTotalSummary(player),

      attacks: [...player.attacks].sort(
        (a, b) =>
          parseClashDate(a.occurredAt)!.getTime() -
          parseClashDate(b.occurredAt)!.getTime(),
      ),
    }))
    .sort((a, b) => a.playerName?.localeCompare(b.playerName ?? "") ?? 0);
}
