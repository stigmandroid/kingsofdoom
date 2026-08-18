/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/HeroTile.tsx
 *
 * Responsabilidade:
 * Apresentar visualmente um herói da Vila Principal em
 * formato compacto, utilizando os recursos gráficos locais
 * cadastrados no catálogo central de assets.
 *
 * O componente apresenta:
 * • imagem oficial do herói;
 * • nível atual;
 * • nível máximo disponível;
 * • percentual nominal de evolução;
 * • indicação visual quando o nível máximo foi atingido;
 * • fallback quando a imagem não estiver cadastrada.
 *
 * Estratégia visual:
 *
 * O componente foi projetado para permitir a exibição de
 * vários heróis simultaneamente sem criar cards verticais
 * excessivamente grandes, principalmente em dispositivos
 * móveis.
 *
 * A resolução do asset permanece centralizada em
 * config/assets.ts. Dessa forma, este componente não precisa
 * conhecer diretamente caminhos de arquivos.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 17/08/2026
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

import { getHeroAsset } from "@/config/assets";

import type { PlayerHero } from "@/types/player";

/**
 * Propriedades recebidas pelo componente visual de herói.
 */
type HeroTileProps = {
  /**
   * Dados atuais do herói retornados pela Player API.
   */
  hero: PlayerHero;
};

/**
 * Renderiza um herói da Vila Principal em formato compacto.
 *
 * A API é responsável pelos dados dinâmicos, como nível
 * atual e nível máximo.
 *
 * O catálogo local de assets é responsável exclusivamente
 * pela representação visual do herói.
 */
export function HeroTile({ hero }: HeroTileProps) {
  /**
   * Recupera o recurso gráfico correspondente ao nome
   * retornado pela API.
   *
   * Caso ainda não exista uma imagem cadastrada para o
   * herói, o componente utilizará um fallback visual.
   */
  const asset = getHeroAsset(hero.name);

  /**
   * Identifica se o herói atingiu o nível máximo atualmente
   * informado pela API.
   */
  const isMax = hero.level >= hero.maxLevel;

  /**
   * Calcula o percentual nominal de evolução.
   *
   * Esse valor representa exclusivamente a relação entre
   * nível atual e nível máximo:
   *
   * nível atual / nível máximo × 100
   *
   * Portanto, não representa tempo, custo ou esforço real
   * necessário para concluir a evolução.
   */
  const progress =
    hero.maxLevel > 0
      ? Math.min(100, Math.round((hero.level / hero.maxLevel) * 100))
      : 0;

  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-center transition duration-300 hover:border-amber-400/40 hover:bg-slate-900">
      {/*
       * Área principal da imagem.
       *
       * O aspect-square mantém todos os heróis dentro de
       * contêineres visualmente consistentes mesmo quando as
       * imagens originais possuem proporções diferentes.
       */}
      <div className="relative mx-auto flex aspect-square w-full max-w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 sm:max-w-28">
        {asset ? (
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="112px"
            className="object-contain p-1 transition duration-300 group-hover:scale-105"
          />
        ) : (
          /*
           * Fallback utilizado caso o asset ainda não esteja
           * cadastrado ou o nome retornado pela API seja
           * desconhecido pelo catálogo local.
           */
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-2xl"
          >
            ⚔️
          </div>
        )}

        {/*
         * Selo sobreposto com o nível atual.
         *
         * Mantemos o nível diretamente sobre a imagem para
         * facilitar a leitura rápida em grades compactas.
         */}
        <span className="absolute bottom-1 right-1 flex min-w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-950/90 px-1.5 py-1 text-xs font-black text-white shadow-lg">
          {hero.level}
        </span>
      </div>

      {/*
       * Nome localizado visualmente por meio do catálogo de
       * assets.
       *
       * Quando não houver asset, utilizamos o nome original
       * retornado pela API.
       */}
      <p
        translate="no"
        className="notranslate mt-3 truncate text-sm font-black text-white"
      >
        {asset?.alt ?? hero.name ?? "Herói"}
      </p>

      {/*
       * Indicadores compactos de progressão.
       */}
      <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
        <span className="font-bold text-slate-500">
          {hero.level}/{hero.maxLevel}
        </span>

        {isMax ? (
          /*
           * Estado utilizado quando o nível máximo atual foi
           * atingido.
           */
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
            MAX
          </span>
        ) : (
          /*
           * Enquanto houver evolução disponível, exibimos o
           * percentual nominal calculado anteriormente.
           */
          <span className="text-[10px] font-bold text-amber-300">
            {progress}%
          </span>
        )}
      </div>
    </article>
  );
}
