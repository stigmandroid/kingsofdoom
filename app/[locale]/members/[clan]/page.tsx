/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/members/[clan]/page.tsx
 *
 * Responsabilidade:
 * Renderizar o módulo dedicado de membros do clã
 * selecionado.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 16/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { notFound } from "next/navigation";

import { ClanMembers } from "@/components/clan/ClanMembers";
import { clans, getClanBySlug } from "@/config/clans";
import { getClanMembersWithPlayers } from "@/services/clan-members.service";
import { getClan } from "@/services/clan.service";

type MembersPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
  }>;
};

/**
 * Gera antecipadamente as combinações conhecidas
 * de idioma e clã.
 */
export function generateStaticParams() {
  const locales = ["pt-BR", "en", "es"];

  return locales.flatMap((locale) =>
    Object.values(clans).map((clan) => ({
      locale,
      clan: clan.slug,
    })),
  );
}

/**
 * Renderiza a página completa de membros.
 */
export default async function MembersPage({ params }: MembersPageProps) {
  const { clan: clanSlug } = await params;

  /**
   * Localiza o clã solicitado no catálogo central.
   */
  const clanConfig = getClanBySlug(clanSlug);

  if (!clanConfig) {
    notFound();
  }

  /**
   * Carrega primeiro os dados atuais do clã.
   */
  const clan = await getClan(clanConfig.tag);

  /**
   * Enriquece cada membro com seu perfil individual.
   *
   * Essa operação agora acontece somente dentro do módulo
   * de Membros e não mais no Dashboard principal.
   */
  const members = await getClanMembersWithPlayers(clan);

  return (
    <main className="min-h-screen bg-slate-950 pb-12 text-white">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Command Center
          </p>

          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Membros
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Consulte a formação atual, informações individuais e dados dos
            jogadores do{" "}
            <span
              translate="no"
              className="notranslate font-bold text-slate-200"
            >
              {clan.name}
            </span>
            .
          </p>
        </div>
      </section>

      <ClanMembers members={members} clanName={clan.name} />
    </main>
  );
}
