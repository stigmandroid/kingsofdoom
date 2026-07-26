/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/clan/TownHallBadge.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente o Centro de Vila de um jogador,
 * utilizando imagens locais configuradas de forma
 * centralizada.
 *
 * O componente mantém um contêiner de tamanho fixo para
 * todos os níveis e aplica ajustes individuais de escala
 * e posicionamento para equilibrar o peso visual das artes.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getTownHallAsset } from "@/config/assets";

type TownHallBadgeProps = {
  /**
   * Nível atual do Centro de Vila.
   */
  level: number;
};

/**
 * Retorna as classes visuais utilizadas pelo fallback.
 *
 * O fallback aparece quando o nível ainda não possui uma
 * imagem configurada ou quando ocorre erro no carregamento
 * do arquivo local.
 */
function getTownHallFallbackClasses(level: number) {
  if (level >= 17) {
    return "border-amber-400/40 bg-amber-400/10 text-amber-300";
  }

  if (level >= 15) {
    return "border-purple-400/40 bg-purple-400/10 text-purple-300";
  }

  if (level >= 13) {
    return "border-blue-400/40 bg-blue-400/10 text-blue-300";
  }

  return "border-slate-600 bg-slate-800 text-slate-300";
}

/**
 * Renderiza a imagem ou o fallback textual do Centro de Vila.
 */
export function TownHallBadge({ level }: TownHallBadgeProps) {
  /**
   * Controla erros de carregamento da imagem.
   *
   * Caso o arquivo esteja ausente, com nome incorreto ou
   * corrompido, o componente passa a exibir o fallback.
   */
  const [hasImageError, setHasImageError] = useState(false);

  /**
   * Recupera o caminho, a escala e os ajustes de posição
   * definidos no arquivo central de assets.
   */
  const asset = getTownHallAsset(level);

  /**
   * Reseta o estado de erro quando o nível recebido mudar.
   *
   * Isso é importante caso o mesmo componente seja reutilizado
   * para apresentar outro jogador ou outro Centro de Vila.
   */
  useEffect(() => {
    setHasImageError(false);
  }, [level]);

  /**
   * A imagem será apresentada somente quando existir uma
   * configuração válida e nenhum erro tiver ocorrido.
   */
  const shouldShowImage = Boolean(asset) && !hasImageError;

  if (shouldShowImage && asset) {
    /**
     * Os ajustes opcionais recebem zero como valor padrão.
     */
    const translateX = asset.translateX ?? 0;
    const translateY = asset.translateY ?? 0;

    return (
      <div
        role="img"
        aria-label={asset.alt}
        className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-visible rounded-2xl border border-slate-700/80 bg-slate-950/70 shadow-inner shadow-black/40"
      >
        {/*
         * A camada externa controla exclusivamente a animação
         * de hover.
         *
         * Dessa forma, o hover não sobrescreve o transform
         * utilizado para ajustar cada imagem individualmente.
         */}
        <div className="relative h-14 w-14 transition-transform duration-300 ease-out group-hover:scale-110">
          {/*
           * A camada interna controla a escala e o alinhamento
           * definidos no arquivo config/assets.ts.
           */}
          <div
            className="relative h-full w-full"
            style={{
              transform: `translate(${translateX}px, ${translateY}px) scale(${asset.scale})`,
              transformOrigin: "center",
            }}
          >
            <Image
              src={asset.src}
              alt={asset.alt}
              fill
              sizes="56px"
              priority={level >= 17}
              onError={() => {
                /**
                 * Ativa o fallback quando a imagem não puder
                 * ser carregada pelo navegador.
                 */
                setHasImageError(true);
              }}
              className="object-contain"
            />
          </div>
        </div>

        {/*
         * Identificador numérico sobreposto à imagem.
         *
         * O selo mantém o nível sempre visível, mesmo quando
         * a arte do Centro de Vila possui muitos detalhes.
         */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-amber-300/40 bg-slate-950 px-1 text-[10px] font-bold text-amber-300 shadow-lg"
        >
          {level}
        </span>
      </div>
    );
  }

  /**
   * Fallback textual utilizado para níveis sem imagem ou
   * quando ocorre uma falha no carregamento do arquivo.
   */
  return (
    <div
      role="img"
      aria-label={`Centro de Vila nível ${level}`}
      className={`flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-2xl border ${getTownHallFallbackClasses(
        level,
      )}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
        CV
      </span>

      <span className="text-xl font-bold leading-none">{level}</span>
    </div>
  );
}
