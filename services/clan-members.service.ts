/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/clan-members.service.ts
 *
 * Responsabilidade:
 * Carregar os membros de um clã e enriquecer cada registro
 * com os dados individuais retornados pela Player API.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 * ==========================================================
 */

import { getPlayer } from "@/services/player.service";

import type { Clan, ClanMember } from "@/types/clan";
import type { ClanMemberWithPlayer } from "@/types/player";

/**
 * Enriquece a lista resumida de membros retornada pelo
 * endpoint do clã com os perfis individuais dos jogadores.
 *
 * Falhas individuais não interrompem o carregamento da lista.
 */
export async function getClanMembersWithPlayers(
  clan: Clan,
): Promise<ClanMemberWithPlayer<ClanMember>[]> {
  return Promise.all(
    clan.memberList.map(async (member) => {
      try {
        const player = await getPlayer(member.tag);

        return {
          member,
          player,
        };
      } catch (error) {
        console.error(
          `[Kings of Doom] Falha ao carregar o jogador ${member.tag}:`,
          error,
        );

        return {
          member,
          player: null,
        };
      }
    }),
  );
}
