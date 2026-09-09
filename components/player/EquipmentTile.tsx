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
 * • destaque visual quando o nível máximo foi atingido;
 * • fallback quando não houver asset conhecido.
 *
 * Estratégia visual:
 *
 * • a raridade é comunicada pelo fundo interno:
 *   - comum = azul;
 *   - épico = roxo;
 *
 * • o status de maximização é comunicado por:
 *   - borda dourada/amarela;
 *   - contorno do selo de nível;
 *   - glow discreto no hover;
 *
 * • itens não maximizados utilizam borda neutra;
 * • não utilizamos texto "MAX";
 * • raridade e status permanecem visualmente independentes.
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

import { getEquipmentAsset } from "@/config/assets";

import type { PlayerHeroEquipment } from "@/types/player";

/**
 * ==========================================================
 * PROPRIEDADES
 * ==========================================================
 */

type EquipmentTileProps = {
  equipment: PlayerHeroEquipment;
};

/**
 * ==========================================================
 * COMPONENTE
 * ==========================================================
 */

export function EquipmentTile({ equipment }: EquipmentTileProps) {
  /**
   * Recupera o asset correspondente ao equipamento.
   */
  const asset = getEquipmentAsset(equipment.name);

  /**
   * Identifica se o equipamento atingiu o nível máximo.
   */
  const isMax = equipment.level >= equipment.maxLevel;

  /**
   * ========================================================
   * RARIDADE
   * ========================================================
   *
   * A raridade é identificada pelo fundo interno.
   *
   * Mantemos contraste suficiente para que comum e épico
   * possam ser reconhecidos mesmo quando ambos estiverem
   * maximizados.
   */

  const rarityBackgroundClasses =
    asset?.rarity === "epic"
      ? [
          "bg-gradient-to-b",
          "from-fuchsia-500/38",
          "via-purple-800/32",
          "to-slate-950/82",
          "shadow-[inset_0_0_24px_rgba(192,38,211,0.10)]",
        ].join(" ")
      : asset?.rarity === "common"
        ? [
            "bg-gradient-to-b",
            "from-sky-500/28",
            "via-blue-900/34",
            "to-slate-950/84",
            "shadow-[inset_0_0_24px_rgba(14,165,233,0.08)]",
          ].join(" ")
        : [
            "bg-slate-900/60",
            "shadow-[inset_0_0_18px_rgba(148,163,184,0.03)]",
          ].join(" ");

  /**
   * ========================================================
   * BORDA / STATUS
   * ========================================================
   *
   * A borda comunica apenas o status de maximização.
   *
   * Não max:
   * • borda neutra;
   *
   * Max:
   * • borda dourada/amarela;
   * • glow reforçado no hover.
   */

  const equipmentBorderClasses = isMax
    ? [
        "border-[#FACC15]/80",
        "shadow-[0_0_0_1px_rgba(250,204,21,0.05),0_0_10px_rgba(250,204,21,0.04)]",
        "group-hover:border-[#FACC15]",
        "group-hover:shadow-[0_0_0_1px_rgba(250,204,21,0.12),0_0_20px_rgba(250,204,21,0.18)]",
      ].join(" ")
    : ["border-slate-700/75", "group-hover:border-slate-600"].join(" ");

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

      <div
        className={[
          "relative mx-auto flex aspect-square w-full max-w-20",
          "items-center justify-center overflow-hidden rounded-2xl border",
          "transition-all duration-300 sm:max-w-24",
          rarityBackgroundClasses,
          equipmentBorderClasses,
        ].join(" ")}
      >
        {asset ? (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="96px"
            className="object-contain p-1 transition duration-300 group-hover:scale-105"
            style={{
              transform: [
                `translateX(${asset.translateX ?? 0}px)`,
                `translateY(${asset.translateY ?? 0}px)`,
                `scale(${asset.scale ?? 1})`,
              ].join(" "),
            }}
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
          {equipment.level}
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
        title={asset?.alt ?? equipment.name}
      >
        {asset?.alt ?? equipment.name}
      </p>
    </article>
  );
}
