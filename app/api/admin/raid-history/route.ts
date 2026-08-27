/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/raid-history/route.ts
 *
 * Responsabilidade:
 * Expor temporariamente o histórico persistido de Raid
 * Weekend para validação do Event Intelligence.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🧪 Diagnóstico
 * ==========================================================
 */

import { NextResponse } from "next/server";

import {
  getLatestRaidWeekend,
  getRaidWeekendHistory,
} from "@/services/raid-history.service";

const clanTagBySlug = {
  kod: "#2GQ2UC2PV",
  "kod-rec": "#2RU9QG9CG",
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);

  const clanSlug = url.searchParams.get("clan") ?? "kod";

  const clanTag = clanTagBySlug[clanSlug as keyof typeof clanTagBySlug];

  if (!clanTag) {
    return NextResponse.json(
      {
        success: false,
        error: "Clã inválido.",
      },
      {
        status: 400,
      },
    );
  }

  const latest = getLatestRaidWeekend(clanTag);

  const history = getRaidWeekendHistory(clanTag, 10);

  return NextResponse.json({
    success: true,

    data: {
      clanTag,

      latest,

      history,
    },
  });
}
