/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/layout.tsx
 *
 * Responsabilidade:
 * Definir a estrutura compartilhada por todas as páginas
 * localizadas do portal, validar o locale, carregar as
 * mensagens de tradução e renderizar a Navbar principal.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import type { ReactNode } from "react";

import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { routing } from "@/i18n/routing";

/**
 * Propriedades recebidas pelo layout localizado.
 */
type LocaleLayoutProps = {
  /**
   * Conteúdo da rota atualmente acessada.
   */
  children: ReactNode;

  /**
   * Parâmetros dinâmicos da rota.
   *
   * No App Router atual, os parâmetros podem ser recebidos
   * como Promise em layouts e páginas assíncronas.
   */
  params: Promise<{
    /**
     * Idioma presente na URL.
     */
    locale: string;
  }>;
};

/**
 * Gera previamente uma rota para cada locale suportado
 * pela configuração internacionalizada do portal.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

/**
 * Renderiza o layout compartilhado por todas as páginas
 * que possuem um locale na URL.
 *
 * Exemplos:
 *
 * /pt-BR/clans/kod
 * /pt-BR/clans/kod-rec
 * /pt-BR/releases
 * /pt-BR/war
 * /pt-BR/cwl
 * /pt-BR/members
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  /**
   * Recupera o locale presente nos parâmetros da rota.
   */
  const { locale } = await params;

  /**
   * Interrompe a renderização quando o idioma informado
   * não estiver entre os locales suportados.
   */
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  /**
   * Define o locale atual para permitir renderização
   * estática compatível com o next-intl.
   */
  setRequestLocale(locale);

  /**
   * Carrega as mensagens de tradução correspondentes
   * ao idioma atual.
   */
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/*
       * A Navbar fica no layout localizado para ser exibida
       * em todas as páginas do portal, incluindo Releases.
       */}
      <Navbar />

      {/*
       * Conteúdo específico da página atualmente acessada.
       *
       * O elemento main também melhora a semântica e a
       * acessibilidade da estrutura global.
       */}
      <main>{children}</main>
    </NextIntlClientProvider>
  );
}
