/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/cwl-intelligence.service.ts
 *
 * Responsabilidade:
 * Expor para a camada de apresentação o ranking contextual
 * da inteligência competitiva da CWL.
 *
 * Princípios:
 *
 * - a página não acessa diretamente a camada de evidências;
 * - a inteligência permanece concentrada em lib/intelligence;
 * - este service apenas orquestra evidência → ranking;
 * - nenhuma regra competitiva deve ser implementada aqui.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 30/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * Desenvolvimento
 * ==========================================================
 */

import { buildCwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";
import {
  rankCwlPlayers,
  type CwlRankedPlayer,
} from "@/lib/intelligence/cwl/rank-cwl-players";

/**
 * Retorna o ranking contextual atual da CWL.
 *
 * A função utiliza a mesma pipeline validada pelos scripts
 * de inteligência:
 *
 * Evidência competitiva
 *        ↓
 * Elegibilidade
 *        ↓
 * Performance contextual
 *        ↓
 * Ranking
 */
export function getCwlIntelligenceRanking(): CwlRankedPlayer[] {
  const evidences = buildCwlCompetitiveEvidence();

  return rankCwlPlayers(evidences);
}
