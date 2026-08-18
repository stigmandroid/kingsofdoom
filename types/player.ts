/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * types/player.ts
 *
 * Responsabilidade:
 * Definir os contratos TypeScript dos dados detalhados
 * retornados pelo endpoint individual de jogadores da
 * Clash of Clans API.
 *
 * Observação:
 * Estes tipos não substituem os tipos de membros do clã.
 * O endpoint do clã fornece dados resumidos, enquanto o
 * endpoint do jogador fornece informações detalhadas.
 *
 * Autor:
 * stigmandroid
 * ==========================================================
 */

/**
 * Endereços dos ícones oficiais disponibilizados pela API.
 */
export interface PlayerIconUrls {
  /**
   * Ícone em resolução reduzida.
   */
  small?: string;

  /**
   * Ícone em resolução média.
   */
  medium?: string;

  /**
   * Ícone em resolução ampliada.
   */
  large?: string;
}

/**
 * Representa a liga ranqueada atual do jogador.
 *
 * Após a atualização do sistema ranqueado, o endpoint
 * individual passou a fornecer a liga atual por meio
 * da propriedade `leagueTier`.
 */
export interface PlayerLeagueTier {
  /**
   * Identificador oficial da liga.
   */
  id: number;

  /**
   * Nome da liga retornado pela API.
   *
   * Exemplo:
   * "Titan Liga 26"
   */
  name: string;

  /**
   * Ícones oficiais da liga.
   */
  iconUrls?: PlayerIconUrls;
}

/**
 * Representa uma temporada da Liga Lendária.
 */
export interface LegendSeason {
  /**
   * Identificador da temporada.
   *
   * Exemplo:
   * "2025-12-29"
   */
  id?: string;

  /**
   * Posição global alcançada pelo jogador.
   *
   * Quanto menor esse número, melhor foi a colocação.
   */
  rank?: number;

  /**
   * Quantidade de troféus registrada na temporada.
   */
  trophies?: number;
}

/**
 * Representa as estatísticas históricas do jogador
 * na Liga Lendária.
 */
export interface LegendStatistics {
  /**
   * Total acumulado de troféus lendários.
   */
  legendTrophies?: number;

  /**
   * Resultado da temporada anterior.
   */
  previousSeason?: LegendSeason;

  /**
   * Melhor temporada reconhecida pelo sistema atual.
   *
   * Esta é a propriedade que corresponde ao registro
   * apresentado no perfil atual do Clash of Clans.
   */
  bestSeason?: LegendSeason;

  /**
   * Resultado da temporada em andamento.
   */
  currentSeason?: LegendSeason;
}

/**
 * Representa o clã associado ao jogador no endpoint
 * individual.
 */
export interface PlayerClan {
  /**
   * Tag oficial do clã.
   */
  tag: string;

  /**
   * Nome atual do clã.
   */
  name: string;

  /**
   * Nível do clã.
   */
  clanLevel: number;

  /**
   * Emblemas oficiais do clã.
   */
  badgeUrls?: PlayerIconUrls;
}

/**
 * Representa uma liga no formato anterior ou em outros
 * modos de jogo retornados pela API.
 */
export interface PlayerLeague {
  /**
   * Identificador oficial da liga.
   */
  id: number;

  /**
   * Nome da liga.
   */
  name: string;

  /**
   * Ícones oficiais da liga.
   */
  iconUrls?: PlayerIconUrls;
}

/**
 * Representa um herói desbloqueado pelo jogador.
 *
 * O tipo já fica preparado para futuras páginas de
 * perfil, mesmo que o MemberCard ainda não utilize
 * essas informações.
 */
export interface PlayerHero {
  /**
   * Nome oficial do herói.
   */
  name: string;

  /**
   * Nível atual do herói.
   */
  level: number;

  /**
   * Nível máximo disponível para o jogador.
   */
  maxLevel: number;

  /**
   * Vila à qual o herói pertence.
   */
  village: string;

  /**
   * Equipamentos atualmente associados ao herói,
   * quando fornecidos pela API.
   */
  equipment?: PlayerHeroEquipment[];
}

/**
 * Representa um equipamento de herói.
 */
export interface PlayerHeroEquipment {
  /**
   * Nome oficial do equipamento.
   */
  name: string;

  /**
   * Nível atual do equipamento.
   */
  level: number;

  /**
   * Nível máximo disponível.
   */
  maxLevel: number;

  /**
   * Vila à qual o equipamento pertence.
   */
  village: string;
}

/**
 * Representa os dados detalhados de um jogador retornados
 * por:
 *
 * GET /v1/players/{playerTag}
 */
export interface Player {
  /**
   * Tag oficial do jogador.
   */
  tag: string;

  /**
   * Nome atual do jogador.
   */
  name: string;

  /**
   * Nível de experiência.
   */
  expLevel?: number;

  /**
   * Centro de Vila atual.
   */
  townHallLevel?: number;

  /**
   * Nível da arma do Centro de Vila, quando aplicável.
   */
  townHallWeaponLevel?: number;

  /**
   * Quantidade atual de troféus da Vila Principal.
   */
  trophies?: number;

  /**
   * Antigo recorde geral de troféus.
   *
   * Atenção:
   * Este campo representa o recorde histórico legado e
   * não deve ser usado como a melhor marca do sistema
   * ranqueado atual.
   */
  bestTrophies?: number;

  /**
   * Estrelas de guerra acumuladas.
   */
  warStars?: number;

  /**
   * Quantidade de ataques vencidos na temporada.
   */
  attackWins?: number;

  /**
   * Quantidade de defesas vencidas na temporada.
   */
  defenseWins?: number;

  /**
   * Cargo atual do jogador dentro do clã.
   */
  role?: string;

  /**
   * Tropas doadas durante a temporada.
   */
  donations?: number;

  /**
   * Tropas recebidas durante a temporada.
   */
  donationsReceived?: number;

  /**
   * Clã atual do jogador.
   */
  clan?: PlayerClan;

  /**
   * Liga presente em formatos anteriores ou em outros
   * contextos retornados pela API.
   */
  league?: PlayerLeague;

  /**
   * Liga atual do sistema ranqueado.
   *
   * Este campo deve alimentar a liga exibida no card.
   */
  leagueTier?: PlayerLeagueTier;

  /**
   * Estatísticas detalhadas da Liga Lendária.
   */
  legendStatistics?: LegendStatistics;

  /**
   * Heróis desbloqueados pelo jogador.
   */
  heroes?: PlayerHero[];

  /**
   * Inventário completo de equipamentos de herói.
   */
  heroEquipment?: PlayerHeroEquipment[];

  /**
   * Unidades desbloqueadas e seus respectivos níveis.
   *
   * A API mistura diferentes categorias neste array.
   */
  troops?: PlayerTroop[];

  /**
   * Feitiços desbloqueados e seus respectivos níveis.
   */
  spells?: PlayerSpell[];
}

/**
 * Combina os dados resumidos do membro, recebidos pelo
 * endpoint do clã, com os dados detalhados do endpoint
 * individual do jogador.
 *
 * O tipo genérico evita acoplar este arquivo diretamente
 * ao arquivo de tipos do clã e previne importações
 * circulares.
 */
export interface ClanMemberWithPlayer<TClanMember> {
  /**
   * Informações resumidas recebidas pelo endpoint do clã.
   */
  member: TClanMember;

  /**
   * Informações detalhadas do jogador.
   *
   * Pode ser nulo quando a consulta individual falhar,
   * permitindo que os demais membros continuem aparecendo.
   */
  player: Player | null;
}

/**
 * Unidade retornada no array `troops` da Player API.
 *
 * A API utiliza esse mesmo formato para diferentes
 * categorias de unidades, incluindo tropas, supertropas,
 * máquinas de cerco, pets e unidades da Base do Construtor.
 */
export interface PlayerTroop {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
}

/**
 * Feitiço disponível para o jogador.
 */
export interface PlayerSpell {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
}
