/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/SiegeMachineTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente uma Máquina de Cerco em formato
 * compacto.
 *
 * O componente apresenta:
 * • imagem da máquina;
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
 * • a categoria Cerco não possui cor própria de status,
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

import { getSiegeMachineAsset } from "@/config/assets";

type SiegeMachineTileProps = {
  /**
   * Máquina retornada pela Player API.
   */
  siegeMachine: {
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
 * Renderiza uma Máquina de Cerco em formato visual compacto.
 */
export function SiegeMachineTile({ siegeMachine }: SiegeMachineTileProps) {
  /**
   * Recupera o asset correspondente.
   */
  const asset = getSiegeMachineAsset(siegeMachine.name);

  /**
   * Identifica se a máquina atingiu o nível máximo.
   */
  const isMax = siegeMachine.level >= siegeMachine.maxLevel;

  /**
   * ========================================================
   * ÁREA VISUAL
   * ========================================================
   *
   * A borda representa exclusivamente o status do item.
   */

  const siegeContainerClassName = isMax
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

      <div className={siegeContainerClassName}>
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
          {siegeMachine.level}
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
        title={asset?.alt ?? siegeMachine.name}
      >
        {asset?.alt ?? siegeMachine.name}
      </p>
    </article>
  );
}
