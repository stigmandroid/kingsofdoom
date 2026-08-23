/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/trophy-league-score-audit/route.ts
 *
 * Responsabilidade:
 * Validar o Clan Score calculado internamente pelo Command
 * Center contra o clanPoints oficial retornado pela Clash API.
 *
 * A rota:
 *
 * • consulta K.O.D. e K.O.D.rec;
 * • recupera o clanPoints oficial;
 * • calcula o Top 30 através dos snapshots persistidos;
 * • compara os dois valores;
 * • informa diferença e status da validação.
 *
 * Objetivo:
 * detectar rapidamente qualquer alteração futura na regra
 * de composição do Clan Score utilizada pela Supercell.
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

import { NextResponse } from "next/server";

import { getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";

import { validateTrophyLeagueClanScore } from "@/services/trophy-league-clan-score.service";

/**
 * ==========================================================
 * GET
 * ==========================================================
 */

/**
 * Executa a auditoria do Clan Score para todos os clãs
 * atualmente acompanhados pelo Command Center.
 */
export async function GET() {
  try {
    /**
     * ========================================================
     * CONFIGURAÇÃO DOS CLÃS
     * ========================================================
     */

    const kod = getClanBySlug("kod");

    const kodRec = getClanBySlug("kod-rec");

    if (!kod || !kodRec) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível localizar as configurações dos clãs acompanhados.",
        },
        {
          status: 500,
        },
      );
    }

    /**
     * ========================================================
     * CLASH API
     * ========================================================
     *
     * As duas consultas são executadas em paralelo para evitar
     * tempo de espera desnecessário.
     */

    const [kodClan, kodRecClan] = await Promise.all([
      getClan(kod.tag),
      getClan(kodRec.tag),
    ]);

    /**
     * ========================================================
     * VALIDAÇÃO
     * ========================================================
     */

    const kodValidation = validateTrophyLeagueClanScore({
      clanTag: kod.tag,

      officialClanPoints: kodClan.clanPoints,
    });

    const kodRecValidation = validateTrophyLeagueClanScore({
      clanTag: kodRec.tag,

      officialClanPoints: kodRecClan.clanPoints,
    });

    /**
     * ========================================================
     * RESUMO
     * ========================================================
     */

    const allMatches =
      kodValidation.matchesOfficialScore &&
      kodRecValidation.matchesOfficialScore;

    return NextResponse.json({
      success: true,

      data: {
        validatedAt: new Date().toISOString(),

        allMatches,

        clans: [
          {
            clanName: kodClan.name,

            clanTag: kodClan.tag,

            members: kodClan.members,

            calculatedClanScore: kodValidation.calculatedClanScore,

            officialClanPoints: kodValidation.officialClanPoints,

            difference: kodValidation.difference,

            matchesOfficialScore: kodValidation.matchesOfficialScore,

            countedPlayers: kodValidation.countedPlayers,

            totalPlayers: kodValidation.totalPlayers,
          },

          {
            clanName: kodRecClan.name,

            clanTag: kodRecClan.tag,

            members: kodRecClan.members,

            calculatedClanScore: kodRecValidation.calculatedClanScore,

            officialClanPoints: kodRecValidation.officialClanPoints,

            difference: kodRecValidation.difference,

            matchesOfficialScore: kodRecValidation.matchesOfficialScore,

            countedPlayers: kodRecValidation.countedPlayers,

            totalPlayers: kodRecValidation.totalPlayers,
          },
        ],
      },
    });
  } catch (error) {
    console.error("[TROPHY LEAGUE SCORE AUDIT]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível validar o Clan Score da Liga de Troféus.",
      },
      {
        status: 500,
      },
    );
  }
}
