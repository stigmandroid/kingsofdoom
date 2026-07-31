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
// Exibir a Sala de Guerra do clã padrão, utilizando dados
// reais obtidos pela API oficial do Clash of Clans.
//
// Funcionalidades:
//
// - Consulta a guerra atual do clã padrão;
// - Exibe o estado da guerra;
// - Exibe os clãs participantes;
// - Exibe estrelas, destruição e ataques realizados;
// - Exibe o tempo restante;
// - Trata guerra indisponível, privada ou inexistente;
// - Preserva a localização atual da aplicação.
//
// Dependências:
//
// - next/link
// - @/config/clans
// - @/services/war.service
// - @/components/dashboard/WarOverview
//
// Autor:
// stigmandroid
//
// Última atualização:
// 29/07/2026
//
// Versão:
// 0.5.0
//
// Status:
// 🚧 Em desenvolvimento
// ==========================================================

import Link from "next/link";

import { WarOverview } from "@/components/dashboard/WarOverview";
import { getClanBySlug } from "@/config/clans";
import { notFound } from "next/navigation";
import { getCurrentWar } from "@/services/war.service";
import { WarPendingAttacks } from "@/components/dashboard/WarPendingAttacks";
import { WarMap } from "@/components/dashboard/WarMap";

/**
 * Parâmetros dinâmicos disponibilizados pela rota localizada.
 *
 * No Next.js atual, params pode ser recebido como Promise
 * dentro de Server Components.
 */
type WarPageProps = {
  params: Promise<{
    locale: string;
    clan: string;
  }>;
};

/**
 * Página principal da Sala de Guerra.
 *
 * A consulta é executada no servidor para que o token privado
 * da Clash API nunca seja exposto ao navegador.
 */
export default async function WarPage({ params }: WarPageProps) {
  const { locale, clan: clanSlug } = await params;

  /**
   * Recupera o clã informado pela URL.
   *
   * Exemplos:
   *
   * /pt-BR/war/kod
   * /pt-BR/war/kod-rec
   */
  const clan = getClanBySlug(clanSlug);

  /**
   * Caso o slug não exista,
   * exibimos a página 404.
   */
  if (!clan) {
    notFound();
  }

  /**
   * Consulta a guerra atual utilizando a tag configurada
   * para o clã padrão da plataforma.
   */
  const currentWar = await getCurrentWar(clan.tag);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/*
       * Cabeçalho específico da página completa.
       *
       * O WarOverview continuará responsável pelo placar,
       * estados de erro e informações resumidas da guerra.
       */}
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
            Acompanhe o estado da guerra, o placar atual, a destruição acumulada
            e a utilização dos ataques de cada clã.
          </p>
        </div>
      </section>

      {/*
       * Reutilizamos o componente já validado no Dashboard.
       *
       * O botão "Abrir Sala de Guerra" é ocultado porque o usuário
       * já se encontra dentro da própria Sala de Guerra.
       */}
      <WarOverview result={currentWar} showWarRoomLink={false} />
      <WarPendingAttacks result={currentWar} />
      <WarMap result={currentWar} />

      {/*
       * Área reservada para as próximas evoluções do módulo.
       *
       * Ela deixa claro o escopo futuro sem implementar funcionalidades
       * incompletas nesta entrega.
       */}
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-300">
              Próximas evoluções
            </p>

            <h2 className="mt-4 text-2xl font-black text-white">
              Inteligência completa de guerra
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <WarFeature
                title="Mapa da guerra"
                description="Visualização dos jogadores e posições de cada clã."
              />

              <WarFeature
                title="Ataques"
                description="Histórico completo dos ataques realizados."
              />

              <WarFeature
                title="Pendências"
                description="Identificação de jogadores com ataques disponíveis."
              />

              <WarFeature
                title="Timeline"
                description="Linha do tempo dos eventos da guerra."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Propriedades do card utilizado para apresentar
 * uma funcionalidade futura da Sala de Guerra.
 */
type WarFeatureProps = {
  title: string;
  description: string;
};

/**
 * Card visual para funcionalidades planejadas.
 *
 * Este componente não executa nenhuma regra de negócio.
 * Sua responsabilidade é exclusivamente de apresentação.
 */
function WarFeature({ title, description }: WarFeatureProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <h3 className="font-black text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
