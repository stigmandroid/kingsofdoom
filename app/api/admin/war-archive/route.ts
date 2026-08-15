import { NextResponse } from "next/server";

import { isCwlArchiveRequestAuthorized } from "@/lib/security/cwl-archive-auth";
import { archiveCurrentWar } from "@/services/war-archive.service";
import { getCurrentWar } from "@/services/war.service";

const supportedClans = {
  kod: { name: "K.O.D.", tag: "#2GQ2UC2PV" },
  "kod-rec": { name: "K.O.D.rec", tag: "#2RU9QG9CG" },
} as const;

type SupportedClanSlug = keyof typeof supportedClans;

function isSupportedClanSlug(value: string): value is SupportedClanSlug {
  return value in supportedClans;
}

async function archiveClan(clanSlug: SupportedClanSlug) {
  const selectedClan = supportedClans[clanSlug];

  try {
    const result = await getCurrentWar(selectedClan.tag);

    if (!result.available) {
      return {
        slug: clanSlug,
        name: selectedClan.name,
        tag: selectedClan.tag,
        success: false,
        available: false,
        reason: result.reason,
      };
    }

    return {
      slug: clanSlug,
      name: selectedClan.name,
      tag: selectedClan.tag,
      success: true,
      available: true,
      archive: archiveCurrentWar({
        war: result.war,
        trackedClanTag: selectedClan.tag,
      }),
    };
  } catch (error) {
    return {
      slug: clanSlug,
      name: selectedClan.name,
      tag: selectedClan.tag,
      success: false,
      available: true,
      error: error instanceof Error ? error.message : "Erro desconhecido.",
    };
  }
}

export async function POST(request: Request) {
  try {
    if (!isCwlArchiveRequestAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Não autorizado." },
        { status: 401 },
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Proteção administrativa não configurada." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const requestedClan = url.searchParams.get("clan");

  if (requestedClan) {
    if (!isSupportedClanSlug(requestedClan)) {
      return NextResponse.json(
        { success: false, error: "Clã inválido." },
        { status: 400 },
      );
    }

    const result = await archiveClan(requestedClan);

    return NextResponse.json(
      { success: result.success, mode: "single", results: [result] },
      { status: result.success ? 200 : result.available ? 500 : 404 },
    );
  }

  const clanSlugs = Object.keys(supportedClans) as SupportedClanSlug[];
  const results = await Promise.all(clanSlugs.map(archiveClan));

  const failures = results.filter((r) => !r.success && r.available !== false);
  const archived = results.filter((r) => r.success);
  const success = failures.length === 0;

  return NextResponse.json(
    {
      success,
      mode: "all",
      expectedClans: clanSlugs.length,
      archivedClans: archived.length,
      unavailableClans: results.length - archived.length - failures.length,
      failedClans: failures.length,
      results,
    },
    { status: success ? 200 : 207 },
  );
}
