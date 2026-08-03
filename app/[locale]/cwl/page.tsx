/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cwl/page.tsx
 *
 * Responsabilidade:
 * Redirecionar a rota geral da CWL para o clã principal.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/08/2026
 * ==========================================================
 */

import { redirect } from "next/navigation";

type CwlPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/**
 * Redireciona a rota geral para a CWL do K.O.D.
 */
export default async function CwlPage({ params }: CwlPageProps) {
  const { locale } = await params;

  redirect(`/${locale}/cwl/kod`);
}
