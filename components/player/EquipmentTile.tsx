/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/EquipmentTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente um equipamento de herói em formato
 * compacto, utilizando os assets locais cadastrados no
 * catálogo central.
 *
 * O componente apresenta:
 * • imagem do equipamento;
 * • nível atual;
 * • raridade visual;
 * • destaque de nível máximo;
 * • fallback quando não houver asset conhecido.
 *
 * Estratégia visual:
 *
 * • equipamentos comuns utilizam identidade azul/ciano;
 * • equipamentos épicos utilizam identidade roxa;
 * • o nível máximo não utiliza texto "MAX";
 * • o próprio selo numérico recebe destaque visual quando o
 *   nível máximo é atingido.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 18/08/2026
 *
 * Versão:
 * 0.8.8
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

"use client";

import Image from "next/image";

import { getEquipmentAsset } from "@/config/assets";

import type { PlayerHeroEquipment } from "@/types/player";

type EquipmentTileProps = {
  /**
   * Equipamento retornado pela Player API.
   */
  equipment: PlayerHeroEquipment;
};

/**
 * Renderiza um equipamento de herói em formato compacto.
 */
export function EquipmentTile({ equipment }: EquipmentTileProps) {
  /**
   * Recupera o recurso visual correspondente ao equipamento.
   */
  const asset = getEquipmentAsset(equipment.name);

  /**
   * Identifica se o equipamento atingiu o nível máximo.
   */
  const isMax = equipment.level >= equipment.maxLevel;

  /**
   * Define a identidade visual com base na raridade.
   *
   * Quando o asset ainda não estiver cadastrado, utilizamos
   * aparência neutra.
   */
  const rarityClasses =
    asset?.rarity === "epic"
      ? "border-fuchsia-400/40 bg-gradient-to-b from-fuchsia-500/20 via-purple-950/25 to-slate-950/70"
      : asset?.rarity === "common"
        ? "border-cyan-400/30 bg-gradient-to-b from-cyan-400/15 via-sky-950/25 to-slate-950/70"
        : "border-slate-800 bg-slate-900/60";

  /**
   * O nível máximo é indicado pelo próprio selo numérico,
   * evitando uma segunda legenda textual.
   */
  const levelClasses = isMax
    ? asset?.rarity === "epic"
      ? "border-fuchsia-300 bg-slate-950 text-white ring-2 ring-fuchsia-400/70"
      : "border-cyan-300 bg-slate-950 text-white ring-2 ring-cyan-400/70"
    : "border-slate-700 bg-slate-950/90 text-white";

  return (
    <article className="group text-center">
      {/*
       * Área visual principal do equipamento.
       */}
      <div
        className={[
          "relative mx-auto flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-2xl border transition duration-300 sm:max-w-24",
          rarityClasses,
        ].join(" ")}
      >
        {asset ? (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="96px"
            className="object-contain p-1 transition duration-300 group-hover:scale-105"
          />
        ) : (
          /*
           * Fallback utilizado para equipamentos ainda sem
           * asset validado.
           *
           * Exemplo atual:
           * Noble Iron.
           */
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-xl font-black text-slate-500"
          >
            ?
          </div>
        )}

        {/*
         * Selo numérico do nível.
         *
         * O estado máximo é representado exclusivamente pelo
         * contorno especial do próprio selo.
         */}
        <span
          className={[
            "absolute bottom-1 right-1 flex min-w-7 items-center justify-center rounded-lg border px-1.5 py-1 text-xs font-black shadow-lg",
            levelClasses,
          ].join(" ")}
        >
          {equipment.level}
        </span>
      </div>

      {/*
       * Nome do equipamento.
       *
       * Mantemos nesta etapa para facilitar a validação dos
       * assets e da correspondência com a Player API.
       */}
      <p
        translate="no"
        className="notranslate mt-2 truncate text-xs font-bold text-slate-300"
        title={asset?.alt ?? equipment.name}
      >
        {asset?.alt ?? equipment.name}
      </p>
    </article>
  );
}
