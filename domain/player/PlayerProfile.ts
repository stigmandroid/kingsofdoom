// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// player-profile.ts
//
// Localização:
// types/player-profile.ts
//
// Responsabilidade:
// Definir o modelo interno de um jogador.
//
// Este modelo representa a visão do Kings of Doom sobre
// um jogador, independente da origem dos dados.
//
// Funcionalidades:
//
// - Centralizar informações do jogador.
// - Unificar diferentes fontes de dados.
// - Servir de entrada para Analytics e IA.
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
 * Representa um jogador dentro do domínio do
 * Kings of Doom Command Center.
 *
 * Diferentemente dos tipos da Clash API,
 * este modelo poderá crescer ao longo do tempo,
 * recebendo dados de diversas fontes.
 */
export interface PlayerProfile {
  /**
   * Identificação única.
   */
  tag: string;

  /**
   * Nome do jogador.
   */
  name: string;

  /**
   * Nível de experiência.
   */
  expLevel: number;

  /**
   * Centro de Vila.
   */
  townHallLevel: number;

  /**
   * Títulos atuais.
   */
  trophies: number;

  /**
   * Cargo dentro do clã.
   */
  role: string;

  /**
   * Doações da temporada.
   */
  donations: number;

  /**
   * Tropas recebidas.
   */
  donationsReceived: number;

  /**
   * Dados históricos.
   *
   * Inicialmente vazio.
   */
  history: {
    wars: number;
    attacks: number;
    defenses: number;
    stars: number;
  };

  /**
   * Dados calculados.
   */
  intelligence?: unknown;
}
