"use client";

/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/war/HistoricalWarDetailTabs.tsx
 *
 * Responsabilidade:
 * Organizar a guerra histórica completa em subáreas para
 * evitar páginas excessivamente longas, principalmente
 * no mobile.
 *
 * Estratégia mobile-first:
 *
 * - apenas uma área pesada é renderizada por vez;
 * - subnavegação horizontal com botões grandes para toque;
 * - nenhuma tabela obrigatória;
 * - mapa completo permanece disponível sob demanda.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 15/08/2026
 *
 * Versão:
 * 0.9.2
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { useState } from "react";

import { WarOverview } from "@/components/dashboard/WarOverview";
import { WarPendingAttacks } from "@/components/dashboard/WarPendingAttacks";
import { WarMap } from "@/components/dashboard/WarMap";

import type { CurrentWarResult } from "@/types/war";

type HistoricalWarDetailTabsProps = {
  result: CurrentWarResult;
};

type DetailTab = "summary" | "map" | "pending";

const tabs: Array<{
  id: DetailTab;
  label: string;
}> = [
  {
    id: "summary",
    label: "Resumo",
  },
  {
    id: "map",
    label: "Mapa",
  },
  {
    id: "pending",
    label: "Ataques não usados",
  },
];

export function HistoricalWarDetailTabs({
  result,
}: HistoricalWarDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");

  return (
    <>
      <section className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-2 gap-2 py-3 sm:flex sm:flex-wrap"
            aria-label="Seções da guerra histórica"
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "min-h-11 rounded-xl border px-3 py-2 text-sm font-black transition sm:shrink-0 sm:px-4",
                    tab.id === "pending" ? "col-span-2 sm:col-span-1" : "",
                    active
                      ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {activeTab === "summary" && (
        <WarOverview
          result={result}
          showWarRoomLink={false}
          mode="historical"
        />
      )}

      {activeTab === "map" && <WarMap result={result} />}

      {activeTab === "pending" && <WarPendingAttacks result={result} />}
    </>
  );
}
