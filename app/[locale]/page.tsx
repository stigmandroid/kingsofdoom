/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/page.tsx
 *
 * Responsabilidade:
 * Direcionar a raiz localizada para a Home principal
 * do Kings of Doom Command Center.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 20/09/2026
 *
 * Versão:
 * 1.0.0
 *
 * Status:
 * Estável
 * ==========================================================
 */

import { redirect } from "next/navigation";

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  redirect(`/${locale}/clans/kod`);
}
