/**
 * Catálogo central dos clãs exibidos no Kings of Doom Command Center.
 *
 * Este arquivo concentra as informações necessárias para identificar
 * cada clã dentro do site e nas consultas à API do Clash of Clans.
 *
 * Para adicionar outro clã futuramente, basta incluir uma nova entrada
 * dentro do objeto "clans".
 */
export const clans = {
  /**
   * Clã principal Kings of Doom.
   *
   * O nome da propriedade "kod" também será usado como slug da URL:
   * /pt-BR/clans/kod
   */
  kod: {
    // Identificador amigável usado na URL.
    slug: "kod",

    // Nome que será exibido na interface do portal.
    name: "K.O.D.",

    // Tag oficial usada para consultar o clã na API do Clash of Clans.
    tag: "#2GQ2UC2PV",
  },

  /**
   * Segundo clã da família Kings of Doom.
   *
   * Será acessado por:
   * /pt-BR/clans/kod-rec
   */
  "kod-rec": {
    // Identificador amigável usado na URL.
    slug: "kod-rec",

    // Nome que será exibido na interface do portal.
    name: "K.O.D.rec",

    // Tag oficial usada para consultar o clã na API do Clash of Clans.
    tag: "#2RU9QG9CG",
  },
} as const;

/**
 * Cria automaticamente um tipo contendo apenas os slugs válidos.
 *
 * Resultado atual:
 * "kod" | "kod-rec"
 */
export type ClanSlug = keyof typeof clans;

/**
 * Retorna os dados de um clã a partir do slug recebido pela URL.
 *
 * Caso o slug não esteja cadastrado, a função retorna undefined.
 */
export function getClanBySlug(slug: string) {
  return clans[slug as ClanSlug];
}
