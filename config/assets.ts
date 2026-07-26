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
