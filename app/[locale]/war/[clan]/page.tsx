// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// page.tsx
//
// Localização:
// app/[locale]/war/[clan]/page.tsx
//
// Responsabilidade:
// Exibir a Sala de Guerra e o histórico persistente do
// clã selecionado.
//
// Funcionalidades:
//
// - Consulta a guerra atual pela Clash API;
// - Exibe placar, pendências e mapa;
// - Recupera guerras anteriores do SQLite;
// - Mantém K.O.D. e K.O.D.rec isolados por tag;
// - Preserva a localização atual da aplicação.
//
// Autor:
// stigmandroid
//
// Última atualização:
// 15/08/2026
//
// Versão:
// 0.9.0
//
// Status:
// 🚧 Em desenvolvimento
// ==========================================================

import Link from "next/link";
import { notFound } from "next/navigation";

import { WarOverview } from "@/components/dashboard/WarOverview";
import { WarPendingAttacks } from "@/components/dashboard/WarPendingAttacks";
import { WarMap } from "@/components/dashboard/WarMap";
import { WarHistory } from "@/components/war/WarHistory";

import { getClanBySlug } from "@/config/clans";

import { getCurrentWar } from "@/services/war.service";
import { getRecentWarHistory } from "@/services/war-history.service";

/**
 * Parâmetros dinâmicos da rota localizada.
 */
type WarPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
  }>;
};

/**
 * Página principal da Sala de Guerra.
 */
export default async function WarPage({ params }: WarPageProps) {
  const { locale, clan: clanSlug } = await params;

  /**
   * Recupera o clã informado pela URL.
   */
  const clan = getClanBySlug(clanSlug);

  if (!clan) {
    notFound();
  }

  /**
   * Consulta:
   *
   * - guerra atual na Clash API;
   * - histórico já persistido no SQLite.
   *
   * Assim, a página passa a unir presente e passado.
   */
  const currentWar = await getCurrentWar(clan.tag);

  const warHistory = getRecentWarHistory({
    trackedClanTag: clan.tag,
    limit: 20,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-12 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-sm font-bold text-slate-400 transition hover:text-white"
          >
            ← Voltar ao painel
          </Link>

          <p className="mt-10 text-sm font-black uppercase tracking-[0.3em] text-red-400">
            K.O.D. Command Center
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Sala de Guerra
          </h1>

          <p
            translate="no"
            className="notranslate mt-4 text-xl font-black text-red-400"
          >
            {clan.name}
          </p>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Acompanhe a guerra atual e consulte o histórico persistente de
            confrontos do clã.
          </p>
        </div>
      </section>

      {/**
       * ========================================================
       * GUERRA ATUAL
       * ========================================================
       */}
      <WarOverview result={currentWar} showWarRoomLink={false} />

      <WarPendingAttacks result={currentWar} />

      <WarMap result={currentWar} />

      {/**
       * ========================================================
       * HISTÓRICO
       * ========================================================
       */}
      <WarHistory wars={warHistory} locale={locale} clanSlug={clanSlug} />
    </main>
  );
}
