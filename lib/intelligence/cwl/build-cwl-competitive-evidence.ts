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
 * 19/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * 🚧 Base de evidência competitiva da CWL Intelligence
 * ==========================================================
 */

import {
  getCwlArchiveSeasons,
  getCwlPostSeasonSummary,
} from "../../../services/cwl-archive.service";

import {
  getPlayerWarHistory,
  type PlayerWarHistoryEntry,
} from "../../../services/player-war-history.service";

import type { CurrentWar } from "../../../types/war";

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

  stars: number;
  destruction: number;

  attackerTownHall: number | null;
  defenderTownHall: number | null;

  townHallDifference: number | null;
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

        const { trackedSide, opposingSide } = getTrackedSide(war, clan.tag);

        if (!trackedSide) {
          continue;
        }

        for (const member of trackedSide.members ?? []) {
          const player = getOrCreatePlayer(
            players,
            member.tag,
            member.name ?? null,
          );

          const attacks = member.attacks ?? [];

          const attacksAvailable = 1;

          player.cwl.attacksUsed += attacks.length;

          player.cwl.attacksAvailable += attacksAvailable;

          player.cwl.attacksMissed += Math.max(
            0,
            attacksAvailable - attacks.length,
          );

          for (const attack of attacks) {
            const defender = opposingSide?.members?.find(
              (candidate) => candidate.tag === attack.defenderTag,
            );

            const attackerTownHall = member.townhallLevel ?? null;

            const defenderTownHall = defender?.townhallLevel ?? null;

            player.attacks.push({
              source: "cwl",

              occurredAt: occurredAt as string,

              trackedClanTag: clan.tag,

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
      }
    }
  }
}

function addRegularWarEntry({
  player,
  entry,
  evaluationDate,
  windowStart,
}: {
  player: MutableCompetitiveEvidence;
  entry: PlayerWarHistoryEntry;
  evaluationDate: Date;
  windowStart: Date;
}): void {
  const occurredAt =
    entry.endTime ?? entry.startTime ?? entry.preparationStartTime;

  if (
    !isInsideWindow({
      occurredAt,
      windowStart,
      evaluationDate,
    })
  ) {
    return;
  }

  player.regularWar.attacksUsed += entry.attacksUsed;

  player.regularWar.attacksAvailable += entry.attacksAvailable;

  player.regularWar.attacksMissed += entry.attacksMissed;

  for (const attack of entry.attacks) {
    player.attacks.push({
      source: "regular_war",

      occurredAt: occurredAt as string,

      trackedClanTag: entry.trackedClanTag,

      stars: attack.stars,
      destruction: attack.destruction,

      attackerTownHall: attack.attackerTownHall,

      defenderTownHall: attack.defenderTownHall,

      townHallDifference: attack.townHallDifference,
    });
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
  for (const player of players.values()) {
    const history = getPlayerWarHistory(player.playerTag);

    if (history.playerName) {
      player.playerName = history.playerName;
    }

    for (const entry of history.history) {
      addRegularWarEntry({
        player,
        entry,
        evaluationDate,
        windowStart,
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
