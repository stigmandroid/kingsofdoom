/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * types/clan.ts
 *
 * Responsabilidade:
 * Definir os contratos TypeScript relacionados aos dados
 * de clãs e membros recebidos pela Clash of Clans API.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

/**
 * Representa as diferentes versões do brasão de um clã.
 */
export type ClanBadgeUrls = {
  small: string;
  medium: string;
  large: string;
};

/**
 * Representa os ícones associados a uma liga.
 *
 * Os campos são opcionais porque algumas respostas da API
 * podem não retornar todos os tamanhos disponíveis.
 */
export type LeagueIconUrls = {
  small?: string;
  tiny?: string;
  medium?: string;
};

/**
 * Representa uma liga presente nos dados do clã
 * ou nos dados individuais de um membro.
 */
export type ClanLeague = {
  id: number;
  name: string;
  iconUrls?: LeagueIconUrls;
};

/**
 * Representa o cargo de um jogador dentro do clã.
 *
 * Os valores correspondem aos identificadores normalmente
 * retornados pela Clash of Clans API.
 */
export type ClanMemberRole = "member" | "admin" | "coLeader" | "leader";

/**
 * Representa um jogador presente na lista de membros do clã.
 */
export type ClanMember = {
  /**
   * Identificador único do jogador.
   *
   * Exemplo:
   * #9C9QUPVQL
   */
  tag: string;

  /**
   * Nome atual do jogador dentro do jogo.
   */
  name: string;

  /**
   * Cargo ocupado pelo jogador dentro do clã.
   */
  role: ClanMemberRole;

  /**
   * Nível atual do Centro de Vila.
   */
  townHallLevel: number;

  /**
   * Nível de experiência da conta.
   */
  expLevel: number;

  /**
   * Quantidade atual de troféus da vila principal.
   */
  trophies: number;

  /**
   * Melhor quantidade de troféus já registrada
   * pela conta na vila principal.
   */
  bestTrophies: number;

  /**
   * Quantidade de tropas doadas durante a temporada atual.
   */
  donations: number;

  /**
   * Quantidade de tropas recebidas durante a temporada atual.
   */
  donationsReceived: number;

  /**
   * Liga atual do jogador.
   *
   * O campo é opcional porque jogadores sem classificação
   * podem não possuir uma liga associada.
   */
  league?: ClanLeague;

  /**
   * Posição atual do jogador dentro do clã.
   */
  clanRank: number;

  /**
   * Posição anterior do jogador dentro do clã.
   */
  previousClanRank: number;

  /**
   * Quantidade atual de troféus da Base do Construtor.
   *
   * O campo permanece opcional para suportar respostas
   * que não incluam dados completos dessa vila.
   */
  builderBaseTrophies?: number;

  /**
   * Melhor marca de troféus da Base do Construtor.
   */
  bestBuilderBaseTrophies?: number;

  /**
   * Liga atual da Base do Construtor.
   */
  builderBaseLeague?: ClanLeague;
};

/**
 * Representa os dados gerais de um clã retornados pela API.
 */
export type Clan = {
  /**
   * Identificador único do clã.
   */
  tag: string;

  /**
   * Nome atual do clã.
   */
  name: string;

  /**
   * Descrição pública definida pelos líderes.
   */
  description?: string;

  /**
   * Nível atual do clã.
   */
  clanLevel: number;

  /**
   * Pontuação total da vila principal.
   */
  clanPoints: number;

  /**
   * Pontuação total da Base do Construtor.
   */
  clanBuilderBasePoints?: number;

  /**
   * Quantidade total de membros informada pela API.
   */
  members: number;

  /**
   * Lista completa de jogadores atualmente no clã.
   */
  memberList: ClanMember[];

  /**
   * Estatísticas gerais de guerra.
   */
  warWins?: number;
  warWinStreak?: number;
  warTies?: number;
  warLosses?: number;

  /**
   * Indica se o histórico de guerra é público.
   */
  isWarLogPublic?: boolean;

  /**
   * Frequência de guerra configurada no clã.
   */
  warFrequency?: string;

  /**
   * Quantidade mínima de troféus exigida para entrada.
   */
  requiredTrophies?: number;

  /**
   * Brasão oficial do clã em diferentes resoluções.
   */
  badgeUrls: ClanBadgeUrls;

  /**
   * Liga de Guerra de Clãs atual.
   */
  warLeague?: ClanLeague;
};
