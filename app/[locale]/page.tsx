/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/page.tsx
 *
 * Responsabilidade:
 * Renderizar a página inicial localizada do portal.
 *
 * A página inicial utiliza o K.O.D. como clã padrão.
 * Cada clã também pode ser acessado por meio das rotas
 * dinâmicas cadastradas no projeto.
 *
 * Exemplos:
 * /pt-BR/clans/kod
 * /pt-BR/clans/kod-rec
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

import { Dashboard } from "@/components/dashboard/Dashboard";
import { Navbar } from "@/components/layout/Navbar";
import { clans } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getCurrentWar } from "@/services/war.service";
import type { CurrentWarResult } from "@/types/war";
import type { Clan } from "@/types/clan";

/**
 * Renderiza o painel principal do portal.
 *
 * A página inicial exibe o K.O.D. como clã padrão
 * em todos os idiomas disponíveis.
 */
export default async function Home() {
  /**
   * Recupera a configuração do K.O.D. no catálogo central.
   *
   * A tag do clã fica centralizada em config/clans.ts,
   * evitando valores duplicados ou escritos diretamente
   * dentro das páginas da aplicação.
   */
  const defaultClan = clans.kod;

  /**
   * Carrega simultaneamente:
   *
   * 1. Os dados gerais do clã.
   * 2. Os dados da guerra atual do mesmo clã.
   *
   * Promise.all permite executar as duas requisições ao mesmo
   * tempo, reduzindo o tempo total de carregamento da página.
   *
   * As duas consultas recebem a mesma tag, garantindo que
   * os dados gerais e a guerra pertençam ao mesmo clã.
   */
  let clan: Clan | null = null;
  let currentWar: CurrentWarResult = {
    available: false,
    reason: "unavailable",
  };

  try {
    [clan, currentWar] = await Promise.all([
      getClan(defaultClan.tag),
      getCurrentWar(defaultClan.tag),
    ]);
  } catch (error) {
    /**
     * Registra o erro apenas no servidor.
     *
     * Dessa forma conseguimos identificar problemas de
     * infraestrutura sem interromper o carregamento da página.
     */
    console.error("Erro ao carregar os dados do Dashboard:", error);
  }

  if (!clan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-400">
            K.O.D. Command Center
          </p>

          <h1 className="mt-5 text-4xl font-black">
            Dados temporariamente indisponíveis
          </h1>

          <p className="mt-6 leading-7 text-slate-400">
            Não foi possível consultar a API oficial do Clash of Clans. Nossa
            equipe já identificou a causa e o portal continuará disponível assim
            que a comunicação for restabelecida.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Dashboard clan={clan} currentWar={currentWar} members={[]} />
    </main>
  );
}
