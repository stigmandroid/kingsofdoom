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
 * Estratégia visual:
 *
 * • itens não maximizados utilizam aparência neutra;
 * • itens maximizados utilizam contorno dourado/amarelo;
 * • o selo de nível acompanha o mesmo estado visual;
 * • o glow é reforçado no hover;
 * • não utilizamos texto "MAX";
 * • a categoria Pets não possui cor própria de status,
 *   preservando a consistência visual do Arsenal.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/09/2026
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
 * ==========================================================
 * COMPONENTE
 * ==========================================================
 */

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
   * ========================================================
   * ÁREA VISUAL
   * ========================================================
   *
   * A borda representa exclusivamente o status do item.
   */

  const petContainerClassName = isMax
    ? [
        "relative mx-auto flex aspect-square w-full max-w-20",
        "items-center justify-center overflow-hidden rounded-2xl border",
        "border-[#FACC15]/80",
        "bg-slate-900/60",
        "shadow-[0_0_0_1px_rgba(250,204,21,0.05),0_0_10px_rgba(250,204,21,0.04)]",
        "transition-all duration-300",
        "group-hover:border-[#FACC15]",
        "group-hover:shadow-[0_0_0_1px_rgba(250,204,21,0.12),0_0_20px_rgba(250,204,21,0.18)]",
        "sm:max-w-24",
      ].join(" ")
    : [
        "relative mx-auto flex aspect-square w-full max-w-20",
        "items-center justify-center overflow-hidden rounded-2xl border",
        "border-slate-700/75",
        "bg-slate-900/60",
        "transition-all duration-300",
        "group-hover:border-slate-600",
        "sm:max-w-24",
      ].join(" ");

  /**
   * ========================================================
   * SELO DE NÍVEL
   * ========================================================
   */

  const levelClasses = isMax
    ? [
        "border-[#FACC15]/90",
        "bg-slate-950/95",
        "text-white",
        "shadow-[0_0_8px_rgba(250,204,21,0.14)]",
        "group-hover:border-[#FACC15]",
        "group-hover:shadow-[0_0_14px_rgba(250,204,21,0.30)]",
      ].join(" ")
    : [
        "border-slate-700",
        "bg-slate-950/90",
        "text-white",
        "group-hover:border-slate-600",
      ].join(" ");

  return (
    <article className="group text-center">
      {/**
       * ====================================================
       * ÁREA VISUAL PRINCIPAL
       * ====================================================
       */}

      <div className={petContainerClassName}>
        {asset ? (
          <div
            className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
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
              sizes="96px"
              className="object-contain p-1"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-xl font-black text-slate-500"
          >
            ?
          </div>
        )}

        {/**
         * ==================================================
         * NÍVEL
         * ==================================================
         */}

        <span
          className={[
            "absolute bottom-1 right-1 flex min-w-7",
            "items-center justify-center rounded-lg border",
            "px-1.5 py-1 text-xs font-black",
            "shadow-lg transition-all duration-300",
            levelClasses,
          ].join(" ")}
        >
          {pet.level}
        </span>
      </div>

      {/**
       * ====================================================
       * NOME
       * ====================================================
       */}

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
