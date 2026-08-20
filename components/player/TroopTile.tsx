/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/TroopTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente uma tropa da Vila Principal em
 * formato compacto.
 *
 * O componente apresenta:
 * • imagem da tropa;
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

import { getTroopAsset } from "@/config/assets";

type TroopTileProps = {
  troop: {
    name: string;
    level: number;
    maxLevel: number;
    village: string;
  };
};

/**
 * Renderiza uma tropa em formato visual compacto.
 */
export function TroopTile({ troop }: TroopTileProps) {
  /**
   * Recupera o asset correspondente à tropa.
   */
  const asset = getTroopAsset(troop.name);

  /**
   * Identifica se a tropa atingiu o nível máximo.
   */
  const isMax = troop.level >= troop.maxLevel;

  /**
   * O nível máximo é indicado pelo contorno do número,
   * mantendo a mesma linguagem visual dos equipamentos.
   */
  const levelClasses = isMax
    ? "border-amber-300 bg-slate-950 text-white ring-2 ring-amber-400/70"
    : "border-slate-700 bg-slate-950/90 text-white";

  return (
    <article className="group text-center">
      <div className="relative mx-auto flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition duration-300 group-hover:border-amber-400/40 sm:max-w-24">
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
          {troop.level}
        </span>
      </div>

      <p
        translate="no"
        className="notranslate mt-2 truncate text-xs font-bold text-slate-300"
        title={asset?.alt ?? troop.name}
      >
        {asset?.alt ?? troop.name}
      </p>
    </article>
  );
}
