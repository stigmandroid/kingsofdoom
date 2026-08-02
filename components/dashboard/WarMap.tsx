/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * WarMap.tsx
 *
 * Responsabilidade:
 * Exibir um mapa comparativo da guerra, apresentando
 * lado a lado as bases do K.O.D. e do clã adversário.
 *
 * Funcionalidades:
 *
 * - Ordena os jogadores pela posição no mapa;
 * - Compara as bases equivalentes dos dois clãs;
 * - Exibe Centro de Vila, nome e posição;
 * - Exibe o melhor ataque recebido por cada base;
 * - Exibe resumos defensivos dos dois clãs;
 * - Trata bases ainda não atacadas;
 * - Mantém funcionamento responsivo.
 *
 * Autor:
 * stigmandroid
 *
 * Versão:
 * 0.7.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

"use client";

import { useState } from "react";
import type { CurrentWarResult, WarMember } from "@/types/war";
import { WarAttackHistory } from "./WarAttackHistory";

/**
 * Propriedades recebidas pelo componente principal.
 */
type WarMapProps = {
  /**
   * Resultado da consulta da guerra atual.
   */
  result: CurrentWarResult;
};

/**
 * Resumo defensivo de um clã.
 */
type WarMapSummary = {
  /**
   * Bases que sofreram três estrelas e 100% de destruição.
   */
  destroyed: number;

  /**
   * Bases que receberam ataques, mas não foram totalmente destruídas.
   */
  damaged: number;

  /**
   * Bases que ainda não receberam nenhum ataque.
   */
  intact: number;
};

/**
 * Representa uma linha do mapa comparativo.
 *
 * Cada linha reúne os jogadores que ocupam a mesma
 * posição no mapa dos dois clãs.
 */
type WarMapPair = {
  /**
   * Jogador do clã principal.
   */
  clan: WarMember;

  /**
   * Jogador do clã adversário.
   */
  opponent: WarMember;
};

/**
 * Calcula o resumo defensivo de um grupo de jogadores.
 *
 * @param members Jogadores participantes da guerra.
 * @returns Quantidade de bases destruídas, danificadas e intactas.
 */
function getWarSummary(members: WarMember[]): WarMapSummary {
  /**
   * Bases completamente destruídas.
   */
  const destroyed = members.filter((member) => {
    const attack = member.bestOpponentAttack;

    return attack?.stars === 3 && attack.destructionPercentage === 100;
  }).length;

  /**
   * Bases atacadas, mas não completamente destruídas.
   */
  const damaged = members.filter((member) => {
    const attack = member.bestOpponentAttack;

    if (!attack) {
      return false;
    }

    return !(attack.stars === 3 && attack.destructionPercentage === 100);
  }).length;

  /**
   * Bases que ainda não receberam ataques.
   */
  const intact = members.length - destroyed - damaged;

  return {
    destroyed,
    damaged,
    intact,
  };
}

/**
 * Exibe o mapa comparativo da guerra atual.
 */
export function WarMap({ result }: WarMapProps) {
  /**
   * Não renderiza o componente quando a guerra
   * está indisponível.
   */
  if (!result.available) {
    return null;
  }

  /**
   * Após a validação acima, armazenamos os dois lados
   * em constantes locais para preservar o refinamento
   * de tipos dentro dos callbacks abaixo.
   */
  const war = result.war;

  /**
   * O comparativo depende obrigatoriamente dos dois lados.
   */
  if (!war.clan || !war.opponent) {
    return null;
  }

  /**
   * Após a validação acima, armazenamos os dois lados
   * em constantes locais para preservar o refinamento
   * de tipos dentro dos callbacks abaixo.
   */
  const clan = war.clan;
  const opponent = war.opponent;

  /**
   * Ordena os jogadores do clã principal pela posição
   * ocupada no mapa da guerra.
   */
  const clanMembers = [...clan.members].sort(
    (a, b) => a.mapPosition - b.mapPosition,
  );

  /**
   * Ordena os jogadores do adversário pela posição
   * ocupada no mapa da guerra.
   */
  const opponentMembers = [...opponent.members].sort(
    (a, b) => a.mapPosition - b.mapPosition,
  );

  /**
   * Cria um índice do adversário pela posição do mapa.
   *
   * Essa abordagem é mais segura do que combinar os jogadores
   * somente pelo índice do array, pois garante que as posições
   * equivalentes sejam realmente comparadas.
   */
  const opponentByPosition = new Map(
    opponentMembers.map((member) => [member.mapPosition, member]),
  );

  /**
   * Monta as linhas comparativas.
   *
   * Uma linha somente é adicionada quando existe um jogador
   * adversário ocupando a mesma posição.
   */
  const mapRows: WarMapPair[] = clanMembers.flatMap((clanMember) => {
    const opponentMember = opponentByPosition.get(clanMember.mapPosition);

    if (!opponentMember) {
      return [];
    }

    return [
      {
        clan: clanMember,
        opponent: opponentMember,
      },
    ];
  });

  /**
   * Calcula os indicadores defensivos dos dois clãs.
   */
  const clanSummary = getWarSummary(clanMembers);
  const opponentSummary = getWarSummary(opponentMembers);

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-red-400">
            Sala de Guerra
          </p>

          <h2 className="mt-4 text-3xl font-black text-white">
            Mapa da Guerra
          </h2>

          <p className="mt-3 max-w-3xl text-slate-400">
            Compare a situação defensiva das bases do K.O.D. e do adversário em
            cada posição do mapa.
          </p>

          {/*
           * Resumo defensivo dos dois clãs.
           */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <WarSummary
              clanName={clan.name}
              summary={clanSummary}
              perspective="own"
            />

            <WarSummary
              clanName={opponent.name}
              summary={opponentSummary}
              perspective="opponent"
            />
          </div>

          {/*
           * Cabeçalho do comparativo.
           *
           * No celular, cada lado ocupa uma linha.
           * Em telas maiores, os clãs aparecem lado a lado.
           */}
          <div className="mt-10 hidden grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 lg:grid">
            <p
              translate="no"
              className="notranslate text-sm font-black uppercase tracking-[0.2em] text-red-300"
            >
              {war.clan.name}
            </p>

            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">
              VS
            </span>

            <p
              translate="no"
              className="notranslate text-right text-sm font-black uppercase tracking-[0.2em] text-amber-300"
            >
              {war.opponent.name}
            </p>
          </div>

          {/*
           * Linhas do mapa comparativo.
           */}
          <div className="mt-4 space-y-3">
            {mapRows.map((row) => (
              <WarMapRow
                key={row.clan.mapPosition}
                row={row}
                attacksPerMember={war.attacksPerMember ?? 2}
                clanName={clan.name}
                opponentName={opponent.name}
                clanMembers={clanMembers}
                opponentMembers={opponentMembers}
              />
            ))}
          </div>

          {/*
           * Mensagem de segurança caso não seja possível
           * combinar as posições retornadas pela API.
           */}
          {mapRows.length === 0 && (
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
              <p className="text-sm font-semibold text-slate-400">
                Não foi possível montar o comparativo das bases.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type WarSummaryProps = {
  clanName: string;
  summary: WarMapSummary;

  /**
   * Define se o resumo pertence ao nosso clã
   * ou ao adversário.
   */
  perspective: "own" | "opponent";
};

function WarSummary({ clanName, summary, perspective }: WarSummaryProps) {
  /**
   * Para o adversário, bases destruídas representam
   * um resultado positivo para o nosso clã.
   */
  const destroyedClassName =
    perspective === "own" ? "text-red-400" : "text-emerald-400";

  /**
   * Para o adversário, bases intactas representam
   * um resultado negativo para o nosso clã.
   */
  const intactClassName =
    perspective === "own" ? "text-emerald-400" : "text-red-400";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <h3
        translate="no"
        className="notranslate truncate text-lg font-black text-white"
      >
        {clanName}
      </h3>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <WarSummaryItem
          label="Destruídas"
          value={summary.destroyed}
          valueClassName={destroyedClassName}
        />

        <WarSummaryItem
          label="Danificadas"
          value={summary.damaged}
          valueClassName="text-amber-300"
        />

        <WarSummaryItem
          label="Intactas"
          value={summary.intact}
          valueClassName={intactClassName}
        />
      </div>
    </article>
  );
}

/**
 * Propriedades de um indicador do resumo defensivo.
 */
type WarSummaryItemProps = {
  label: string;
  value: number;
  valueClassName: string;
};

/**
 * Exibe um único indicador do resumo defensivo.
 */
function WarSummaryItem({ label, value, valueClassName }: WarSummaryItemProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
      <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-black ${valueClassName}`}>{value}</p>
    </div>
  );
}

/**
 * Propriedades recebidas por cada linha do mapa.
 */
type WarMapRowProps = {
  row: WarMapPair;
  attacksPerMember: number;
  clanName: string;
  opponentName: string;
  clanMembers: WarMember[];
  opponentMembers: WarMember[];
};

function WarMapRow({
  row,
  attacksPerMember,
  clanName,
  opponentName,
  clanMembers,
  opponentMembers,
}: WarMapRowProps) {
  const { clan, opponent } = row;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
      <div className="grid lg:grid-cols-[1fr_auto_1fr]">
        <WarMapMember
          member={clan}
          alignment="left"
          mobileLabel={clanName}
          attacksPerMember={attacksPerMember}
          enemyMembers={opponentMembers}
        />

        <div className="flex items-center justify-center border-y border-slate-800 px-4 py-3 lg:border-x lg:border-y-0">
          <p className="text-2xl font-black text-white">
            {formatMapPosition(clan.mapPosition)}
          </p>
        </div>

        <WarMapMember
          member={opponent}
          alignment="right"
          mobileLabel={opponentName}
          attacksPerMember={attacksPerMember}
          enemyMembers={clanMembers}
        />
      </div>
    </article>
  );
}

/**
 * Propriedades de um jogador dentro da linha comparativa.
 */
type WarMapMemberProps = {
  member: WarMember;
  alignment: "left" | "right";
  mobileLabel: string;
  attacksPerMember: number;
  enemyMembers: WarMember[];
};

function WarMapMember({
  member,
  alignment,
  mobileLabel,
  attacksPerMember,
  enemyMembers,
}: WarMapMemberProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const bestDefenseResult = member.bestOpponentAttack;

  /**
   * A API pode omitir attacks quando nenhum ataque
   * foi realizado.
   */
  const attacks = member.attacks ?? [];

  /**
   * Indicadores ofensivos do jogador.
   */
  const attacksUsed = attacks.length;

  const attacksRemaining = Math.max(attacksPerMember - attacksUsed, 0);

  const starsEarned = attacks.reduce(
    (total, attack) => total + attack.stars,
    0,
  );

  const destructionTotal = attacks.reduce(
    (total, attack) => total + attack.destructionPercentage,
    0,
  );

  const alignmentClasses =
    alignment === "left"
      ? "lg:text-left lg:items-start"
      : "lg:text-right lg:items-end";

  return (
    <div className={`flex flex-col gap-5 p-5 ${alignmentClasses}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-600 lg:hidden">
        {mobileLabel}
      </p>

      {/*
       * Identidade à esquerda e resumo ofensivo à direita.
       */}
      <div className="grid w-full gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div
            className={`flex flex-wrap items-center gap-3 ${
              alignment === "right" ? "lg:flex-row-reverse" : ""
            }`}
          >
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-black text-white">
              TH{member.townhallLevel}
            </span>

            <h3
              translate="no"
              className="notranslate min-w-0 flex-1 truncate font-black text-white"
            >
              {member.name}
            </h3>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
              Melhor ataque recebido
            </p>

            <div className="mt-2">
              <WarAttackResult
                attack={bestDefenseResult}
                perspective={alignment === "left" ? "own" : "opponent"}
              />
            </div>

            {/*
             * Botão de expansão posicionado junto das
             * informações principais do jogador.
             */}
            <button
              type="button"
              onClick={() => setIsExpanded((currentState) => !currentState)}
              aria-expanded={isExpanded}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-300 transition hover:border-amber-400/50 hover:text-amber-300"
            >
              {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}

              <span
                aria-hidden="true"
                className={`transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-48">
          <WarMemberMetric
            label="Ataques"
            value={`${attacksUsed}/${attacksPerMember}`}
            detail={`${attacksRemaining} restante${
              attacksRemaining === 1 ? "" : "s"
            }`}
          />

          <WarMemberMetric label="Estrelas" value={starsEarned} />

          <WarMemberMetric
            label="Destruição"
            value={formatPercentage(destructionTotal)}
          />

          <WarMemberMetric label="Defesas" value={member.opponentAttacks} />
        </div>
      </div>

      {/*
       * Histórico completo, exibido somente quando solicitado.
       */}
      {isExpanded && (
        <WarAttackHistory member={member} enemyMembers={enemyMembers} />
      )}
    </div>
  );
}

type WarMemberMetricProps = {
  label: string;
  value: string | number;
  detail?: string;
};

/**
 * Exibe um indicador ofensivo ou defensivo
 * dentro do card do jogador.
 */
function WarMemberMetric({ label, value, detail }: WarMemberMetricProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-white">{value}</p>

      {detail && (
        <p className="mt-1 text-[10px] font-semibold text-slate-500">
          {detail}
        </p>
      )}
    </div>
  );
}

/**
 * Propriedades do resultado defensivo.
 */
type WarAttackResultProps = {
  /**
   * Melhor ataque recebido pela base.
   */
  attack: WarMember["bestOpponentAttack"];

  /**
   * Define se a base pertence ao nosso clã
   * ou ao adversário.
   */
  perspective: "own" | "opponent";
};

/**
 * Exibe o melhor ataque recebido por uma base.
 *
 * As cores são apresentadas conforme a perspectiva
 * do clã selecionado.
 */
function WarAttackResult({ attack, perspective }: WarAttackResultProps) {
  /**
   * Base ainda não atacada.
   *
   * Para nosso clã, isso é positivo.
   * Para o adversário, isso é negativo.
   */
  if (!attack) {
    const notAttackedClassName =
      perspective === "own"
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
        : "border-red-400/20 bg-red-400/10 text-red-300";

    return (
      <div
        className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold ${notAttackedClassName}`}
      >
        <span aria-hidden="true">●</span>
        Não atacada
      </div>
    );
  }

  const resultClassName = getAttackResultClassName(attack.stars, perspective);

  return (
    <div
      className={`inline-flex w-fit flex-wrap items-center gap-3 rounded-lg border px-3 py-2 ${resultClassName}`}
    >
      <span
        aria-label={`${attack.stars} estrelas`}
        className="font-black tracking-wider"
      >
        {"★".repeat(attack.stars)}
        {"☆".repeat(Math.max(0, 3 - attack.stars))}
      </span>

      <span className="text-sm font-black">
        {formatPercentage(attack.destructionPercentage)}
      </span>

      <span className="text-xs font-semibold opacity-80">
        {formatDuration(attack.duration)}
      </span>
    </div>
  );
}

/**
 * Retorna as classes visuais correspondentes ao resultado
 * do melhor ataque recebido.
 *
 * @param stars Quantidade de estrelas recebidas.
 */
/**
 * Retorna as classes visuais do resultado conforme
 * a quantidade de estrelas e a perspectiva do clã.
 */
function getAttackResultClassName(
  stars: number,
  perspective: "own" | "opponent",
): string {
  if (stars >= 3) {
    return perspective === "own"
      ? "border-red-400/20 bg-red-400/10 text-red-300"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (stars === 2) {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (stars === 1) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return perspective === "own"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : "border-red-400/20 bg-red-400/10 text-red-300";
}

/**
 * Formata o percentual utilizando o padrão brasileiro.
 *
 * @param value Percentual retornado pela API.
 */
function formatPercentage(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

/**
 * Converte uma duração em segundos para minutos e segundos.
 *
 * Exemplos:
 * 59  → 59s
 * 60  → 1min
 * 139 → 2min 19s
 */
function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}min`;
  }

  return `${minutes}min ${seconds}s`;
}

/**
 * Formata a posição do jogador com dois dígitos.
 *
 * Exemplos:
 * 1  → #01
 * 9  → #09
 * 10 → #10
 * 35 → #35
 */
function formatMapPosition(position: number): string {
  return `#${position.toString().padStart(2, "0")}`;
}
