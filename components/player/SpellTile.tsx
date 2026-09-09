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
 * Estratégia visual:
 *
 * • card com aparência neutra por padrão;
 * • destaque dourado quando o feitiço estiver maxado;
 * • hover com brilho suave;
 * • o estado máximo é comunicado apenas pela cor e pelo
 *   contorno, sem utilizar texto "MAX".
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
   * o nível máximo é comunicado pelo contorno e pela cor do
   * selo numérico.
   */
  const levelClasses = isMax
    ? "border-amber-300 bg-slate-950 text-white ring-2 ring-amber-400/70"
    : "border-slate-700 bg-slate-950/90 text-white";

  /**
   * Estilo do card principal.
   *
   * O padrão neutro é mantido para preservar consistência com
   * os demais cards do arsenal. Quando o feitiço está maxado,
   * apenas o contorno recebe destaque dourado.
   */
  const cardClasses = isMax
    ? "border-amber-400/80 bg-slate-900/60 shadow-[0_0_18px_rgba(250,204,21,0.14)]"
    : "border-slate-800 bg-slate-900/60 hover:border-amber-400/40";

  return (
    <article className="group text-center">
      <div
        className={[
          "relative mx-auto flex aspect-square w-full max-w-20 items-center justify-center overflow-hidden rounded-2xl border transition duration-300 sm:max-w-24",
          cardClasses,
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
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-xl font-black text-slate-500"
          >
            ?
          </div>
        )}

        <span
          className={[
            "absolute bottom-1 right-1 flex min-w-7 items-center justify-center rounded-lg border px-1.5 py-1 text-xs font-black shadow-lg transition duration-300",
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
