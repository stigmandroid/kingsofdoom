/**
 * ============================================================================
 * Kings of Doom Command Center
 * Clan Games Baseline Service
 * ============================================================================
 *
 * Responsabilidade:
 * Criar o snapshot inicial de uma edição dos Jogos do Clã.
 *
 * Estratégia:
 * - receber clanTag e season;
 * - obter o roster atual do clã;
 * - criar/localizar o evento;
 * - consultar o perfil de cada membro;
 * - capturar o achievement cumulativo "Games Champion";
 * - persistir todos os membros com pontuação inicial zero;
 * - preservar baselines previamente existentes;
 * - isolar falhas individuais.
 *
 * Este serviço deve ser executado antes do início dos Jogos do Clã.
 *
 * A partir desse snapshot, o collector poderá calcular:
 *
 * currentPoints =
 *   GamesChampionCurrent - GamesChampionBaseline
 *
 * Para agosto/2026 existe uma exceção histórica porque o sistema
 * começou a ser implementado com o evento já em andamento.
 *
 * @author stigmandroid
 * @version 0.9.3
 * ============================================================================
 */

import { getClan } from "@/services/clan.service";
import { getPlayer } from "@/services/player.service";

import {
  ensureClanGamesEvent,
  upsertClanGamesMemberBaseline,
} from "@/repositories/clan-games.repository";

/**
 * ============================================================================
 * TIPOS
 * ============================================================================
 */

export interface ClanGamesBaselinePlayerError {
  playerTag: string;
  playerName: string;
  error: string;
}

export interface ClanGamesBaselineResult {
  success: boolean;

  eventId: number;
  clanTag: string;
  season: string;

  capturedAt: string;

  rosterMembers: number;
  capturedMembers: number;
  failedMembers: number;

  playerErrors: ClanGamesBaselinePlayerError[];
}

/**
 * ============================================================================
 * CAPTURA DO BASELINE
 * ============================================================================
 */

/**
 * Captura o roster e o achievement Games Champion de todos
 * os membros atuais do clã.
 *
 * Importante:
 * upsertClanGamesMemberBaseline preserva um baseline que já tenha
 * sido persistido anteriormente.
 *
 * Portanto, uma nova execução não deve mover o ponto inicial
 * de um jogador cujo baseline já exista.
 */
export async function captureClanGamesBaseline(
  clanTag: string,
  season: string,
): Promise<ClanGamesBaselineResult> {
  const capturedAt = new Date().toISOString();

  /**
   * ----------------------------------------------------------
   * 1. Obtém o roster atual
   * ----------------------------------------------------------
   */

  const clan = await getClan(clanTag);

  /**
   * ----------------------------------------------------------
   * 2. Cria ou localiza a edição
   * ----------------------------------------------------------
   */

  const event = ensureClanGamesEvent(clanTag, season, capturedAt);

  let capturedMembers = 0;

  const playerErrors: ClanGamesBaselinePlayerError[] = [];

  /**
   * ----------------------------------------------------------
   * 3. Captura o baseline individual
   * ----------------------------------------------------------
   */

  for (const member of clan.memberList ?? []) {
    try {
      const player = await getPlayer(member.tag);

      const gamesChampion = player.achievements?.find(
        (achievement) => achievement.name === "Games Champion",
      );

      if (!gamesChampion) {
        throw new Error('Achievement "Games Champion" não encontrado.');
      }

      upsertClanGamesMemberBaseline({
        eventId: event.id,

        playerTag: member.tag,
        playerName: member.name,

        baselinePoints: 0,

        gamesChampionBaseline: gamesChampion.value,

        capturedAt,
      });

      capturedMembers += 1;
    } catch (error) {
      playerErrors.push({
        playerTag: member.tag,
        playerName: member.name,

        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  /**
   * ----------------------------------------------------------
   * 4. Resultado
   * ----------------------------------------------------------
   */

  return {
    success: playerErrors.length === 0,

    eventId: event.id,
    clanTag,
    season,

    capturedAt,

    rosterMembers: clan.memberList?.length ?? 0,
    capturedMembers,
    failedMembers: playerErrors.length,

    playerErrors,
  };
}
