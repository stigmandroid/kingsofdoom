/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/clans/[slug]/page.tsx
 *
 * Responsabilidade:
 * Renderizar o painel principal de um clã com base no slug
 * informado na URL.
 *
 * A página consulta:
 *
 * • dados gerais do clã;
 * • guerra atual.
 *
 * A listagem completa de membros passa a pertencer ao módulo
 * dedicado de Membros.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.8.7
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { notFound } from "next/navigation";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { clans, getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getCurrentWar } from "@/services/war.service";

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
   * Localiza as configurações oficiais do clã.
   */
  const clanConfig = getClanBySlug(slug);

  if (!clanConfig) {
    notFound();
  }

  /**
   * Dados gerais do clã e guerra atual são carregados
   * simultaneamente.
   *
   * A página principal não consulta mais individualmente
   * todos os jogadores, reduzindo chamadas desnecessárias
   * à Player API.
   */
  const [clan, currentWar] = await Promise.all([
    getClan(clanConfig.tag),
    getCurrentWar(clanConfig.tag),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Dashboard clan={clan} currentWar={currentWar} />
    </main>
  );
}
