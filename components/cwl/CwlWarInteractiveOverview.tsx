/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * components/cwl/CwlWarInteractiveOverview.tsx
 *
 * Responsabilidade:
 * Permitir alternar entre os dois clãs de uma guerra
 * da CWL e consultar o acompanhamento ofensivo de cada lado.
 *
 * Funcionalidades:
 *
 * - exibe o placar dos dois clãs;
 * - permite selecionar um clã clicando em seu card;
 * - destaca visualmente o lado selecionado;
 * - atualiza a lista de ataques sem recarregar a página;
 * - preserva o clã do portal como seleção inicial.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 04/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

"use client";

import Image from "next/image";
import { useState } from "react";

import { CwlAttackOverview } from "@/components/cwl/CwlAttackOverview";
import type { CurrentWar } from "@/types/war";

/**
 * Representa um dos lados válidos da guerra.
 */
type CwlWarClan = NonNullable<CurrentWar["clan"]>;

/**
 * Propriedades recebidas pelo componente.
 */
type CwlWarInteractiveOverviewProps = {
  /**
   * Primeiro lado retornado pela Clash API.
   */
  clan: CwlWarClan;

  /**
   * Segundo lado retornado pela Clash API.
   */
  opponent: CwlWarClan;

  /**
   * Tag do clã selecionado no portal.
   *
   * Ela define qual card começa aberto.
   */
  initialSelectedClanTag: string;

  /**
   * Quantidade de jogadores por lado.
   */
  teamSize?: number;
};

/**
 * Exibe o placar e permite alternar o acompanhamento
 * ofensivo entre os dois clãs.
 */
export function CwlWarInteractiveOverview({
  clan,
  opponent,
  initialSelectedClanTag,
  teamSize,
}: CwlWarInteractiveOverviewProps) {
  /**
   * Mantém a tag do clã cujo acompanhamento está visível.
   */
  const [selectedClanTag, setSelectedClanTag] = useState(
    initialSelectedClanTag,
  );

  /**
   * Localiza os dados completos do lado selecionado.
   */
  const selectedWarClan = selectedClanTag === clan.tag ? clan : opponent;

  /**
   * Identifica o lado adversário ao clã atualmente
   * selecionado.
   */
  const opposingWarClan = selectedClanTag === clan.tag ? opponent : clan;

  return (
    <>
      {/*
       * Placar interativo dos dois lados.
       */}
      <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <CwlSelectableClanCard
          clan={clan}
          selected={selectedClanTag === clan.tag}
          onSelect={() => {
            setSelectedClanTag(clan.tag);
          }}
        />

        <div className="flex items-center justify-center py-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-600">
              VS
            </span>

            <span className="mt-3 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-black text-white">
              {teamSize ?? "—"} × {teamSize ?? "—"}
            </span>
          </div>
        </div>

        <CwlSelectableClanCard
          clan={opponent}
          selected={selectedClanTag === opponent.tag}
          onSelect={() => {
            setSelectedClanTag(opponent.tag);
          }}
        />
      </div>

      {/*
       * Acompanhamento ofensivo correspondente ao card
       * atualmente selecionado.
       */}
      <div className="mt-8">
        <CwlAttackOverview
          clanName={selectedWarClan.name}
          members={selectedWarClan.members}
          opponentMembers={opposingWarClan.members}
        />
      </div>
    </>
  );
}

/**
 * Propriedades do card selecionável.
 */
type CwlSelectableClanCardProps = {
  clan: CwlWarClan;
  selected: boolean;
  onSelect: () => void;
};

/**
 * Exibe um clã do confronto como um botão acessível.
 */
function CwlSelectableClanCard({
  clan,
  selected,
  onSelect,
}: CwlSelectableClanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group w-full rounded-3xl border p-6 text-center transition duration-200 sm:p-8 ${
        selected
          ? "border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-950/20"
          : "border-slate-800 bg-slate-900/70 hover:border-slate-600 hover:bg-slate-900"
      }`}
    >
      <Image
        src={clan.badgeUrls.medium}
        alt={`Escudo oficial do clã ${clan.name}`}
        width={112}
        height={112}
        className={`mx-auto h-24 w-24 object-contain transition duration-200 ${
          selected
            ? "drop-shadow-[0_0_18px_rgba(251,191,36,0.30)]"
            : "group-hover:scale-[1.03]"
        }`}
      />

      <h2
        translate="no"
        className={`notranslate mt-5 truncate text-2xl font-black ${
          selected ? "text-amber-300" : "text-white"
        }`}
      >
        {clan.name}
      </h2>

      <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-3">
        <span className="text-2xl text-amber-300">★</span>

        <span className="text-4xl font-black text-amber-300">{clan.stars}</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Destruição
          </p>

          <p className="mt-2 text-xl font-black text-white">
            {formatPercentage(clan.destructionPercentage)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Ataques
          </p>

          <p className="mt-2 text-xl font-black text-white">{clan.attacks}</p>
        </div>
      </div>

      <p
        className={`mt-5 text-[10px] font-black uppercase tracking-[0.16em] ${
          selected ? "text-amber-300" : "text-slate-600"
        }`}
      >
        {selected
          ? "Acompanhamento exibido abaixo"
          : "Clique para visualizar os ataques"}
      </p>
    </button>
  );
}

/**
 * Formata a porcentagem de destruição.
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2).replace(".", ",")}%`;
}
