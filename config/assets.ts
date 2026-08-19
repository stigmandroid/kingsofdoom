/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * config/assets.ts
 *
 * Responsabilidade:
 * Centralizar os caminhos e os ajustes visuais dos recursos
 * gráficos utilizados pela aplicação.
 *
 * Cada Centro de Vila pode possuir uma escala própria,
 * permitindo que todas as imagens tenham aproximadamente
 * o mesmo peso visual sem perder sua proporção original.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

/**
 * Representa a configuração visual de uma imagem de
 * Centro de Vila.
 */
export type TownHallAsset = {
  /**
   * Caminho público da imagem.
   */
  src: string;

  /**
   * Texto alternativo utilizado por tecnologias assistivas.
   */
  alt: string;

  /**
   * Fator de escala aplicado somente à imagem.
   *
   * Exemplos:
   *
   * 1    = tamanho normal;
   * 1.1  = 10% maior;
   * 0.9  = 10% menor.
   */
  scale: number;

  /**
   * Ajuste horizontal opcional.
   *
   * Valores positivos movem a imagem para a direita.
   * Valores negativos movem para a esquerda.
   */
  translateX?: number;

  /**
   * Ajuste vertical opcional.
   *
   * Valores positivos movem a imagem para baixo.
   * Valores negativos movem para cima.
   */
  translateY?: number;
};

/**
 * Configuração centralizada das imagens dos Centros de Vila.
 *
 * Os valores de escala abaixo são um ponto inicial.
 * Eles podem ser ajustados visualmente durante os testes.
 */
export const townHallAssets = {
  12: {
    src: "/town-halls/th-12.webp",
    alt: "Centro de Vila nível 12",
    scale: 1,
  },

  13: {
    src: "/town-halls/th-13.webp",
    alt: "Centro de Vila nível 13",
    scale: 1.13,
  },

  14: {
    src: "/town-halls/th-14.webp",
    alt: "Centro de Vila nível 14",
    scale: 1.08,
  },

  15: {
    src: "/town-halls/th-15.webp",
    alt: "Centro de Vila nível 15",
    scale: 1.06,
  },

  16: {
    src: "/town-halls/th-16.webp",
    alt: "Centro de Vila nível 16",
    scale: 1.02,
  },

  17: {
    src: "/town-halls/th-17.webp",
    alt: "Centro de Vila nível 17",
    scale: 0.94,
  },

  18: {
    src: "/town-halls/th-18.webp",
    alt: "Centro de Vila nível 18",
    scale: 1.04,
    translateY: 1,
  },
} as const satisfies Record<number, TownHallAsset>;

/**
 * Tipo composto pelos níveis que possuem uma imagem
 * configurada no projeto.
 */
export type SupportedTownHallLevel = keyof typeof townHallAssets;

/**
 * Verifica se um nível possui uma imagem configurada.
 *
 * O type predicate informa ao TypeScript que, após essa
 * validação, o nível pode ser utilizado com segurança para
 * acessar townHallAssets.
 */
export function isSupportedTownHallLevel(
  level: number,
): level is SupportedTownHallLevel {
  return level in townHallAssets;
}

/**
 * Retorna a configuração visual de um Centro de Vila.
 *
 * Quando o nível ainda não estiver cadastrado, a função
 * retorna undefined e o componente poderá apresentar um
 * fallback textual.
 */
export function getTownHallAsset(level: number): TownHallAsset | undefined {
  if (!isSupportedTownHallLevel(level)) {
    return undefined;
  }

  return townHallAssets[level];
}

/**
 * ==========================================================
 * PLAYER ASSETS
 * ==========================================================
 */

/**
 * Configuração visual genérica para recursos do jogo.
 *
 * O mesmo contrato poderá ser reutilizado futuramente para
 * heróis, equipamentos, tropas, feitiços, pets e máquinas
 * de cerco.
 */
export type GameAsset = {
  src: string;
  alt: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
};

/**
 * Recursos visuais dos heróis da Vila Principal.
 *
 * As chaves correspondem exatamente aos nomes retornados
 * pela Clash of Clans API.
 */
export const heroAssets: Record<string, GameAsset> = {
  "Barbarian King": {
    src: "/game-assets/heroes/barbarian-king.png",
    alt: "Rei Bárbaro",
  },

  "Archer Queen": {
    src: "/game-assets/heroes/archer-queen.png",
    alt: "Rainha Arqueira",
  },

  "Grand Warden": {
    src: "/game-assets/heroes/grand-warden.png",
    alt: "Grande Guardião",
  },

  "Royal Champion": {
    src: "/game-assets/heroes/royal-champion.png",
    alt: "Campeã Real",
  },

  "Minion Prince": {
    src: "/game-assets/heroes/minion-prince.png",
    alt: "Príncipe Servo",
  },

  "Dragon Duke": {
    src: "/game-assets/heroes/dragon-duke.png",
    alt: "Duque Dracônico",
  },
};

/**
 * Recupera o recurso visual correspondente ao herói.
 */
export function getHeroAsset(
  heroName: string | undefined,
): GameAsset | undefined {
  if (!heroName) {
    return undefined;
  }

  return heroAssets[heroName];
}

/**
 * ==========================================================
 * EQUIPAMENTOS DE HERÓI
 * ==========================================================
 */

/**
 * Raridades atualmente utilizadas pelos equipamentos de
 * herói.
 *
 * A raridade pertence ao catálogo visual e não deve ser
 * inferida pelo componente responsável pela apresentação.
 */
export type EquipmentRarity = "common" | "epic";

/**
 * Representa um asset específico de equipamento de herói.
 *
 * Além das propriedades visuais genéricas, cada equipamento
 * possui sua raridade explicitamente cadastrada.
 */
export type EquipmentAsset = GameAsset & {
  /**
   * Raridade oficial do equipamento.
   */
  rarity: EquipmentRarity;
};

/**
 * Catálogo visual dos equipamentos de herói.
 *
 * As chaves correspondem exatamente aos nomes retornados
 * pela Clash of Clans API.
 *
 * Estratégia:
 *
 * • common = equipamento comum;
 * • epic   = equipamento épico.
 *
 * A raridade permanece explícita para evitar que a interface
 * dependa do nível máximo atual do equipamento.
 */
export const equipmentAssets: Record<string, EquipmentAsset> = {
  /**
   * ========================================================
   * EQUIPAMENTOS ÉPICOS
   * ========================================================
   */

  "Giant Gauntlet": {
    src: "/game-assets/equipment/giant-gauntlet.png",
    alt: "Manopla Gigante",
    rarity: "epic",
  },

  "Rocket Spear": {
    src: "/game-assets/equipment/rocket-spear-v2.png",
    alt: "Lança-Foguetes",
    rarity: "epic",
  },

  "Spiky Ball": {
    src: "/game-assets/equipment/spiky-ball.png",
    alt: "Bola Espinhosa",
    rarity: "epic",
  },

  "Frozen Arrow": {
    src: "/game-assets/equipment/frozen-arrow.png",
    alt: "Flecha Congelada",
    rarity: "epic",
  },

  "Monolith Arrow": {
    src: "/game-assets/equipment/monolith-arrow.png",
    alt: "Flecha Monolítica",
    rarity: "epic",
  },

  "Heroic Torch": {
    src: "/game-assets/equipment/heroic-torch.png",
    alt: "Tocha Heroica",
    rarity: "epic",
  },

  Fireball: {
    src: "/game-assets/equipment/fireball.png",
    alt: "Bola de Fogo",
    rarity: "epic",
  },

  "Snake Bracelet": {
    src: "/game-assets/equipment/snake-bracelet.png",
    alt: "Bracelete de Cobra",
    rarity: "epic",
  },

  "Dark Crown": {
    src: "/game-assets/equipment/dark-crown.png",
    alt: "Coroa Sombria",
    rarity: "epic",
  },

  "Magic Mirror": {
    src: "/game-assets/equipment/magic-mirror.png",
    alt: "Espelho Mágico",
    rarity: "epic",
  },

  "Electro Boots": {
    src: "/game-assets/equipment/electro-boots.png",
    alt: "Botas Elétricas",
    rarity: "epic",
  },

  "Lavaloon Puppet": {
    src: "/game-assets/equipment/lavaloon-puppet.png",
    alt: "Fantoche Lavaloon",
    rarity: "epic",
  },

  "Action Figure": {
    src: "/game-assets/equipment/action-figure.png",
    alt: "Boneco de Ação",
    rarity: "epic",
  },

  "Meteor Staff": {
    src: "/game-assets/equipment/meteor-staff.png",
    alt: "Cajado Meteórico",
    rarity: "epic",
  },

  "Frost Flake": {
    src: "/game-assets/equipment/frost-flake.png",
    alt: "Floco de Gelo",
    rarity: "epic",
  },

  "Stick Horse": {
    src: "/game-assets/equipment/stick-horse.png",
    alt: "Cavalo de Pau",
    rarity: "epic",
  },

  "Rocket Backpack": {
    src: "/game-assets/equipment/rocket-backpack.png",
    alt: "Mochila-Foguete",
    rarity: "epic",
  },

  "Revenge Deck": {
    src: "/game-assets/equipment/revenge-deck.png",
    alt: "Baralho Vingativo",
    rarity: "epic",
  },

  /**
   * ========================================================
   * EQUIPAMENTOS COMUNS
   * ========================================================
   */

  "Barbarian Puppet": {
    src: "/game-assets/equipment/barbarian-puppet.png",
    alt: "Fantoche Bárbaro",
    rarity: "common",
  },

  "Rage Vial": {
    src: "/game-assets/equipment/rage-vial.png",
    alt: "Frasco de Fúria",
    rarity: "common",
  },

  "Archer Puppet": {
    src: "/game-assets/equipment/archer-puppet.png",
    alt: "Fantoche de Arqueira",
    rarity: "common",
  },

  "Invisibility Vial": {
    src: "/game-assets/equipment/invisibility-vial.png",
    alt: "Frasco de Invisibilidade",
    rarity: "common",
  },

  "Eternal Tome": {
    src: "/game-assets/equipment/eternal-tome.png",
    alt: "Tomo Eterno",
    rarity: "common",
  },

  "Life Gem": {
    src: "/game-assets/equipment/life-gem.png",
    alt: "Gema da Vida",
    rarity: "common",
  },

  "Seeking Shield": {
    src: "/game-assets/equipment/seeking-shield.png",
    alt: "Escudo Rastreador",
    rarity: "common",
  },

  "Royal Gem": {
    src: "/game-assets/equipment/royal-gem.png",
    alt: "Gema Real",
    rarity: "common",
  },

  "Earthquake Boots": {
    src: "/game-assets/equipment/earthquake-boots.png",
    alt: "Botas de Terremoto",
    rarity: "common",
  },

  "Hog Rider Puppet": {
    src: "/game-assets/equipment/hog-rider-puppet.png",
    alt: "Fantoche de Corredor",
    rarity: "common",
  },

  Vampstache: {
    src: "/game-assets/equipment/vampstache.png",
    alt: "Bigode Vampírico",
    rarity: "common",
  },

  "Haste Vial": {
    src: "/game-assets/equipment/haste-vial.png",
    alt: "Frasco de Aceleração",
    rarity: "common",
  },

  "Giant Arrow": {
    src: "/game-assets/equipment/giant-arrow.png",
    alt: "Flecha Gigante",
    rarity: "common",
  },

  "Healer Puppet": {
    src: "/game-assets/equipment/healer-puppet.png",
    alt: "Fantoche de Curadora",
    rarity: "common",
  },

  "Rage Gem": {
    src: "/game-assets/equipment/rage-gem.png",
    alt: "Gema de Fúria",
    rarity: "common",
  },

  "Healing Tome": {
    src: "/game-assets/equipment/healing-tome.png",
    alt: "Tomo de Cura",
    rarity: "common",
  },

  "Henchmen Puppet": {
    src: "/game-assets/equipment/henchmen-puppet.png",
    alt: "Fantoche de Capangas",
    rarity: "common",
  },

  "Dark Orb": {
    src: "/game-assets/equipment/dark-orb.png",
    alt: "Orbe Sombrio",
    rarity: "common",
  },

  "Metal Pants": {
    src: "/game-assets/equipment/metal-pants.png",
    alt: "Calças Metálicas",
    rarity: "common",
  },

  /**
   * Noble Iron ainda não possui asset visual validado.
   *
   * Por esse motivo, ele não é cadastrado aqui nesta etapa.
   * O EquipmentTile utilizará seu fallback visual.
   */

  "Fire Heart": {
    src: "/game-assets/equipment/fire-heart.png",
    alt: "Coração de Fogo",
    rarity: "common",
  },

  "Stun Blaster": {
    src: "/game-assets/equipment/stun-blaster.png",
    alt: "Canhão Atordoante",
    rarity: "common",
  },

  "Flame Blower": {
    src: "/game-assets/equipment/flame-blower.png",
    alt: "Soprador de Chamas",
    rarity: "common",
  },

  "Electro Fangs": {
    src: "/game-assets/equipment/electro-fangs.png",
    alt: "Presas Elétricas",
    rarity: "common",
  },
};

/**
 * Recupera o recurso visual correspondente ao equipamento.
 *
 * A função centraliza o acesso ao catálogo para impedir que
 * componentes da interface precisem conhecer diretamente os
 * caminhos dos arquivos ou suas raridades.
 *
 * @param equipmentName Nome retornado pela Player API.
 * @returns Configuração visual ou undefined.
 */
export function getEquipmentAsset(
  equipmentName: string | undefined,
): EquipmentAsset | undefined {
  if (!equipmentName) {
    return undefined;
  }

  return equipmentAssets[equipmentName];
}
