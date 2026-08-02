import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { Clan } from "@/types/clan";

/**
 * Propriedades recebidas pelo Hero.
 */
type HeroProps = {
  /**
   * Dados completos do clã atualmente selecionado.
   */
  clan: Clan;

  /**
   * Endereço localizado da Sala de Guerra
   * correspondente ao clã atual.
   *
   * Exemplos:
   * /pt-BR/war/kod
   * /pt-BR/war/kod-rec
   */
  warRoomHref: string;
};

/**
 * Renderiza a apresentação principal do clã.
 */
export async function Hero({ clan, warRoomHref }: HeroProps) {
  const t = await getTranslations("Hero");

  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Iluminação de fundo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(245,158,11,0.14),transparent_32%),radial-gradient(circle_at_20%_30%,rgba(30,41,59,0.75),transparent_38%)]" />

      {/* Linhas decorativas */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span
              translate="no"
              className="notranslate text-xs font-black uppercase tracking-[0.25em] text-amber-300"
            >
              K.O.D. Command Center
            </span>
          </div>

          <h1 className="mt-8 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("headlineFirst")}

            <span className="block text-amber-400">{t("headlineSecond")}</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            {t("descriptionBeforeClan")}{" "}
            <span translate="no" className="notranslate font-bold text-white">
              {clan.name}
            </span>
            . {t("descriptionAfterClan")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={warRoomHref}
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3.5 font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300"
            >
              {t("openWarRoom")}
            </Link>

            <a
              href="#visao-geral"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900"
            >
              {t("viewStats")}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span translate="no" className="notranslate">
              {clan.tag}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

            <span>{t("officialData")}</span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

            <span>{t("automaticUpdates")}</span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          {/*
           * Brilho principal atrás do logotipo.
           */}
          <div className="absolute h-72 w-72 animate-pulse rounded-full bg-amber-400/20 blur-[90px] sm:h-96 sm:w-96" />

          {/*
           * Halo secundário para reforçar o efeito Command Center.
           */}
          <div className="absolute h-[280px] w-[280px] rounded-full border border-amber-400/20 shadow-[0_0_80px_rgba(245,158,11,0.22)] sm:h-[380px] sm:w-[380px]" />

          {/*
           * Contêiner visual principal.
           */}
          <div className="relative flex h-[360px] w-[360px] items-center justify-center rounded-full border border-amber-400/10 bg-slate-900/30 backdrop-blur-sm sm:h-[440px] sm:w-[440px]">
            <div className="absolute inset-5 rounded-full border border-slate-700/60" />
            <div className="absolute inset-10 rounded-full border border-slate-800" />

            {/*
             * Logotipo com flutuação suave e brilho.
             */}
            <Image
              src="/kod-logo.png"
              alt={`Logotipo oficial do clã ${clan.name}`}
              width={420}
              height={420}
              preload
              className="relative h-auto w-[320px] max-w-none animate-[kodFloat_4s_ease-in-out_infinite] object-contain drop-shadow-[0_0_24px_rgba(245,158,11,0.35)] sm:w-[380px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
