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
   * O nível máximo utiliza o mesmo padrão visual aplicado
   * às demais categorias do perfil.
   */
  const levelClasses = isMax
    ? "border-orange-300 bg-slate-950 text-white ring-2 ring-orange-400/70"
    : "border-slate-700 bg-slate-950/90 text-white";

  return (
    <article className="group text-center">
      <div className="relative mx-auto flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-2xl border border-orange-500/20 bg-orange-950/15 transition duration-300 group-hover:border-orange-400/50 sm:max-w-24">
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
          {siegeMachine.level}
        </span>
      </div>

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
