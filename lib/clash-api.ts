import type { Clan } from "@/types/clan";
import type { CurrentWar, CurrentWarResult } from "@/types/war";

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

type ClashApiError = {
  reason?: string;
  message?: string;
};

function getClashApiConfiguration() {
  const token = process.env.CLASH_API_TOKEN;
  const clanTag = process.env.CLASH_CLAN_TAG;

  if (!token) {
    throw new Error(
      "A variável CLASH_API_TOKEN não foi configurada no arquivo .env.local.",
    );
  }

  if (!clanTag) {
    throw new Error(
      "A variável CLASH_CLAN_TAG não foi configurada no arquivo .env.local.",
    );
  }

  return {
    token,
    encodedClanTag: encodeURIComponent(clanTag),
  };
}

async function readApiError(response: Response) {
  const error = (await response
    .json()
    .catch(() => null)) as ClashApiError | null;

  return (
    error?.message ??
    error?.reason ??
    `A API respondeu com o status ${response.status}.`
  );
}

export async function getClan(): Promise<Clan> {
  const { token, encodedClanTag } = getClashApiConfiguration();

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodedClanTag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    const reason = await readApiError(response);

    throw new Error(`Não foi possível carregar o clã: ${reason}`);
  }

  return response.json() as Promise<Clan>;
}

export async function getCurrentWar(): Promise<CurrentWarResult> {
  const { token, encodedClanTag } = getClashApiConfiguration();

  const response = await fetch(
    `${CLASH_API_BASE_URL}/clans/${encodedClanTag}/currentwar`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (response.status === 403) {
    return {
      available: false,
      reason: "privateWarLog",
    };
  }

  if (!response.ok) {
    return {
      available: false,
      reason: "unavailable",
    };
  }

  const war = (await response.json()) as CurrentWar;

  if (war.state === "notInWar") {
    return {
      available: false,
      reason: "notInWar",
    };
  }

  return {
    available: true,
    war,
  };
}
