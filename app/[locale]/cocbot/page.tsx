/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cocbot/page.tsx
 *
 * Responsabilidade:
 * Apresentar publicamente a KODA — Kings of Doom Assistant,
 * sua proposta de valor, funcionalidades e experiência.
 *
 * Estratégia:
 *
 * • mobile-first;
 * • apresentação oficial da identidade KODA;
 * • manter a rota /cocbot por compatibilidade;
 * • mostrar funcionalidades reais já disponíveis;
 * • destacar alertas, Arsenal HD e Rankeada;
 * • CTA principal para contato via WhatsApp.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 17/09/2026
 *
 * Versão:
 * 0.2.0
 *
 * Status:
 * Em desenvolvimento
 * ==========================================================
 */

import Image from "next/image";
import Link from "next/link";

/**
 * ==========================================================
 * CONSTANTES
 * ==========================================================
 */

const whatsappMessage =
  "Olá! Quero conhecer a KODA — Kings of Doom Assistant e testar no meu clã.";

const whatsappUrl =
  "https://wa.me/+5511954953778?text=" + encodeURIComponent(whatsappMessage);

/**
 * ==========================================================
 * DADOS
 * ==========================================================
 */

const features = [
  {
    eyebrow: "GUERRA & CWL",
    title: "Alertas automáticos",
    description:
      "A KODA acompanha guerras e CWL, informa eventos encontrados, início, encerramento e tempo restante.",
  },
  {
    eyebrow: "WHATSAPP",
    title: "Menções inteligentes",
    description:
      "Jogadores vinculados podem ser mencionados no grupo quando ainda possuem ataques pendentes.",
  },
  {
    eyebrow: "ARSENAL HD",
    title: "Sua conta em detalhes",
    description:
      "Heróis, equipamentos, tropas, feitiços, pets e máquinas de cerco reunidos em uma apresentação visual própria.",
  },
  {
    eyebrow: "RANQUEADA",
    title: "Ataques e defesas",
    description:
      "Consulte o desempenho do jogador na Liga Ranqueada diretamente pelo WhatsApp.",
  },
  {
    eyebrow: "CLÃS",
    title: "Informações do clã",
    description:
      "Consulte dados dos clãs vinculados e acompanhe informações importantes sem sair do grupo.",
  },
  {
    eyebrow: "ADMINISTRAÇÃO",
    title: "Gestão de membros",
    description:
      "Líderes e colíderes possuem recursos próprios para consultar informações e administrar a operação do clã.",
  },
  {
    eyebrow: "CONFIGURAÇÃO",
    title: "Painel seguro",
    description:
      "Configure idioma e notificações de Guerra e CWL através de um painel administrativo temporário e protegido.",
  },
  {
    eyebrow: "IDENTIDADE",
    title: "Contas vinculadas",
    description:
      "Cada jogador pode vincular suas contas e utilizar índices ou tags para consultar diferentes perfis.",
  },
];

const upcomingFeatures = [
  "Raid Weekend",
  "Jogos do Clã",
  "Histórico individual expandido",
  "Inteligência de desempenho",
  "Rankeada por clã",
  "Novos recursos administrativos",
];

/**
 * ==========================================================
 * PÁGINA
 * ==========================================================
 */

export default function CocBotPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-100">
      {/**
       * ====================================================
       * HERO — KODA
       * ====================================================
       */}

      <section className="relative border-b border-slate-800/80">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-red-700/10 blur-[140px]" />
          <div className="absolute right-[-120px] top-[20%] h-[420px] w-[420px] rounded-full bg-amber-500/[0.07] blur-[130px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
            <div className="relative z-10 pb-6 lg:pb-20">
              <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-3 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-300">
                  Kings of Doom Assistant
                </span>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-red-400">
                CONHEÇA A KODA
              </p>

              <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-[76px] lg:leading-[0.95]">
                A inteligência por trás dos{" "}
                <span className="text-amber-400">Kings of Doom.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                KODA é a assistente oficial dos Kings of Doom. Criada para
                transformar dados do Clash of Clans em informação útil para
                jogadores e lideranças diretamente no WhatsApp.
              </p>

              <p className="mt-5 max-w-2xl border-l-2 border-red-500 pl-4 text-sm font-semibold leading-6 text-slate-200 sm:text-base">
                Ela não joga por você. Ela mantém o seu reino informado.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-400/70 bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                >
                  Conhecer a KODA
                </a>

                <Link
                  href="#funcionalidades"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  Ver funcionalidades
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center sm:min-h-[660px] lg:min-h-[760px]">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="koda-glow absolute h-[520px] w-[520px] rounded-full" />

                <div className="koda-ring absolute h-[520px] w-[520px] rounded-full" />
                <div className="koda-ring-delay-1 absolute h-[460px] w-[460px] rounded-full" />
                <div className="koda-ring-delay-2 absolute h-[400px] w-[400px] rounded-full" />
              </div>

              <div className="relative z-10 flex items-center justify-center">
                <Image
                  src="/koda-full.png"
                  alt="KODA — Kings of Doom Assistant"
                  width={1100}
                  height={1500}
                  priority
                  className="koda-float h-auto max-h-[780px] w-auto drop-shadow-[0_0_40px_rgba(255,184,0,0.22)] transition-transform duration-500 hover:scale-[1.02] hover:-translate-y-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * REVEAL
       * ====================================================
       */}

      <section className="border-b border-slate-800/80 bg-slate-950/30">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            UMA NOVA IDENTIDADE
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            O COC Bot evoluiu.
            <br />
            Agora ele também tem um nome.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
            O projeto começou como uma ferramenta de consulta e automação de
            informações. Com novos recursos, sistemas administrativos, alertas e
            experiências visuais, ele ganhou uma identidade própria.
          </p>

          <div className="mx-auto mt-9 inline-flex flex-col items-center rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] px-8 py-6">
            <span className="text-4xl font-black tracking-[0.08em] text-amber-400 sm:text-6xl">
              KODA
            </span>

            <span className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">
              Kings of Doom Assistant
            </span>
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * QUEM É KODA
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div className="relative mx-auto w-full max-w-[380px]">
            <div className="absolute inset-10 rounded-full bg-red-600/10 blur-[70px]" />

            <Image
              src="/koda-profile.png"
              alt="Retrato da KODA"
              width={1200}
              height={1200}
              className="relative z-10 h-auto w-full rounded-3xl border border-amber-400/20 object-cover shadow-2xl"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-400">
              A RAINHA DOS REIS
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Os reis lutam.
              <br />A KODA observa o reino.
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-400">
              Os Kings of Doom construíram seus clãs em torno de organização,
              estratégia e guerra. KODA nasceu para conectar tudo isso através
              de dados, alertas, consultas e informação.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["Observa", "Alerta", "Consulta", "Organiza"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4 text-center"
                >
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-white">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * FUNCIONALIDADES
       * ====================================================
       */}

      <section id="funcionalidades" className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
              FUNCIONALIDADES
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
              O que a KODA já faz
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-400">
              Recursos reais que já fazem parte da experiência dos jogadores e
              lideranças.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-slate-950/70"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
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
       * KODA EM AÇÃO
       * ====================================================
       */}

      <section className="border-b border-slate-800/80 bg-slate-950/20">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">
              DIRETO NO WHATSAPP
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
              Veja a KODA em ação
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-400">
              A informação chega onde o clã já está. Sem precisar abrir outro
              aplicativo ou acompanhar planilhas manualmente.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="overflow-hidden rounded-3xl border border-slate-800 bg-[#07111F] p-3 sm:p-5">
              <div className="mb-4 px-2 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  GUERRA
                </p>

                <h3 className="mt-1 text-xl font-black text-white">
                  Alertas e menções automáticas
                </h3>
              </div>

              <Image
                src="/alerta-guerra.png"
                alt="Alerta de guerra da KODA no WhatsApp"
                width={900}
                height={1600}
                className="h-auto w-full rounded-2xl object-contain"
              />
            </article>

            <article className="overflow-hidden rounded-3xl border border-slate-800 bg-[#07111F] p-3 sm:p-5">
              <div className="mb-4 px-2 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  EVENTOS
                </p>

                <h3 className="mt-1 text-xl font-black text-white">
                  Do encontro ao resultado final
                </h3>
              </div>

              <Image
                src="/guerra-eventos.png"
                alt="Notificações de guerra da KODA"
                width={900}
                height={1600}
                className="h-auto w-full rounded-2xl object-contain"
              />
            </article>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-600">
            Exemplos ilustrativos. Dados pessoais e números de telefone foram
            ocultados.
          </p>
        </div>
      </section>

      {/**
       * ====================================================
       * FILOSOFIA
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-400">
            INFORMAÇÃO, NÃO AUTOMAÇÃO DE JOGO
          </p>

          <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            A KODA não joga Clash of Clans por você.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
            A KODA utiliza informações e integrações para consultar dados,
            organizar informações e auxiliar jogadores e lideranças. Ela não
            realiza ataques, não controla contas e não substitui decisões dos
            jogadores.
          </p>
        </div>
      </section>

      {/**
       * ====================================================
       * FUTURO
       * ====================================================
       */}

      <section className="border-b border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
              EM EVOLUÇÃO
            </p>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
              A KODA está apenas começando.
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
                  Em evolução
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/**
       * ====================================================
       * CTA FINAL
       * ====================================================
       */}

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-700/[0.08] blur-[130px]" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
            KODA • KINGS OF DOOM ASSISTANT
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Seu clã está pronto para conhecê-la?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Leve alertas, consultas e informações do Clash of Clans diretamente
            para o WhatsApp do seu clã.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-amber-400 bg-amber-400 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 sm:w-auto"
          >
            Falar com a KODA
          </a>

          <p className="mt-6 text-xs text-slate-600">kingsofdoom.com</p>
        </div>
      </section>
    </main>
  );
}
