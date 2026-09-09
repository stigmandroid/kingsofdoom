"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/player/ArmyTabs.tsx
 *
 * Responsabilidade:
 * Organizar as categorias do arsenal do jogador em uma
 * navegação compacta e responsiva.
 *
 * A interface permite alternar entre:
 *
 * • Heróis;
 * • Equipamentos;
 * • Tropas;
 * • Feitiços;
 * • Máquinas de Cerco;
 * • Pets.
 *
 * Estratégia responsiva:
 *
 * • no mobile, as categorias são distribuídas em duas linhas
 *   centralizadas, evitando scroll horizontal;
 * • em telas maiores, os controles permanecem em uma única
 *   linha;
 * • somente uma categoria é exibida por vez para reduzir o
 *   comprimento total do perfil.
 *
 * Direção visual:
 *
 * • dourado representa navegação e destaque institucional;
 * • o estado ativo usa borda e fundo dourados discretos;
 * • estados de progresso/maximização pertencem aos tiles,
 *   não às abas de navegação.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/09/2026
 *
 * Versão:
 * 0.9.1
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { type ReactNode, useState } from "react";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

export type ArmyTabId =
  | "heroes"
  | "equipment"
  | "troops"
  | "spells"
  | "siege"
  | "pets";

type ArmyTabsProps = {
  heroes: ReactNode;
  equipment: ReactNode;
  troops: ReactNode;
  spells: ReactNode;
  siege: ReactNode;
  pets: ReactNode;
};

type ArmyTab = {
  id: ArmyTabId;
  label: string;
};

/**
 * ==========================================================
 * CATEGORIAS
 * ==========================================================
 */

const tabs: ArmyTab[] = [
  {
    id: "heroes",
    label: "Heróis",
  },
  {
    id: "equipment",
    label: "Equipamentos",
  },
  {
    id: "troops",
    label: "Tropas",
  },
  {
    id: "spells",
    label: "Feitiços",
  },
  {
    id: "siege",
    label: "Cerco",
  },
  {
    id: "pets",
    label: "Pets",
  },
];

/**
 * ==========================================================
 * COMPONENTE PRINCIPAL
 * ==========================================================
 */

export default function ArmyTabs({
  heroes,
  equipment,
  troops,
  spells,
  siege,
  pets,
}: ArmyTabsProps) {
  const [activeTab, setActiveTab] = useState<ArmyTabId>("heroes");

  /**
   * ========================================================
   * CONTEÚDO
   * ========================================================
   */

  const content: Record<ArmyTabId, ReactNode> = {
    heroes,
    equipment,
    troops,
    spells,
    siege,
    pets,
  };

  return (
    <section className="border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/**
         * ====================================================
         * CABEÇALHO
         * ====================================================
         */}

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
            Exército
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-50 sm:text-3xl">
            Arsenal do jogador
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Consulte o progresso atual de cada categoria do exército.
          </p>
        </div>

        {/**
         * ====================================================
         * NAVEGAÇÃO
         * ====================================================
         *
         * Mobile:
         * três controles por linha, em duas linhas.
         *
         * Desktop:
         * seis controles em uma única linha centralizada.
         *
         * Não utilizamos scroll horizontal.
         */}

        <div
          className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:justify-center md:gap-2.5"
          role="tablist"
          aria-label="Categorias do exército"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex min-h-[44px] min-w-0 items-center justify-center rounded-xl border px-2 py-2 text-center text-xs font-semibold transition-all duration-200 md:min-h-[46px] md:min-w-[120px] md:px-5 md:text-sm",
                  isActive
                    ? "border-amber-400/60 bg-amber-400/[0.09] text-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.05)]"
                    : "border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700 hover:bg-slate-900/50 hover:text-slate-100",
                ].join(" ")}
              >
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/**
         * ====================================================
         * CONTEÚDO ATIVO
         * ====================================================
         *
         * Somente uma categoria permanece visível por vez.
         */}

        <div className="mt-7">{content[activeTab]}</div>
      </div>
    </section>
  );
}
