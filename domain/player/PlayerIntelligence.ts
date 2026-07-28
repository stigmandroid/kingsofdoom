// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// player-intelligence.ts
//
// Localização:
// types/player-intelligence.ts
//
// Responsabilidade:
// Definir os contratos utilizados pelo módulo de
// inteligência de jogadores.
//
// Funcionalidades:
//
// - Representar métricas individuais.
// - Representar a pontuação geral do jogador.
// - Padronizar classificações de desempenho.
// - Identificar métricas que ainda não possuem dados.
//
// Dependências:
//
// - Nenhuma.
//
// Autor:
// stigmandroid
//
// Última atualização:
// 27/07/2026
//
// Versão:
// 0.1.0
//
// Status:
// 🧪 Experimental
// ==========================================================

/**
 * Classificações utilizadas para representar o nível
 * geral de desempenho de um jogador.
 */
export type PlayerIntelligenceClassification =
  | "elite"
  | "excellent"
  | "good"
  | "developing"
  | "attention"
  | "insufficient-data";

/**
 * Identifica a situação de uma métrica.
 *
 * available:
 * A métrica possui dados suficientes para ser calculada.
 *
 * unavailable:
 * A API não fornece os dados necessários.
 *
 * insufficient-data:
 * Existem dados, mas ainda não há histórico suficiente.
 */
export type PlayerMetricStatus =
  | "available"
  | "unavailable"
  | "insufficient-data";

/**
 * Representa uma métrica individual do jogador.
 */
export interface PlayerIntelligenceMetric {
  /**
   * Identificador interno da métrica.
   */
  key: string;

  /**
   * Nome que será exibido na interface.
   */
  label: string;

  /**
   * Pontuação entre 0 e 100.
   *
   * Será null quando a métrica não puder ser calculada.
   */
  score: number | null;

  /**
   * Situação atual da métrica.
   */
  status: PlayerMetricStatus;

  /**
   * Texto curto explicando como a pontuação foi obtida
   * ou por que ainda não está disponível.
   */
  description: string;
}

/**
 * Resultado completo da análise de um jogador.
 */
export interface PlayerIntelligenceResult {
  /**
   * Tag única do jogador.
   */
  playerTag: string;

  /**
   * Nome atual do jogador.
   */
  playerName: string;

  /**
   * Pontuação geral entre 0 e 100.
   *
   * Considera apenas métricas disponíveis.
   */
  overallScore: number | null;

  /**
   * Classificação correspondente à pontuação geral.
   */
  classification: PlayerIntelligenceClassification;

  /**
   * Métricas utilizadas ou planejadas para análise.
   */
  metrics: PlayerIntelligenceMetric[];

  /**
   * Data e hora em que a análise foi gerada.
   */
  calculatedAt: string;

  /**
   * Versão do algoritmo utilizado.
   */
  algorithmVersion: string;
}
