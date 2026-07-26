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
 * Exemplos de rotas:
 * /pt-BR/clans/kod
 * /pt-BR/clans/kod-rec
 *
 * Esta página é reutilizada por todos os clãs cadastrados em
 * config/clans.ts, evitando duplicação de páginas e lógica.
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
import { Navbar } from "@/components/layout/Navbar";
import { clans, getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getCurrentWar } from "@/services/war.service";

/**
 * Define os parâmetros dinâmicos recebidos pela página.
 *
 * No App Router atual, params é assíncrono e precisa ser
 * resolvido com await antes do acesso às propriedades.
 */
type ClanPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/**
 * Gera antecipadamente as combinações conhecidas de idioma
 * e clã durante o processo de build.
 *
 * Isso permite que o Next.js valide e pré-renderize as rotas
 * cadastradas no projeto.
 *
 * Ao adicionar um novo clã em config/clans.ts, sua rota será
 * incluída automaticamente no próximo build.
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
  /**
   * Resolve os segmentos dinâmicos da URL.
   *
   * Exemplo:
   * /pt-BR/clans/kod
   *
   * locale = "pt-BR"
   * slug = "kod"
   */
  const { slug } = await params;

  /**
   * Procura o clã no catálogo central.
   *
   * Caso o slug não esteja cadastrado, a página retorna 404
   * antes de realizar qualquer chamada externa à API.
   */
  const clanConfig = getClanBySlug(slug);

  if (!clanConfig) {
    notFound();
  }

  /**
   * Consulta os dados completos do clã usando sua tag oficial.
   */
  /**
   * Consulta simultaneamente os dados gerais e a guerra atual
   * do clã selecionado.
   *
   * Como ambas as consultas utilizam a mesma configuração,
   * cada página exibirá somente os dados do seu próprio clã.
   */
  const [clan, currentWar] = await Promise.all([
    getClan(clanConfig.tag),
    getCurrentWar(clanConfig.tag),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Dashboard clan={clan} currentWar={currentWar} />
    </main>
  );
}
