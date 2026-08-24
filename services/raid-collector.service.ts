/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/raid-collector.service.ts
 *
 * Responsabilidade:
 * Coletar os Raid Weekends recentes dos clãs monitorados
 * e persistir seus dados no Raid Archive.
 *
 * Estratégia:
 *
 * - monitorar K.O.D. e K.O.D.rec;
 * - consultar os três Raid Weekends mais recentes;
 * - arquivar o evento e seus participantes;
 * - permitir recuperação de pequenos períodos perdidos;
 * - continuar funcionando mesmo se um dos clãs falhar.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 23/08/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { archiveRaidWeekend } from "@/services/raid-archive.service";

import { getRaidWeekends } from "@/services/raid.service";

/**
 * ==========================================================
 * CLÃS MONITORADOS
 * ==========================================================
 */

const monitoredClans = [
  {
    name: "K.O.D.",
    tag: "#2GQ2UC2PV",
  },

  {
    name: "K.O.D.rec",
    tag: "#2RU9QG9CG",
  },
] as const;

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type RaidCollectorClanResult = {
  clanName: string;

  clanTag: string;

  weekendsArchived: number;

  membersProcessed: number;

  error: string | null;
};

export type RaidCollectorResult = {
  startedAt: string;

  finishedAt: string;

  clansProcessed: number;

  weekendsArchived: number;

  membersProcessed: number;

  errors: number;

  clans: RaidCollectorClanResult[];
};

/**
 * ==========================================================
 * COLETOR PRINCIPAL
 * ==========================================================
 */

export async function collectRaidWeekends(): Promise<RaidCollectorResult> {
  const startedAt = new Date().toISOString();

  const clans: RaidCollectorClanResult[] = [];

  /**
   * Executamos sequencialmente porque monitoramos
   * apenas dois clãs.
   *
   * Isso também reduz pressão desnecessária sobre
   * a Clash API.
   */
  for (const clan of monitoredClans) {
    try {
      /**
       * Buscamos os três eventos mais recentes.
       *
       * Dessa forma conseguimos recuperar um pequeno
       * histórico caso o collector tenha ficado fora
       * durante algum fim de semana.
       */
      const raids = await getRaidWeekends(clan.tag, 3);

      let membersProcessed = 0;

      for (const raid of raids) {
        const archived = archiveRaidWeekend({
          clanTag: clan.tag,

          raid,
        });

        membersProcessed += archived.members;
      }

      clans.push({
        clanName: clan.name,

        clanTag: clan.tag,

        weekendsArchived: raids.length,

        membersProcessed,

        error: null,
      });
    } catch (error) {
      console.error("[Kings of Doom] Falha no Raid Collector:", {
        clanName: clan.name,

        clanTag: clan.tag,

        error,
      });

      clans.push({
        clanName: clan.name,

        clanTag: clan.tag,

        weekendsArchived: 0,

        membersProcessed: 0,

        error: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    }
  }

  const finishedAt = new Date().toISOString();

  return {
    startedAt,

    finishedAt,

    clansProcessed: clans.length,

    weekendsArchived: clans.reduce(
      (total, clan) => total + clan.weekendsArchived,
      0,
    ),

    membersProcessed: clans.reduce(
      (total, clan) => total + clan.membersProcessed,
      0,
    ),

    errors: clans.filter((clan) => clan.error !== null).length,

    clans,
  };
}
