/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/PetTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente um Pet em formato compacto.
 *
 * O componente apresenta:
 * • imagem do Pet;
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

import { getPetAsset } from "@/config/assets";

type PetTileProps = {
  /**
   * Pet retornado pela Player API.
   */
  pet: {
    name: string;
    level: number;
    maxLevel: number;
    village: string;
  };
};

/**
 * Renderiza um Pet em formato visual compacto.
 */
export function PetTile({ pet }: PetTileProps) {
  /**
   * Recupera o asset correspondente.
   */
  const asset = getPetAsset(pet.name);

  /**
   * Identifica se o Pet atingiu seu nível máximo.
   */
  const isMax = pet.level >= pet.maxLevel;

  /**
   * O nível máximo utiliza um contorno verde, mantendo a
   * linguagem visual adotada no restante do perfil.
   */
  const levelClasses = isMax
    ? "border-emerald-300 bg-slate-950 text-white ring-2 ring-emerald-400/70"
    : "border-slate-700 bg-slate-950/90 text-white";

  return (
    <article className="group text-center">
      <div className="relative mx-auto flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/15 transition duration-300 group-hover:border-emerald-400/50 sm:max-w-24">
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
          {pet.level}
        </span>
      </div>

      <p
        translate="no"
        className="notranslate mt-2 truncate text-xs font-bold text-slate-300"
        title={asset?.alt ?? pet.name}
      >
        {asset?.alt ?? pet.name}
      </p>
    </article>
  );
}
