/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/page.tsx
 *
 * Responsabilidade:
 * Redirecionar a página inicial localizada para o painel
 * completo do clã principal.
 *
 * Exemplos:
 *
 * /pt-BR → /pt-BR/clans/kod
 * /en → /en/clans/kod
 * /es → /es/clans/kod
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 01/08/2026
 * ==========================================================
 */

import { redirect } from "next/navigation";

import { clans } from "@/config/clans";

/**
 * Parâmetros dinâmicos da rota localizada.
 */
type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Redireciona a página inicial para o painel completo
 * do clã principal.
 *
 * Dessa forma, evitamos manter duas implementações
 * diferentes do Dashboard.
 */
export default async function Home({ params }: HomeProps) {
  /**
   * Recupera o idioma atual da URL.
   */
  const { locale } = await params;

  /**
   * Recupera o clã considerado padrão na aplicação.
   */
  const defaultClan = clans.kod;

  /**
   * Encaminha o usuário para a rota dinâmica do clã.
   *
   * Exemplo:
   * /pt-BR → /pt-BR/clans/kod
   */
  redirect(`/${locale}/clans/${defaultClan.slug}`);
}
