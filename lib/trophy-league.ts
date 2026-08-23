/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/trophy-league.ts
 *
 * Responsabilidade:
 * Centralizar as regras utilizadas pelo Player Intelligence
 * para interpretar a Liga de Troféus de um jogador.
 *
 * A estrutura separa:
 * • posição estrutural na liga;
 * • contribuição-base da liga;
 * • pontuação atual da temporada;
 * • contribuição estimada para o Clan Score.
 *
 * A contribuição adicional da Legend I foi identificada
 * empiricamente através da comparação entre jogadores reais
 * e o Clan Score observado.
 *
 * Como a Clash API não retorna diretamente o peso individual
 * aplicado ao Clan Score, esse valor deve permanecer marcado
 * como estimativa calculada pelo Command Center.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

/**
 * Resultado da interpretação da Liga de Troféus.
 */
export type TrophyLeagueContribution = {
  /**
   * Nome da liga retornada pela Clash API.
   */
  leagueName: string;

  /**
   * Valor estrutural associado à liga.
   */
  baseScore: number;

  /**
   * Pontuação atual retornada pela Player API.
   *
   * Esse valor representa a atividade/performance da
   * temporada e não deve ser confundido com o valor-base.
   */
  seasonalScore: number;

  /**
   * Contribuição estimada utilizada pelo Command Center.
   *
   * Para Legend I:
   *
   * baseScore + seasonalScore
   *
   * Para as demais ligas:
   *
   * baseScore
   */
  estimatedClanContribution: number;

  /**
   * Informa se o jogador está atualmente na Legend I.
   */
  isLegendOne: boolean;

  /**
   * Indica a origem da regra utilizada no cálculo.
   */
  calculationSource:
    | "official-base"
    | "official-base-plus-empirical-legend-i"
    | "unranked"
    | "unknown";

  /**
   * Situação atual do jogador no sistema ranqueado.
   *
   * ranked:
   * jogador possui uma liga ativa.
   *
   * unranked:
   * jogador não possui escudo/liga ativa no momento.
   *
   * unknown:
   * a API retornou uma liga que ainda não está cadastrada
   * no Command Center.
   */
  status: "ranked" | "unranked" | "unknown";
};

/**
 * ==========================================================
 * CONTRIBUIÇÃO-BASE DAS LIGAS
 * ==========================================================
 *
 * Os nomes devem acompanhar o formato retornado pelo sistema
 * atual de Ranked Leagues.
 */
export const TROPHY_LEAGUE_BASE_SCORE: Record<string, number> = {
  "Skeleton League 1": 100,
  "Skeleton League 2": 200,
  "Skeleton League 3": 300,

  "Barbarian League 4": 400,
  "Barbarian League 5": 500,
  "Barbarian League 6": 600,

  "Archer League 7": 700,
  "Archer League 8": 800,
  "Archer League 9": 900,

  "Wizard League 10": 1000,
  "Wizard League 11": 1100,
  "Wizard League 12": 1200,

  "Valkyrie League 13": 1300,
  "Valkyrie League 14": 1400,
  "Valkyrie League 15": 1500,

  "Witch League 16": 1600,
  "Witch League 17": 1700,
  "Witch League 18": 1800,

  "Golem League 19": 1900,
  "Golem League 20": 2000,
  "Golem League 21": 2100,

  "P.E.K.K.A League 22": 2200,
  "P.E.K.K.A League 23": 2300,
  "P.E.K.K.A League 24": 2400,

  "Titan League 25": 2500,
  "Titan League 26": 2750,
  "Titan League 27": 3000,

  "Dragon League 28": 3250,
  "Dragon League 29": 3500,
  "Dragon League 30": 3750,

  "Electro League 31": 4000,
  "Electro League 32": 4250,
  "Electro League 33": 4500,

  /**
   * A documentação de Clan Score agrupa a Liga Lendária
   * sob uma contribuição-base de 5.000.
   *
   * Mantemos os três tiers explicitamente cadastrados porque
   * a Player API os retorna separadamente.
   */

  "Legend III": 5000,
  "Legend II": 5000,
  "Legend I": 5000,
};

/**
 * Recupera somente a contribuição-base de uma liga.
 */
export function getTrophyLeagueBaseScore(
  leagueName: string | undefined,
): number {
  if (!leagueName) {
    return 0;
  }

  return TROPHY_LEAGUE_BASE_SCORE[leagueName] ?? 0;
}

/**
 * Calcula a interpretação atual da Liga de Troféus.
 *
 * Importante:
 *
 * Para Legend II e Legend III, a pontuação sazonal continua
 * sendo mantida separadamente e não é adicionada ao peso-base.
 *
 * Para Legend I, os dados observados indicam que o Clan Score
 * considera:
 *
 * 5.000 pontos-base + rating atual da temporada.
 *
 * Como a API não expõe esse cálculo diretamente, o resultado
 * continua identificado como contribuição estimada.
 */
export function getTrophyLeagueContribution({
  leagueName,
  trophies,
}: {
  leagueName: string | undefined;
  trophies: number | undefined;
}): TrophyLeagueContribution {
  const normalizedLeagueName = leagueName?.trim() ?? "";

  const seasonalScore = Math.max(0, trophies ?? 0);

  /**
   * ========================================================
   * SEM LIGA ATIVA
   * ========================================================
   *
   * A Player API pode retornar jogadores sem leagueTier
   * quando eles ficam fora da Ranked por determinado período.
   *
   * Esse estado não deve ser confundido com uma liga ainda
   * desconhecida pelo nosso catálogo.
   */
  const isUnranked =
    !normalizedLeagueName ||
    normalizedLeagueName === "Sem liga" ||
    normalizedLeagueName === "Unranked";

  if (isUnranked) {
    return {
      leagueName: "Unranked",
      baseScore: 0,
      seasonalScore,
      estimatedClanContribution: 0,
      isLegendOne: false,
      status: "unranked",
      calculationSource: "unranked",
    };
  }

  const baseScore = getTrophyLeagueBaseScore(normalizedLeagueName);

  const isLegendOne = normalizedLeagueName === "Legend I";

  /**
   * Liga retornada pela API, porém ainda não cadastrada
   * na nossa tabela.
   *
   * Não inventamos contribuição.
   */
  if (baseScore === 0) {
    return {
      leagueName: normalizedLeagueName,
      baseScore: 0,
      seasonalScore,
      estimatedClanContribution: 0,
      isLegendOne: false,
      status: "unknown",
      calculationSource: "unknown",
    };
  }

  /**
   * Legend I possui tratamento especial identificado
   * empiricamente nos dados observados.
   */
  if (isLegendOne) {
    return {
      leagueName: normalizedLeagueName,
      baseScore,
      seasonalScore,
      estimatedClanContribution: baseScore + seasonalScore,
      isLegendOne: true,
      status: "ranked",
      calculationSource: "official-base-plus-empirical-legend-i",
    };
  }

  /**
   * Demais ligas reconhecidas.
   */
  return {
    leagueName: normalizedLeagueName,
    baseScore,
    seasonalScore,
    estimatedClanContribution: baseScore,
    isLegendOne: false,
    status: "ranked",
    calculationSource: "official-base",
  };
}
