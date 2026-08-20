/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/SpellTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente um feitiço da Vila Principal em
 * formato compacto.
 *
 * O componente apresenta:
 * • imagem do feitiço;
 * • nível atual;
 * • destaque visual quando o nível máximo for atingido;
 * • fallback para assets ainda não cadastrados.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 19/08/2026
 *
 * Versão:
 * 0.8.9
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

"use client";

import Image from "next/image";

import { getSpellAsset } from "@/config/assets";

type SpellTileProps = {
  /**
   * Feitiço retornado pela Player API.
   */
  spell: {
    name: string;
    level: number;
    maxLevel: number;
    village: string;
  };
};

/**
 * Renderiza um feitiço em formato visual compacto.
 */
export function SpellTile({ spell }: SpellTileProps) {
  /**
   * Recupera o asset correspondente ao feitiço.
   */
  const asset = getSpellAsset(spell.name);

  /**
   * Identifica se o feitiço atingiu o nível máximo.
   */
  const isMax = spell.level >= spell.maxLevel;

  /**
   * Mantém a mesma linguagem visual utilizada nas tropas:
   * o nível máximo é comunicado pelo contorno do número.
   */
  const levelClasses = isMax
    ? "border-violet-300 bg-slate-950 text-white ring-2 ring-violet-400/70"
    : "border-slate-700 bg-slate-950/90 text-white";

  return (
    <article className="group text-center">
      <div className="relative mx-auto flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-950/20 transition duration-300 group-hover:border-violet-400/50 sm:max-w-24">
        {asset ? (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="96px"
            className="object-contain p-1 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-xl font-black text-slate-500"
          >
            ?
          </div>
        )}

        <span
          className={[
            "absolute bottom-1 right-1 flex min-w-7 items-center justify-center rounded-lg border px-1.5 py-1 text-xs font-black shadow-lg",
            levelClasses,
          ].join(" ")}
        >
          {spell.level}
        </span>
      </div>

      <p
        translate="no"
        className="notranslate mt-2 truncate text-xs font-bold text-slate-300"
        title={asset?.alt ?? spell.name}
      >
        {asset?.alt ?? spell.name}
      </p>
    </article>
  );
}
