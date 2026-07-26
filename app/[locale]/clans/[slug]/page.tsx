/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/clans/[slug]/page.tsx
 *
 * Responsabilidade:
 * Renderizar o painel de um clã com base no slug informado
 * na URL.
 *
 * A página consulta:
 * • dados gerais do clã;
 * • guerra atual;
 * • dados individuais de cada membro.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import { notFound } from "next/navigation";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { clans, getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getPlayer } from "@/services/player.service";
import { getCurrentWar } from "@/services/war.service";
import type { ClanMemberWithPlayer } from "@/types/player";

type ClanPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Gera antecipadamente as combinações conhecidas de idioma
 * e clã durante o processo de build.
 */
export function generateStaticParams() {
  const locales = ["pt-BR", "en", "es"];

  return locales.flatMap((locale) =>
    Object.values(clans).map((clan) => ({
      locale,
      slug: clan.slug,
    })),
  );
}

/**
 * Renderiza o painel do clã correspondente ao slug da URL.
 */
export default async function ClanPage({ params }: ClanPageProps) {
  const { slug } = await params;

  /**
   * Localiza as configurações do clã por meio do slug.
   */
  const clanConfig = getClanBySlug(slug);

  if (!clanConfig) {
    notFound();
  }

  /**
   * Os dados gerais do clã e da guerra atual são consultados
   * simultaneamente.
   */
  const [clan, currentWar] = await Promise.all([
    getClan(clanConfig.tag),
    getCurrentWar(clanConfig.tag),
  ]);

  /**
   * Consulta individualmente cada jogador.
   *
   * As requisições são realizadas em paralelo para evitar
   * que o tempo total seja a soma de todas as consultas.
   *
   * Cada erro é tratado isoladamente. Assim, caso um perfil
   * específico não possa ser carregado, os demais membros
   * continuam sendo apresentados normalmente.
   */
  const membersWithPlayers: ClanMemberWithPlayer<
    (typeof clan.memberList)[number]
  >[] = await Promise.all(
    clan.memberList.map(async (member) => {
      try {
        const player = await getPlayer(member.tag);

        return {
          member,
          player,
        };
      } catch (error) {
        /**
         * O erro é registrado apenas no servidor.
         *
         * O card utilizará os dados resumidos do clã como
         * fallback para esse jogador.
         */
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Dashboard
        clan={clan}
        currentWar={currentWar}
        members={membersWithPlayers}
      />
    </main>
  );
}
