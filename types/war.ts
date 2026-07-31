/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Tipos relacionados às guerras do Clash of Clans.
 *
 * Estes tipos representam exatamente a estrutura utilizada
 * pela API oficial da Supercell.
 * ==========================================================
 */

/**
 * Estados possíveis de uma guerra.
 */
export type WarState = "notInWar" | "preparation" | "inWar" | "warEnded";

/**
 * URLs do escudo do clã.
 */
export type WarBadgeUrls = {
  small: string;
  medium: string;
  large: string;
};

/**
 * Ataque realizado durante a guerra.
 */
export type WarAttack = {
  attackerTag: string;
  defenderTag: string;
  stars: number;
  destructionPercentage: number;
  order: number;
  duration: number;
};

/**
 * Melhor ataque recebido por um jogador.
 */
export type BestOpponentAttack = {
  attackerTag: string;
  defenderTag: string;
  stars: number;
  destructionPercentage: number;
  order: number;
  duration: number;
};

/**
 * Jogador participante da guerra.
 */
export type WarMember = {
  tag: string;
  name: string;

  /**
   * Nível do Centro de Vila.
   */
  townhallLevel: number;

  /**
   * Posição do jogador no mapa da guerra.
   */
  mapPosition: number;

  /**
   * Quantidade de ataques recebidos.
   */
  opponentAttacks: number;

  /**
   * Ataques realizados.
   *
   * A API pode omitir esta propriedade quando
   * o jogador ainda não atacou.
   */
  attacks?: WarAttack[];

  /**
   * Melhor ataque recebido.
   *
   * Também pode não existir caso o jogador
   * ainda não tenha sido atacado.
   */
  bestOpponentAttack?: BestOpponentAttack;
};

/**
 * Dados de um dos lados da guerra.
 */
export type WarClan = {
  tag: string;
  name: string;

  clanLevel: number;

  attacks: number;

  stars: number;

  destructionPercentage: number;

  badgeUrls: WarBadgeUrls;

  /**
   * Todos os jogadores participantes.
   */
  members: WarMember[];
};

/**
 * Guerra atual.
 */
export type CurrentWar = {
  state: WarState;

  teamSize?: number;

  attacksPerMember?: number;

  preparationStartTime?: string;

  startTime?: string;

  endTime?: string;

  clan?: WarClan;

  opponent?: WarClan;
};

/**
 * Resultado da consulta da guerra.
 */
export type CurrentWarResult =
  | {
      available: true;
      war: CurrentWar;
    }
  | {
      available: false;
      reason: "notInWar" | "privateWarLog" | "unavailable";
    };
