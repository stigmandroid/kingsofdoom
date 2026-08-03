/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * types/cwl.ts
 *
 * Responsabilidade:
 * Definir os tipos relacionados à Clash War League.
 *
 * Estes tipos representam a estrutura retornada pelo
 * endpoint de grupo atual da Liga de Guerras de Clãs.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

/**
 * Estados possíveis do grupo atual da CWL.
 *
 * preparation:
 * O grupo foi criado e as primeiras guerras estão
 * em fase de preparação.
 *
 * inWar:
 * A temporada possui uma rodada em andamento.
 *
 * ended:
 * A temporada atual foi encerrada.
 */
export type CwlGroupState = "preparation" | "inWar" | "ended";

/**
 * URLs dos escudos dos clãs participantes.
 */
export type CwlBadgeUrls = {
  small: string;
  medium: string;
  large: string;
};

/**
 * Representa um jogador inscrito na escalação
 * de um clã participante da CWL.
 */
export type CwlMember = {
  /**
   * Tag oficial do jogador.
   */
  tag: string;

  /**
   * Nome público do jogador.
   */
  name: string;

  /**
   * Nível atual do Centro de Vila.
   *
   * A Clash API utiliza townHallLevel com H maiúsculo.
   */
  townHallLevel: number;
};

/**
 * Representa um clã participante do grupo da CWL.
 */
export type CwlClan = {
  /**
   * Tag oficial do clã.
   */
  tag: string;

  /**
   * Nome público do clã.
   */
  name: string;

  /**
   * Nível atual do clã.
   */
  clanLevel: number;

  /**
   * Escudos disponibilizados pela Clash API.
   */
  badgeUrls: CwlBadgeUrls;

  /**
   * Jogadores inscritos na escalação da temporada.
   *
   * Esta lista pode ser maior que a quantidade de
   * participantes utilizada em cada guerra.
   */
  members: CwlMember[];
};

/**
 * Representa uma rodada da Liga de Guerras.
 *
 * Em um grupo com oito clãs, cada rodada possui
 * quatro guerras.
 */
export type CwlRound = {
  /**
   * Tags das guerras pertencentes à rodada.
   *
   * A API retorna "#0" quando determinada guerra
   * ainda não foi criada.
   */
  warTags: string[];
};

/**
 * Representa o grupo completo da temporada atual.
 */
export type CwlGroup = {
  /**
   * Estado atual da temporada.
   */
  state: CwlGroupState;

  /**
   * Identificador da temporada retornado pela API.
   *
   * Exemplo:
   * 2026-08-02
   */
  season: string;

  /**
   * Clãs participantes do grupo.
   */
  clans: CwlClan[];

  /**
   * Rodadas pertencentes à temporada.
   */
  rounds: CwlRound[];
};

/**
 * Verifica se uma tag de guerra representa
 * uma guerra já criada pela Clash API.
 *
 * Tags iguais a "#0" ainda não podem ser consultadas.
 */
export function isAvailableCwlWarTag(warTag: string): boolean {
  return Boolean(warTag) && warTag !== "#0";
}
