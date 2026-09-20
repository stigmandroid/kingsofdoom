/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/intelligence/cwl/allocate-cwl-roster.ts
 *
 * Responsabilidade:
 * Transformar o ranking competitivo da CWL em uma proposta
 * objetiva de formação para K.O.D. e K.O.D.rec.
 *
 * Princípios:
 *
 * - somente jogadores elegíveis podem ocupar vagas;
 * - K.O.D. e K.O.D.rec formam um único pool competitivo;
 * - associação atual a um clã não garante posição;
 * - titulares têm prioridade sobre reservas;
 * - nenhuma vaga é preenchida artificialmente;
 * - reservas também precisam cumprir elegibilidade;
 * - vagas abertas representam necessidade competitiva;
 * - liderança mantém a decisão final.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import type { CwlRankedPlayer } from "./rank-cwl-players";

export type CwlRosterClan = "kod" | "kod_rec";

export type CwlRosterSlot = {
  clan: CwlRosterClan;

  role: "starter" | "reserve";

  slot: number;

  globalPosition: number;

  status: "filled" | "open";

  player: CwlRankedPlayer | null;
};

export type CwlRosterAllocation = {
  kod: CwlRosterSlot[];

  kodRec: CwlRosterSlot[];

  kodReserves: CwlRosterSlot[];

  kodRecReserves: CwlRosterSlot[];

  unallocatedEligiblePlayers: CwlRankedPlayer[];

  summary: {
    eligiblePlayers: number;

    starterSlots: number;
    filledStarterSlots: number;
    openStarterSlots: number;

    reserveSlots: number;
    filledReserveSlots: number;
    openReserveSlots: number;

    kodFilled: number;
    kodOpen: number;

    kodRecFilled: number;
    kodRecOpen: number;

    kodReservesFilled: number;
    kodReservesOpen: number;

    kodRecReservesFilled: number;
    kodRecReservesOpen: number;

    recruitmentNeed: number;
  };
};

const STARTERS_PER_CLAN = 15;
const RESERVES_PER_CLAN = 3;

const TOTAL_STARTER_SLOTS = STARTERS_PER_CLAN * 2;

const TOTAL_RESERVE_SLOTS = RESERVES_PER_CLAN * 2;

function buildSlots({
  clan,
  role,
  players,
  amount,
  globalStartIndex,
}: {
  clan: CwlRosterClan;
  role: "starter" | "reserve";
  players: CwlRankedPlayer[];
  amount: number;
  globalStartIndex: number;
}): CwlRosterSlot[] {
  return Array.from({ length: amount }, (_, index): CwlRosterSlot => {
    const player = players[index] ?? null;

    return {
      clan,
      role,
      slot: index + 1,
      globalPosition: globalStartIndex + index + 1,
      status: player ? "filled" : "open",
      player,
    };
  });
}

function countFilled(slots: CwlRosterSlot[]): number {
  return slots.filter((slot) => slot.status === "filled").length;
}

export function allocateCwlRoster(
  rankedPlayers: CwlRankedPlayer[],
): CwlRosterAllocation {
  /**
   * ========================================================
   * TITULARES
   * ========================================================
   *
   * Titulares sempre têm prioridade.
   *
   * 1–15  → K.O.D.
   * 16–30 → K.O.D.rec
   */
  const starterCandidates = rankedPlayers.slice(0, TOTAL_STARTER_SLOTS);

  const kodPlayers = starterCandidates.slice(0, STARTERS_PER_CLAN);

  const kodRecPlayers = starterCandidates.slice(
    STARTERS_PER_CLAN,
    TOTAL_STARTER_SLOTS,
  );

  /**
   * ========================================================
   * RESERVAS
   * ========================================================
   *
   * Somente jogadores elegíveis que sobraram depois do
   * preenchimento das 30 vagas titulares podem ser reservas.
   *
   * 31–33 → reservas K.O.D.
   * 34–36 → reservas K.O.D.rec
   *
   * Essa distribuição não retira jogadores das formações
   * titulares para fabricar artificialmente reservas.
   */
  const reserveCandidates = rankedPlayers.slice(
    TOTAL_STARTER_SLOTS,
    TOTAL_STARTER_SLOTS + TOTAL_RESERVE_SLOTS,
  );

  const kodReservePlayers = reserveCandidates.slice(0, RESERVES_PER_CLAN);

  const kodRecReservePlayers = reserveCandidates.slice(
    RESERVES_PER_CLAN,
    TOTAL_RESERVE_SLOTS,
  );

  const kod = buildSlots({
    clan: "kod",
    role: "starter",
    players: kodPlayers,
    amount: STARTERS_PER_CLAN,
    globalStartIndex: 0,
  });

  const kodRec = buildSlots({
    clan: "kod_rec",
    role: "starter",
    players: kodRecPlayers,
    amount: STARTERS_PER_CLAN,
    globalStartIndex: STARTERS_PER_CLAN,
  });

  const kodReserves = buildSlots({
    clan: "kod",
    role: "reserve",
    players: kodReservePlayers,
    amount: RESERVES_PER_CLAN,
    globalStartIndex: TOTAL_STARTER_SLOTS,
  });

  const kodRecReserves = buildSlots({
    clan: "kod_rec",
    role: "reserve",
    players: kodRecReservePlayers,
    amount: RESERVES_PER_CLAN,
    globalStartIndex: TOTAL_STARTER_SLOTS + RESERVES_PER_CLAN,
  });

  const kodFilled = countFilled(kod);
  const kodRecFilled = countFilled(kodRec);

  const kodReservesFilled = countFilled(kodReserves);

  const kodRecReservesFilled = countFilled(kodRecReserves);

  const kodOpen = STARTERS_PER_CLAN - kodFilled;

  const kodRecOpen = STARTERS_PER_CLAN - kodRecFilled;

  const kodReservesOpen = RESERVES_PER_CLAN - kodReservesFilled;

  const kodRecReservesOpen = RESERVES_PER_CLAN - kodRecReservesFilled;

  const filledStarterSlots = kodFilled + kodRecFilled;

  const openStarterSlots = TOTAL_STARTER_SLOTS - filledStarterSlots;

  const filledReserveSlots = kodReservesFilled + kodRecReservesFilled;

  const openReserveSlots = TOTAL_RESERVE_SLOTS - filledReserveSlots;

  const allocatedPlayers = filledStarterSlots + filledReserveSlots;

  const unallocatedEligiblePlayers = rankedPlayers.slice(allocatedPlayers);

  return {
    kod,
    kodRec,

    kodReserves,
    kodRecReserves,

    unallocatedEligiblePlayers,

    summary: {
      eligiblePlayers: rankedPlayers.length,

      starterSlots: TOTAL_STARTER_SLOTS,
      filledStarterSlots,
      openStarterSlots,

      reserveSlots: TOTAL_RESERVE_SLOTS,
      filledReserveSlots,
      openReserveSlots,

      kodFilled,
      kodOpen,

      kodRecFilled,
      kodRecOpen,

      kodReservesFilled,
      kodReservesOpen,

      kodRecReservesFilled,
      kodRecReservesOpen,

      recruitmentNeed: openStarterSlots,
    },
  };
}
