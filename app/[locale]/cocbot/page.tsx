/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cocbot/page.tsx
 *
 * Responsabilidade:
 * Apresentar publicamente o COC Bot, sua proposta de valor,
 * principais funcionalidades e canais de contato.
 *
 * Estratégia:
 *
 * • mobile-first;
 * • linguagem visual alinhada ao Command Center;
 * • CTA principal para contato via WhatsApp;
 * • foco em líderes, colíderes e jogadores;
 * • sem substituir a rota de verificação do COC Bot.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/09/2026
 *
 * Versão:
 * 0.1.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";
import Image from "next/image";

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

const whatsappMessage = "Olá! Quero conhecer o COC Bot e testar no meu clã.";

const whatsappUrl =
  "https://wa.me/+5511954953778?text=" + encodeURIComponent(whatsappMessage);

/**
 * ==========================================================
 * DADOS
 * ==========================================================
 */

const features = [
  {
    eyebrow: "GUERRAS",
    title: "War Tracking",
    description:
      "Acompanhe guerras automaticamente com alertas de tempo restante e jogadores com ataques pendentes.",
  },
  {
    eyebrow: "CWL",
    title: "CWL Tracking",
    description:
      "O COC Bot acompanha a rodada ativa da Clan War League e mantém o grupo informado ao longo do evento.",
  },
  {
    eyebrow: "WHATSAPP",
    title: "Menções inteligentes",
    description:
      "Jogadores vinculados podem receber marcações reais no WhatsApp quando ainda possuem ataques pendentes.",
  },
  {
    eyebrow: "PERFIL",
    title: "Identidade do jogador",
    description:
      "Vincule contas do Clash of Clans ao WhatsApp e crie uma identidade única para cada jogador.",
  },
];

const upcomingFeatures = [
  "Estado completo da conta",
  "Acompanhamento da Rankeada",
  "Raid Weekend",
  "Jogos do Clã",
  "Histórico individual",
  "Inteligência de desempenho",
];

/**
 * ==========================================================
 * PÁGINA
 * ==========================================================
 */

export default function CocBotPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      {/**
       * ====================================================
       * HERO
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
                COC BOT
              </p>

              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.02]">
                Automação e inteligência para seu clã no WhatsApp.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Acompanhe guerras, CWL, jogadores e eventos do clã com alertas
                automáticos, menções e dados úteis em tempo real.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-400/70 bg-amber-400/10 px-5 py-3 text-sm font-bold text-amber-300 transition hover:border-amber-300 hover:bg-amber-400/15"
                >
                  Falar com o COC Bot
                </a>

                <Link
                  href="#funcionalidades"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
                >
                  Ver funcionalidades
                </Link>
              </div>
            </div>

            {/**
             * ==================================================
             * MOCK VISUAL
             * ==================================================
             */}

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[360px] sm:max-w-[430px] lg:max-w-[520px]">
                <Image
                  src="/cocbot-logo.png"
                  alt="COC Bot by Kings of Doom"
                  width={1254}
                  height={1254}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_0_30px_rgba(250,204,21,0.12)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * PROPOSTA
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">
              AUTOMATIZE O CLÃ
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Menos cobrança manual. Mais informação no momento certo.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-400">
              O COC Bot foi criado para apoiar a administração de clãs sem
              transformar o WhatsApp em uma planilha. Ele acompanha eventos,
              identifica pendências e envia informações úteis automaticamente.
            </p>
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * FUNCIONALIDADES
       * ====================================================
       */}

      <section id="funcionalidades" className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
              FUNCIONALIDADES
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              O que o COC Bot já faz
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 transition hover:border-slate-700 hover:bg-slate-950/60"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  {feature.eyebrow}
                </p>

                <h3 className="mt-2 text-lg font-black text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * IMAGENS / EXPERIÊNCIA
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">
                PARA JOGADORES
              </p>

              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                O jogador também precisa enxergar valor.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-400">
                Além dos alertas do clã, o COC Bot está evoluindo para oferecer
                uma experiência individual: progresso da conta, Rankeada,
                histórico e inteligência pessoal.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {["Heróis", "Equipamentos", "Pets"].map((label, index) => (
                  <div
                    key={label}
                    className={[
                      "aspect-square rounded-2xl border p-3",
                      index === 0
                        ? "border-amber-400/70 bg-amber-400/[0.06]"
                        : "border-slate-800 bg-[#07111F]",
                    ].join(" ")}
                  >
                    <div className="flex h-full flex-col justify-end">
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Progresso
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * EM EVOLUÇÃO
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
              EM EVOLUÇÃO
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Próximas funcionalidades
            </h2>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-4"
              >
                <span className="text-sm font-semibold text-slate-300">
                  {feature}
                </span>

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * LÍDERES + JOGADORES
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              PARA LIDERANÇAS
            </p>

            <h3 className="mt-3 text-2xl font-black text-white">
              Organização sem depender de cobrança manual.
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Acompanhe guerras, CWL e pendências com informações automáticas
              dentro do próprio grupo.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              PARA JOGADORES
            </p>

            <h3 className="mt-3 text-2xl font-black text-white">
              Mais utilidade para quem vincula sua conta.
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Perfil, progresso, Rankeada, histórico e inteligência individual
              fazem parte da próxima camada do COC Bot.
            </p>
          </article>
        </div>
      </section>

      {/**
       * ====================================================
       * CTA FINAL
       * ====================================================
       */}

      <section>
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
            COC BOT
          </p>

          <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
            Quer testar no seu clã?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Entre em contato e conheça o COC Bot.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-amber-400/70 bg-amber-400/10 px-6 py-3 text-sm font-black text-amber-300 transition hover:border-amber-300 hover:bg-amber-400/15 sm:w-auto"
          >
            Entrar em contato pelo WhatsApp
          </a>

          <p className="mt-5 text-xs text-slate-600">kingsofdoom.com</p>
        </div>
      </section>
    </main>
  );
}
