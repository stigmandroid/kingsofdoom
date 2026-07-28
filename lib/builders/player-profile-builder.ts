// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// player-profile-builder.ts
//
// Localização:
// lib/builders/player-profile-builder.ts
//
// Responsabilidade:
// Converter dados de um membro retornado pela Clash API
// para o modelo interno PlayerProfile.
//
// Funcionalidades:
//
// - Desacoplar o domínio dos tipos da Clash API.
// - Normalizar dados recebidos da integração externa.
// - Inicializar dados históricos ainda indisponíveis.
// - Produzir um PlayerProfile válido.
//
// Dependências:
//
// - ClanMember.
// - PlayerProfile.
//
// Autor:
// stigmandroid
//
// Última atualização:
// 27/07/2026
//
// Versão:
// 0.1.0
//
// Status:
// 🧪 Experimental
// ==========================================================

import type { PlayerProfile } from "@/domain/player/PlayerProfile";
import type { ClanMember } from "@/types/clan";

/**
 * Converte um membro do clã retornado pela Clash API
 * para o modelo interno utilizado pelo domínio.
 *
 * O Builder não realiza chamadas HTTP, cálculos de
 * inteligência ou regras de apresentação.
 */
export function buildPlayerProfile(member: ClanMember): PlayerProfile {
  return {
    tag: member.tag,
    name: member.name,
    expLevel: member.expLevel,
    townHallLevel: member.townHallLevel,
    trophies: member.trophies,
    role: member.role,
    donations: member.donations,
    donationsReceived: member.donationsReceived,

    /**
     * O histórico começa zerado porque a Clash API
     * não fornece todo o histórico necessário.
     *
     * Futuramente estes dados serão preenchidos
     * utilizando persistência própria.
     */
    history: {
      wars: 0,
      attacks: 0,
      defenses: 0,
      stars: 0,
    },
  };
}

/**
 * Converte vários membros da Clash API em perfis
 * internos do Kings of Doom Command Center.
 */
export function buildPlayerProfiles(members: ClanMember[]): PlayerProfile[] {
  return members.map(buildPlayerProfile);
}
