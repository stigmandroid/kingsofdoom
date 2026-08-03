/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlUnavailableState.tsx
 *
 * Responsabilidade:
 * Exibir o estado da página da CWL quando não existir
 * uma temporada ativa ou quando os dados estiverem
 * temporariamente indisponíveis.
 *
 * Funcionalidades:
 *
 * - diferencia ausência de CWL e falhas técnicas;
 * - evita uma página vazia fora do período da liga;
 * - prepara o espaço para o futuro histórico de temporadas;
 * - oferece navegação de retorno ao painel;
 * - mantém layout responsivo.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 02/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";

/**
 * Motivos possíveis para indisponibilidade da CWL.
 */
type CwlUnavailableReason =
  | "notInCwl"
  | "privateWarLog"
  | "invalidIp"
  | "unavailable";

/**
 * Propriedades recebidas pelo componente.
 */
type CwlUnavailableStateProps = {
  /**
   * Idioma presente na rota atual.
   */
  locale: string;

  /**
   * Motivo retornado pelo serviço da CWL.
   */
  reason: CwlUnavailableReason;
};

/**
 * Configurações textuais de cada estado.
 */
const unavailableStateConfiguration: Record<
  CwlUnavailableReason,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  notInCwl: {
    eyebrow: "Temporada encerrada",
    title: "Nenhuma Liga de Guerras ativa",
    description:
      "O clã selecionado não está participando de uma temporada ativa da Liga de Guerras neste momento.",
  },

  privateWarLog: {
    eyebrow: "Acesso restrito",
    title: "Dados da CWL indisponíveis",
    description:
      "O registro de guerras do clã está privado e impede a consulta das informações da temporada.",
  },

  invalidIp: {
    eyebrow: "Configuração da API",
    title: "Acesso temporariamente indisponível",
    description:
      "O endereço atual do servidor ainda não está autorizado a consultar os dados da Clash API.",
  },

  unavailable: {
    eyebrow: "Indisponibilidade temporária",
    title: "Não foi possível carregar a CWL",
    description:
      "Os dados da temporada não puderam ser consultados neste momento. Tente novamente mais tarde.",
  },
};

/**
 * Renderiza o estado indisponível da página da CWL.
 */
export function CwlUnavailableState({
  locale,
  reason,
}: CwlUnavailableStateProps) {
  const content = unavailableStateConfiguration[reason];

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden border-b border-slate-800 bg-slate-950">
      {/*
       * Iluminações decorativas de fundo.
       */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-slate-700/10 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            {/*
             * Mensagem principal.
             */}
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-400">
                {content.eyebrow}
              </p>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                {content.title}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
                {content.description}
              </p>

              {reason === "notInCwl" && (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                  Quando uma nova temporada começar, esta página será atualizada
                  automaticamente com os clãs participantes, escalações,
                  rodadas, confrontos e classificação.
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                >
                  Voltar ao painel
                </Link>

                <Link
                  href={`/${locale}/releases#roadmap`}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-black text-slate-300 transition hover:border-amber-400/50 hover:text-amber-300"
                >
                  Consultar roadmap
                </Link>
              </div>
            </div>

            {/*
             * Área dedicada ao futuro histórico da CWL.
             */}
            <div className="border-t border-slate-800 bg-slate-950/60 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="flex h-full flex-col justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-3xl">
                  🏆
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                  Próxima evolução
                </p>

                <h2 className="mt-3 text-2xl font-black text-white">
                  Histórico de temporadas
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  As temporadas anteriores serão preservadas para permitir
                  consultas de classificação, escalações, rodadas, confrontos e
                  desempenho acumulado.
                </p>

                <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                    Em desenvolvimento
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    O histórico será disponibilizado em uma próxima etapa da CWL
                    Intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
