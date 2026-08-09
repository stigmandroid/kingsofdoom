/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/cwl/calculate-season-pass-eligibility.ts
 *
 * Responsabilidade:
 * Calcular quais jogadores estão elegíveis ao sorteio
 * do Passe de Temporada da CWL.
 *
 * Regra de elegibilidade:
 *
 * - participou de pelo menos uma guerra;
 * - realizou todos os ataques disponíveis nas guerras
 *   em que participou;
 * - conquistou 3 estrelas em todos os ataques;
 * - alcançou 100% de destruição em todos os ataques.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";
import type { WarMember } from "@/types/war";

/**
 * Resultado consolidado de um jogador elegível.
 */
export type SeasonPassEligiblePlayer = {
  tag: string;
  name: string;

  /**
   * Quantidade de guerras em que o jogador participou.
   */
  warsPlayed: number;

  /**
   * Quantidade total de ataques realizados.
   */
  attacksUsed: number;

  /**
   * Quantidade total de ataques disponíveis.
   */
  attacksAvailable: number;

  /**
   * Total de estrelas conquistadas.
   */
  stars: number;

  /**
   * Soma da destruição obtida em todos os ataques.
   *
   * Exemplo:
   * 5 ataques perfeitos = 500%.
   */
  destruction: number;
};

/**
 * Estrutura interna utilizada durante o cálculo.
 */
type PlayerAccumulator = {
  tag: string;
  name: string;

  warsPlayed: number;

  attacksUsed: number;
  attacksAvailable: number;

  stars: number;
  destruction: number;

  /**
   * Permanece true somente enquanto todos os ataques
   * realizados pelo jogador forem perfeitos.
   */
  allAttacksPerfect: boolean;

  /**
   * Permanece true somente enquanto o jogador realizar
   * todos os ataques disponíveis nas guerras disputadas.
   */
  usedAllAvailableAttacks: boolean;
};

/**
 * Calcula os jogadores elegíveis ao Passe de Temporada.
 *
 * Importante:
 * somente guerras encerradas são consideradas para
 * elegibilidade definitiva.
 */
export function calculateSeasonPassEligibility(
  wars: CwlRoundWar[],
  clanTag: string,
): SeasonPassEligiblePlayer[] {
  const players = new Map<string, PlayerAccumulator>();

  /**
   * Analisa todas as guerras já encerradas.
   */
  wars.forEach(({ war }) => {
    if (war.state !== "warEnded") {
      return;
    }

    /**
     * Descobre de qual lado está o clã de referência.
     */
    const clan =
      war.clan?.tag === clanTag
        ? war.clan
        : war.opponent?.tag === clanTag
          ? war.opponent
          : undefined;

    if (!clan) {
      return;
    }

    /**
     * Na CWL, cada jogador normalmente possui
     * um ataque disponível por guerra.
     *
     * Mantemos a informação baseada no contrato
     * retornado pela guerra para evitar regra fixa.
     */
    const attacksPerMember = war.attacksPerMember ?? 1;

    clan.members.forEach((member) => {
      processMember({
        member,
        attacksPerMember,
        players,
      });
    });
  });

  /**
   * Regra de elegibilidade:
   *
   * - participou de pelo menos 3 guerras;
   * - realizou todos os ataques disponíveis;
   * - conquistou 3 estrelas em todos os ataques;
   * - alcançou 100% de destruição em todos os ataques;
   * - acumulou no mínimo 9 estrelas.
   */
  return [...players.values()]
    .filter(
      (player) =>
        /**
         * Participação mínima:
         * pelo menos 3 guerras disputadas.
         */
        player.warsPlayed >= 3 &&
        /**
         * Precisa ter utilizado todos os ataques
         * disponíveis nas guerras em que participou.
         */
        player.usedAllAvailableAttacks &&
        /**
         * Todos os ataques realizados precisam
         * ter sido perfeitos.
         */
        player.allAttacksPerfect &&
        /**
         * Confirma que não deixou ataques pendentes.
         */
        player.attacksUsed === player.attacksAvailable &&
        /**
         * Participação mínima equivalente a
         * três ataques perfeitos.
         */
        player.stars >= 9,
    )
    .map((player) => ({
      tag: player.tag,
      name: player.name,

      warsPlayed: player.warsPlayed,

      attacksUsed: player.attacksUsed,
      attacksAvailable: player.attacksAvailable,

      stars: player.stars,
      destruction: player.destruction,
    }))
    .sort((a, b) => {
      /**
       * Primeiro mostramos quem participou de mais guerras.
       */
      if (b.warsPlayed !== a.warsPlayed) {
        return b.warsPlayed - a.warsPlayed;
      }

      /**
       * Depois ordenamos alfabeticamente.
       */
      return a.name.localeCompare(b.name);
    });
}

/**
 * Processa um jogador participante de uma guerra encerrada.
 */
function processMember({
  member,
  attacksPerMember,
  players,
}: {
  member: WarMember;
  attacksPerMember: number;
  players: Map<string, PlayerAccumulator>;
}) {
  const attacks = member.attacks ?? [];

  const existing = players.get(member.tag);

  const accumulator: PlayerAccumulator = existing ?? {
    tag: member.tag,
    name: member.name,

    warsPlayed: 0,

    attacksUsed: 0,
    attacksAvailable: 0,

    stars: 0,
    destruction: 0,

    allAttacksPerfect: true,
    usedAllAvailableAttacks: true,
  };

  /**
   * O jogador participou desta guerra porque aparece
   * entre os membros da escalação.
   */
  accumulator.warsPlayed += 1;

  accumulator.attacksAvailable += attacksPerMember;
  accumulator.attacksUsed += attacks.length;

  /**
   * Se deixou qualquer ataque disponível sem usar,
   * perde a elegibilidade.
   */
  if (attacks.length !== attacksPerMember) {
    accumulator.usedAllAvailableAttacks = false;
  }

  attacks.forEach((attack) => {
    accumulator.stars += attack.stars;
    accumulator.destruction += attack.destructionPercentage;

    /**
     * Ataque perfeito:
     *
     * 3 estrelas + 100% de destruição.
     */
    const perfectAttack =
      attack.stars === 3 && attack.destructionPercentage === 100;

    if (!perfectAttack) {
      accumulator.allAttacksPerfect = false;
    }
  });

  players.set(member.tag, accumulator);
}
