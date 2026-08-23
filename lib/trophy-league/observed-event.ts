/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/trophy-league/observed-event.ts
 *
 * Responsabilidade:
 * Classificar movimentações observadas entre snapshots da
 * Liga de Troféus.
 *
 * Importante:
 *
 * O Command Center não possui acesso ao battle log público
 * individual da Ranked League.
 *
 * Por isso, uma variação entre snapshots representa apenas
 * um MOVIMENTO OBSERVADO.
 *
 * Essa movimentação pode corresponder a:
 *
 * • um ataque individual;
 * • uma defesa individual;
 * • múltiplos ataques;
 * • múltiplas defesas;
 * • combinação entre ataques e defesas.
 *
 * Descoberta importante:
 *
 * Tanto ataques quanto defesas podem acrescentar pontos à
 * pontuação total observada da temporada.
 *
 * Portanto:
 *
 * delta positivo ≠ ataque confirmado
 * delta negativo ≠ defesa confirmada
 *
 * A classificação automática nunca transforma um delta
 * líquido em ataque ou defesa sem uma fonte adicional que
 * permita identificar a origem daquela movimentação.
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
 * 🧪 Regra empírica em validação
 * ==========================================================
 */

import type { TrophyBattleStars } from "@/lib/trophy-league/battle-result";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

/**
 * Classificação de um movimento observado.
 *
 * unclassified:
 * sabemos que houve alteração entre duas capturas, mas não
 * sabemos se ela pertence a ataque ou defesa.
 *
 * possible-attack / possible-defense:
 * permanecem disponíveis para futuras fontes de classificação
 * mais confiáveis.
 *
 * unchanged:
 * nenhuma alteração líquida observada.
 *
 * aggregate:
 * magnitude superior ao limite observado para uma única
 * movimentação individual.
 */
export type TrophyObservedEventType =
  | "unclassified"
  | "possible-attack"
  | "possible-defense"
  | "unchanged"
  | "aggregate";

/**
 * Grau de confiança atribuído à interpretação.
 */
export type TrophyObservedEventConfidence =
  | "observed"
  | "possible"
  | "aggregate"
  | "none";

/**
 * Resultado da interpretação de um delta entre snapshots.
 */
export type TrophyObservedEvent = {
  /**
   * Diferença líquida observada.
   */
  delta: number;

  /**
   * Classificação atual do movimento.
   */
  type: TrophyObservedEventType;

  /**
   * Grau de confiança da classificação.
   */
  confidence: TrophyObservedEventConfidence;

  /**
   * Estrelas inferidas.
   *
   * Permanecem null enquanto não soubermos se a movimentação
   * observada corresponde efetivamente a um ataque ou defesa
   * individual.
   */
  inferredStars: TrophyBattleStars | null;
};

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

/**
 * Maior movimentação individual observada atualmente no
 * sistema de Liga de Troféus.
 *
 * Esse limite é utilizado apenas para distinguir uma
 * movimentação potencialmente individual de um intervalo
 * claramente agregado.
 */
const MAX_SINGLE_BATTLE_SCORE = 40;

/**
 * ==========================================================
 * CLASSIFICAÇÃO
 * ==========================================================
 */

/**
 * Interpreta a variação observada entre dois snapshots.
 *
 * Regras atuais:
 *
 * delta = 0
 * → nenhuma alteração líquida observada.
 *
 * |delta| entre 1 e 40
 * → existe uma movimentação observada, porém sua origem
 *   permanece não classificada.
 *
 * |delta| > 40
 * → o intervalo é tratado como agregado porque ultrapassa
 *   o limite observado de uma movimentação individual.
 *
 * Importante:
 *
 * Um delta de +21 NÃO significa automaticamente:
 *
 * ataque +21.
 *
 * Pode representar:
 *
 * • ataque;
 * • defesa;
 * • múltiplas movimentações cujo saldo foi +21.
 */
export function classifyObservedTrophyEvent(
  delta: number,
): TrophyObservedEvent {
  /**
   * ========================================================
   * VALOR INVÁLIDO
   * ========================================================
   */

  if (!Number.isFinite(delta)) {
    return {
      delta: 0,
      type: "unchanged",
      confidence: "none",
      inferredStars: null,
    };
  }

  /**
   * ========================================================
   * SEM ALTERAÇÃO LÍQUIDA
   * ========================================================
   *
   * Importante:
   *
   * delta 0 não garante ausência de batalhas.
   *
   * Ataques e defesas ocorridos no mesmo intervalo podem,
   * em teoria, produzir saldo líquido igual a zero.
   *
   * O estado apenas informa que nenhuma diferença líquida
   * foi observada entre os dois snapshots.
   */

  if (delta === 0) {
    return {
      delta,
      type: "unchanged",
      confidence: "none",
      inferredStars: null,
    };
  }

  /**
   * ========================================================
   * MOVIMENTO NÃO CLASSIFICADO
   * ========================================================
   *
   * A magnitude está dentro do limite observado para uma
   * única batalha, mas isso NÃO permite determinar:
   *
   * • se foi ataque;
   * • se foi defesa;
   * • se houve somente uma batalha.
   */

  if (Math.abs(delta) <= MAX_SINGLE_BATTLE_SCORE) {
    return {
      delta,
      type: "unclassified",
      confidence: "observed",
      inferredStars: null,
    };
  }

  /**
   * ========================================================
   * MOVIMENTO AGREGADO
   * ========================================================
   *
   * Uma magnitude superior a 40 não pode ser explicada por
   * uma única movimentação individual dentro da regra
   * atualmente observada.
   *
   * Portanto, sabemos que o intervalo representa um saldo
   * agregado.
   */

  return {
    delta,
    type: "aggregate",
    confidence: "aggregate",
    inferredStars: null,
  };
}
