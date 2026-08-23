/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/trophy-league-snapshot.service.ts
 *
 * Responsabilidade:
 * Centralizar a captura e persistência de snapshots da
 * Liga de Troféus.
 *
 * A lógica:
 * • identifica o clã acompanhado no momento da captura;
 * • interpreta a liga atual;
 * • calcula contribuição-base;
 * • calcula peso estimado no Clan Score;
 * • compara com o último snapshot;
 * • detecta mudanças de clã;
 * • grava somente quando houver mudança relevante.
 *
 * O histórico preserva o contexto do jogador no momento
 * da captura. Dessa forma, caso um jogador migre entre
 * K.O.D., K.O.D.rec ou outro clã acompanhado futuramente,
 * o histórico anterior permanece associado ao clã correto.
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

import { getTrophyLeagueContribution } from "@/lib/trophy-league";

import {
  getLatestTrophyLeagueSnapshot,
  saveTrophyLeagueSnapshot,
  type TrophyLeagueSnapshot,
} from "@/repositories/trophy-league.repository";

import type { Player } from "@/types/player";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

/**
 * Resultado da tentativa de captura.
 *
 * saved:
 * informa se um novo snapshot precisou ser persistido.
 *
 * snapshot:
 * representa o snapshot recém-criado ou, quando nada mudou,
 * o último snapshot conhecido do jogador.
 */
export type TrophyLeagueSnapshotCaptureResult = {
  saved: boolean;

  snapshot: TrophyLeagueSnapshot | null;
};

/**
 * Contexto externo da captura.
 *
 * Os dados de clã não devem ser inferidos exclusivamente
 * através da Player API, pois o objetivo do histórico é
 * registrar em qual clã acompanhado pelo Command Center
 * aquele jogador estava no instante da coleta.
 *
 * O contexto permanece opcional porque algumas consultas
 * individuais do perfil ainda podem executar a captura sem
 * terem sido originadas pelo coletor global dos clãs.
 */
export type TrophyLeagueSnapshotContext = {
  trackedClanTag?: string;
  trackedClanName?: string;
};

/**
 * ==========================================================
 * DETECÇÃO DE MUDANÇAS
 * ==========================================================
 */

/**
 * Identifica se os dados ranqueados mudaram desde o último
 * snapshot persistido.
 *
 * Uma mudança de clã também é considerada relevante.
 *
 * Exemplo:
 *
 * jogador X
 * K.O.D.rec → K.O.D.
 *
 * Mesmo que liga, troféus e demais informações permaneçam
 * iguais, um novo snapshot precisa ser criado para preservar
 * corretamente o histórico de pertencimento ao clã.
 */
function hasRelevantChange(
  latestSnapshot: TrophyLeagueSnapshot | null,
  player: Player,
  context: TrophyLeagueSnapshotContext,
  baseScore: number,
  estimatedClanContribution: number,
): boolean {
  /**
   * Primeiro registro conhecido do jogador.
   */
  if (!latestSnapshot) {
    return true;
  }

  /**
   * ========================================================
   * CONTEXTO DO CLÃ
   * ========================================================
   */

  if (
    latestSnapshot.trackedClanTag !== (context.trackedClanTag ?? null) ||
    latestSnapshot.trackedClanName !== (context.trackedClanName ?? null)
  ) {
    return true;
  }

  /**
   * ========================================================
   * LIGA ATUAL
   * ========================================================
   */

  if (
    latestSnapshot.leagueTierId !== (player.leagueTier?.id ?? null) ||
    latestSnapshot.leagueTierName !== (player.leagueTier?.name ?? null)
  ) {
    return true;
  }

  /**
   * ========================================================
   * GRUPO E TEMPORADA
   * ========================================================
   */

  if (
    latestSnapshot.leagueGroupTag !== (player.currentLeagueGroupTag ?? null) ||
    latestSnapshot.leagueSeasonId !== (player.currentLeagueSeasonId ?? null) ||
    latestSnapshot.previousLeagueGroupTag !==
      (player.previousLeagueGroupTag ?? null) ||
    latestSnapshot.previousLeagueSeasonId !==
      (player.previousLeagueSeasonId ?? null)
  ) {
    return true;
  }

  /**
   * ========================================================
   * TROFÉUS
   * ========================================================
   */

  if (
    latestSnapshot.trophies !== (player.trophies ?? 0) ||
    latestSnapshot.bestTrophies !== (player.bestTrophies ?? 0)
  ) {
    return true;
  }

  /**
   * ========================================================
   * CONTRIBUIÇÃO PARA O CLÃ
   * ========================================================
   */

  if (
    latestSnapshot.baseScore !== baseScore ||
    latestSnapshot.estimatedClanContribution !== estimatedClanContribution
  ) {
    return true;
  }

  /**
   * Nenhuma informação relevante mudou.
   */
  return false;
}

/**
 * ==========================================================
 * CAPTURA DO SNAPSHOT
 * ==========================================================
 */

/**
 * Captura e persiste o estado atual da Liga de Troféus
 * de um jogador.
 *
 * O processo:
 *
 * 1. identifica a liga atual;
 * 2. calcula a contribuição estimada;
 * 3. recupera o último snapshot conhecido;
 * 4. compara os estados;
 * 5. persiste somente quando houver mudança relevante.
 *
 * Isso evita criar registros duplicados desnecessários,
 * mantendo o histórico compacto sem perder mudanças reais.
 */
export function captureTrophyLeagueSnapshot(
  player: Player,
  context: TrophyLeagueSnapshotContext = {},
): TrophyLeagueSnapshotCaptureResult {
  /**
   * ========================================================
   * LIGA ATUAL
   * ========================================================
   *
   * leagueTier representa o sistema ranqueado atual.
   *
   * O fallback para league é mantido por compatibilidade
   * enquanto consolidamos todas as respostas da Clash API.
   *
   * Caso nenhuma liga esteja disponível, o jogador é
   * tratado explicitamente como "Sem liga".
   */
  const leagueName =
    player.leagueTier?.name ?? player.league?.name ?? "Sem liga";

  /**
   * ========================================================
   * CONTRIBUIÇÃO ESTIMADA
   * ========================================================
   */

  const contribution = getTrophyLeagueContribution({
    leagueName,
    trophies: player.trophies,
  });

  /**
   * ========================================================
   * ÚLTIMO SNAPSHOT
   * ========================================================
   */

  const latestSnapshot = getLatestTrophyLeagueSnapshot(player.tag);

  /**
   * ========================================================
   * VERIFICAÇÃO DE ALTERAÇÃO
   * ========================================================
   */

  const shouldSave = hasRelevantChange(
    latestSnapshot,
    player,
    context,
    contribution.baseScore,
    contribution.estimatedClanContribution,
  );

  /**
   * Nada mudou.
   *
   * Retornamos o último snapshot sem criar um novo registro.
   */
  if (!shouldSave) {
    return {
      saved: false,
      snapshot: latestSnapshot,
    };
  }

  /**
   * ========================================================
   * PERSISTÊNCIA
   * ========================================================
   */

  const snapshot = saveTrophyLeagueSnapshot({
    /**
     * Clã acompanhado no momento da captura.
     */
    trackedClanTag: context.trackedClanTag,

    trackedClanName: context.trackedClanName,

    /**
     * Identificação do jogador.
     */
    playerTag: player.tag,

    playerName: player.name,

    /**
     * Momento exato da captura.
     */
    capturedAt: new Date().toISOString(),

    /**
     * Liga atual.
     */
    leagueTierId: player.leagueTier?.id,

    leagueTierName: player.leagueTier?.name,

    /**
     * Grupo e temporada atuais.
     */
    leagueGroupTag: player.currentLeagueGroupTag,

    leagueSeasonId: player.currentLeagueSeasonId,

    /**
     * Grupo e temporada anteriores.
     */
    previousLeagueGroupTag: player.previousLeagueGroupTag,

    previousLeagueSeasonId: player.previousLeagueSeasonId,

    /**
     * Desempenho atual.
     */
    trophies: player.trophies ?? 0,

    bestTrophies: player.bestTrophies ?? 0,

    /**
     * Peso utilizado pela nossa interpretação atual
     * do sistema de pontuação.
     */
    baseScore: contribution.baseScore,

    estimatedClanContribution: contribution.estimatedClanContribution,
  });

  return {
    saved: true,
    snapshot,
  };
}
