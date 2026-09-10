/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/HeroTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente um herói da Vila Principal em
 * formato compacto, utilizando os recursos gráficos locais
 * cadastrados no catálogo central de assets.
 *
 * O componente apresenta:
 * • imagem oficial do herói;
 * • nível atual;
 * • nível máximo disponível;
 * • percentual nominal de evolução;
 * • indicação visual quando o nível máximo foi atingido;
 * • ajustes individuais de escala e posicionamento;
 * • fallback quando a imagem não estiver cadastrada.
 *
 * Estratégia visual:
 *
 * • itens não maximizados utilizam a paleta neutra;
 * • itens maximizados são identificados exclusivamente
 *   através de contorno dourado e brilho sutil;
 * • não utilizamos selo ou texto "MAX";
 * • o dourado #FACC15 representa o estado maximizado;
 * • a estrutura externa do card permanece neutra;
 * • ajustes individuais permanecem centralizados
 *   em config/assets.ts.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 09/09/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

"use client";

import Image from "next/image";

import { getHeroAsset } from "@/config/assets";

import type { PlayerHero } from "@/types/player";

/**
 * ==========================================================
 * PROPRIEDADES
 * ==========================================================
 */

type HeroTileProps = {
  /**
   * Dados atuais do herói retornados pela Player API.
   */
  hero: PlayerHero;
};

/**
 * ==========================================================
 * COMPONENTE
 * ==========================================================
 */

export function HeroTile({ hero }: HeroTileProps) {
  /**
   * Recupera o recurso gráfico correspondente ao nome
   * retornado pela API.
   */
  const asset = getHeroAsset(hero.name);

  /**
   * Identifica se o herói atingiu o nível máximo atualmente
   * informado pela API.
   */
  const isMax = hero.level >= hero.maxLevel;

  /**
   * Percentual nominal de evolução.
   */
  const progress =
    hero.maxLevel > 0
      ? Math.min(100, Math.round((hero.level / hero.maxLevel) * 100))
      : 0;

  /**
   * ========================================================
   * ESTADOS VISUAIS
   * ========================================================
   */

  const cardClassName = [
    "group rounded-2xl border",
    "border-slate-800",
    "bg-slate-900/60",
    "p-3 text-center",
    "transition-all duration-300",
    "hover:border-slate-700",
    "hover:bg-slate-900/80",
  ].join(" ");

  const imageContainerClassName = isMax
    ? [
        "relative mx-auto flex aspect-square w-full max-w-24",
        "items-center justify-center overflow-hidden rounded-2xl border",
        "border-[#FACC15]/80",
        "bg-slate-950/70",
        "shadow-[0_0_0_1px_rgba(250,204,21,0.06),0_0_12px_rgba(250,204,21,0.05)]",
        "transition-all duration-300",
        "group-hover:border-[#FACC15]",
        "group-hover:shadow-[0_0_0_1px_rgba(250,204,21,0.14),0_0_20px_rgba(250,204,21,0.20)]",
        "sm:max-w-28",
      ].join(" ")
    : [
        "relative mx-auto flex aspect-square w-full max-w-24",
        "items-center justify-center overflow-hidden rounded-2xl border",
        "border-slate-800",
        "bg-slate-950/70",
        "transition-all duration-300",
        "group-hover:border-slate-700",
        "sm:max-w-28",
      ].join(" ");

  const levelBadgeClassName = isMax
    ? [
        "absolute bottom-1 right-1 z-10 flex min-w-7",
        "items-center justify-center rounded-lg border",
        "border-[#FACC15]/90",
        "bg-slate-950/95",
        "px-1.5 py-1",
        "text-xs font-black text-white",
        "shadow-[0_0_8px_rgba(250,204,21,0.14)]",
        "transition-all duration-300",
        "group-hover:border-[#FACC15]",
        "group-hover:shadow-[0_0_14px_rgba(250,204,21,0.30)]",
      ].join(" ")
    : [
        "absolute bottom-1 right-1 z-10 flex min-w-7",
        "items-center justify-center rounded-lg border",
        "border-slate-700",
        "bg-slate-950/90",
        "px-1.5 py-1",
        "text-xs font-black text-white",
        "shadow-lg",
        "transition-all duration-300",
        "group-hover:border-slate-600",
      ].join(" ");

  return (
    <article className={cardClassName}>
      {/**
       * ====================================================
       * IMAGEM
       * ====================================================
       *
       * A primeira camada controla o efeito de hover.
       *
       * A segunda camada aplica os ajustes individuais
       * definidos no catálogo central:
       *
       * • scale;
       * • translateX;
       * • translateY.
       *
       * As duas transformações ficam separadas para evitar
       * conflito entre o hover e o posicionamento do asset.
       */}

      <div className={imageContainerClassName}>
        {asset ? (
          <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
            <div
              className="absolute inset-0"
              style={{
                transform: [
                  `translateX(${asset.translateX ?? 0}px)`,
                  `translateY(${asset.translateY ?? 0}px)`,
                  `scale(${asset.scale ?? 1})`,
                ].join(" "),
              }}
            >
              <Image
                src={asset.src}
                alt={asset.alt}
                fill
                sizes="112px"
                className="object-contain p-1"
              />
            </div>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-2xl"
          >
            ⚔️
          </div>
        )}

        {/**
         * ==================================================
         * NÍVEL
         * ==================================================
         */}

        <span className={levelBadgeClassName}>{hero.level}</span>
      </div>

      {/**
       * ====================================================
       * NOME
       * ====================================================
       */}

      <p
        translate="no"
        className="notranslate mt-3 truncate text-sm font-black text-slate-50"
      >
        {asset?.alt ?? hero.name ?? "Herói"}
      </p>

      {/**
       * ====================================================
       * PROGRESSO
       * ====================================================
       */}

      <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
        <span className="font-bold text-slate-400">
          {hero.level}/{hero.maxLevel}
        </span>

        {!isMax && (
          <span className="text-[10px] font-bold text-slate-500">
            {progress}%
          </span>
        )}
      </div>
    </article>
  );
}
