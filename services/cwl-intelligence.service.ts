/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/cwl-intelligence.service.ts
 *
 * Responsabilidade:
 * Expor para a camada de apresentação as avaliações
 * completas da inteligência competitiva da CWL.
 *
 * Princípios:
 * - a página não acessa diretamente a camada de evidências;
 * - a inteligência permanece concentrada em lib/intelligence;
 * - este service apenas orquestra evidência → avaliação;
 * - nenhuma regra competitiva deve ser implementada aqui.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/10/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * Desenvolvimento
 * ==========================================================
 */

import { buildCwlCompetitiveEvidence } from "@/lib/intelligence/cwl/build-cwl-competitive-evidence";

import {
  evaluateAllCwlPlayers,
  rankCwlPlayers,
  type CwlPlayerFullEvaluation,
  type CwlRankedPlayer,
} from "@/lib/intelligence/cwl/rank-cwl-players";

/**
 * Retorna o ranking contextual atual da CWL.
 *
 * Pipeline:
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

/**
 * Retorna a avaliação completa de todos os jogadores
 * encontrados no universo competitivo.
 *
 * Inclui:
 *
 * - elegibilidade;
 * - critérios aprovados;
 * - critérios reprovados;
 * - ranking, quando elegível;
 * - métricas competitivas;
 * - performance contextual;
 * - contexto utilizado pela classificação.
 *
 * Jogadores não elegíveis possuem `ranking: null`.
 */
export function getCwlPlayerFullEvaluations(): CwlPlayerFullEvaluation[] {
  const evidences = buildCwlCompetitiveEvidence();

  return evaluateAllCwlPlayers(evidences);
}
