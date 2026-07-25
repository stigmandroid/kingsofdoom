import type { Clan } from "@/types/clan";

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

type ClashApiError = {
  reason?: string;
  message?: string;
};

export async function getClan(): Promise<Clan> {
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

  const encodedClanTag = encodeURIComponent(clanTag);

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
    const error = (await response
      .json()
      .catch(() => null)) as ClashApiError | null;

    const reason =
      error?.message ??
      error?.reason ??
      `A API respondeu com o status ${response.status}.`;

    throw new Error(`Não foi possível carregar o clã: ${reason}`);
  }

  return response.json() as Promise<Clan>;
}