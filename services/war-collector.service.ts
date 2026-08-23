/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/war-collector.service.ts
 *
 * Responsabilidade:
 * Coletar automaticamente as guerras dos clãs monitorados
 * pelo Command Center e persistir seu estado no War Archive.
 *
 * Estratégia:
 *
 * • consulta K.O.D. e K.O.D.rec;
 * • reutiliza getCurrentWar();
 * • arquiva preparação, guerra ativa e guerra encerrada;
 * • utiliza o upsert existente do War Archive;
 * • pode ser executado repetidamente sem duplicar guerras;
 * • registra falhas por clã sem interromper toda a coleta.
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

import { archiveCurrentWar } from "@/services/war-archive.service";
import { getCurrentWar } from "@/services/war.service";

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

export type WarCollectorClanResult = {
  clanName: string;

  clanTag: string;

  available: boolean;

  reason: "archived" | "notInWar" | "privateWarLog" | "unavailable" | "error";

  warKey?: string;

  result?: string;

  wars?: number;

  members?: number;

  attacks?: number;

  error?: string;
};

export type WarCollectorResult = {
  startedAt: string;

  finishedAt: string;

  clansProcessed: number;

  warsArchived: number;

  errors: number;

  clans: WarCollectorClanResult[];
};

/**
 * ==========================================================
 * COLETOR
 * ==========================================================
 */

export async function collectCurrentWars(): Promise<WarCollectorResult> {
  const startedAt = new Date().toISOString();

  const clans: WarCollectorClanResult[] = [];

  /**
   * Executamos sequencialmente.
   *
   * São apenas dois clãs e isso reduz pressão desnecessária
   * sobre a Clash API.
   */
  for (const clan of monitoredClans) {
    try {
      const currentWar = await getCurrentWar(clan.tag);

      /**
       * ====================================================
       * SEM GUERRA DISPONÍVEL
       * ====================================================
       */

      if (!currentWar.available) {
        clans.push({
          clanName: clan.name,

          clanTag: clan.tag,

          available: false,

          reason: currentWar.reason,
        });

        continue;
      }

      /**
       * ====================================================
       * ARCHIVE
       * ====================================================
       */

      const archive = archiveCurrentWar({
        war: currentWar.war,

        trackedClanTag: clan.tag,
      });

      clans.push({
        clanName: clan.name,

        clanTag: clan.tag,

        available: true,

        reason: "archived",

        warKey: archive.warKey,

        result: archive.result,

        wars: archive.wars,

        members: archive.members,

        attacks: archive.attacks,
      });
    } catch (error) {
      console.error("[Kings of Doom] Falha no War Collector:", {
        clanName: clan.name,

        clanTag: clan.tag,

        error,
      });

      clans.push({
        clanName: clan.name,

        clanTag: clan.tag,

        available: false,

        reason: "error",

        error: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    }
  }

  const finishedAt = new Date().toISOString();

  return {
    startedAt,

    finishedAt,

    clansProcessed: clans.length,

    warsArchived: clans.filter((clan) => clan.reason === "archived").length,

    errors: clans.filter((clan) => clan.reason === "error").length,

    clans,
  };
}
