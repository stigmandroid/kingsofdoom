// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// WarOverview.tsx
//
// Localização:
// components/dashboard/
//
// Responsabilidade:
// Exibir um resumo da guerra atual no Dashboard,
// apresentando o estado da guerra, o tempo restante,
// estatísticas dos clãs participantes e um acesso
// rápido à Sala de Guerra.
//
// Funcionalidades:
//
// - Exibe o estado atual da guerra;
// - Calcula o tempo restante para início ou término;
// - Formata datas da Clash API para ISO 8601;
// - Exibe estatísticas resumidas dos dois clãs;
// - Trata registros de guerra privados;
// - Trata guerras indisponíveis;
// - Evita exibição de datas inválidas (NaN);
// - Impede tradução automática dos nomes dos clãs.
//
// Dependências:
//
// - next/image
// - next/link
// - @/types/war
//
// Autor:
// stigmandroid
//
// Última atualização:
// 27/07/2026
//
// Versão:
// 1.1.0
//
// Status:
// ✅ Produção
// ==========================================================

import Image from "next/image";
import Link from "next/link";

import type { CurrentWar, CurrentWarResult, WarState } from "@/types/war";

/**
 * Propriedades recebidas pelo componente WarOverview.
 *
 * O resultado pode representar:
 *
 * - Uma guerra disponível;
 * - Um clã que não está em guerra;
 * - Um registro de guerra privado;
 * - Uma indisponibilidade temporária da API.
 */
type WarOverviewProps = {
  /**
   * Resultado da consulta da guerra atual.
   */
  result: CurrentWarResult;

  /**
   * Controla a exibição do botão que leva para a Sala de Guerra.
   *
   * No Dashboard, permanece true.
   * Na própria página da guerra, utilizamos false para evitar
   * um link apontando para a página atual.
   */
  showWarRoomLink?: boolean;

  /**
   * URL localizada da Sala de Guerra.
   *
   * Exemplo:
   * /pt-BR/war
   * /en/war
   * /es/war
   */
  warRoomHref?: string;
};

/**
 * Traduções dos estados retornados pela API oficial
 * do Clash of Clans.
 *
 * O Record garante que todos os estados definidos em
 * WarState possuam uma descrição correspondente.
 */
const warStateLabels: Record<WarState, string> = {
  notInWar: "Fora de guerra",
  preparation: "Dia de preparação",
  inWar: "Guerra em andamento",
  warEnded: "Guerra encerrada",
};

/**
 * Converte uma data retornada pela API do Clash of Clans
 * para o formato ISO 8601 reconhecido pelo JavaScript.
 *
 * A API retorna datas neste formato:
 *
 * 20260727T213000.000Z
 *
 * O JavaScript espera um formato semelhante a:
 *
 * 2026-07-27T21:30:00.000Z
 *
 * A implementação anterior adicionava somente os hífens
 * da data, mas não adicionava os dois-pontos do horário.
 * Isso fazia o construtor Date gerar "Invalid Date" e,
 * consequentemente, o contador exibir "NaNh NaNmin".
 *
 * @param value Data original retornada pela Clash API.
 * @returns Data normalizada ou null quando o formato é inválido.
 */
function normalizeClashDate(value: string): string | null {
  /**
   * Captura individualmente:
   *
   * 1. Ano;
   * 2. Mês;
   * 3. Dia;
   * 4. Hora;
   * 5. Minuto;
   * 6. Segundo;
   * 7. Milissegundos opcionais.
   */
  const match = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\.\d+)?Z$/,
  );

  /**
   * Caso a API altere o formato ou retorne um valor inesperado,
   * impedimos que uma data inválida continue para o cálculo.
   */
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second, milliseconds = ".000"] =
    match;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${milliseconds}Z`;
}

/**
 * Calcula e formata o tempo restante da guerra.
 *
 * Regras:
 *
 * - Durante a preparação, o contador utiliza startTime;
 * - Durante a guerra, o contador utiliza endTime;
 * - Datas ausentes ou inválidas exibem uma mensagem segura;
 * - O componente nunca deve exibir NaN para o usuário.
 *
 * @param war Dados da guerra atual.
 * @returns Texto formatado com o tempo restante.
 */
function getRemainingTime(war: CurrentWar): string {
  /**
   * Durante o dia de preparação, queremos saber quanto falta
   * para a guerra começar.
   *
   * Nos demais estados, queremos saber quanto falta para ela terminar.
   */
  const targetTime = war.state === "preparation" ? war.startTime : war.endTime;

  if (!targetTime) {
    return "Horário indisponível";
  }

  const normalizedTargetTime = normalizeClashDate(targetTime);

  if (!normalizedTargetTime) {
    return "Horário indisponível";
  }

  const targetTimestamp = new Date(normalizedTargetTime).getTime();

  /**
   * Mesmo após a validação por expressão regular, mantemos
   * uma proteção adicional contra datas inválidas.
   */
  if (Number.isNaN(targetTimestamp)) {
    return "Horário indisponível";
  }

  const difference = targetTimestamp - Date.now();

  /**
   * Quando a diferença for zero ou negativa, o evento correspondente
   * já começou ou já terminou.
   */
  if (difference <= 0) {
    if (war.state === "preparation") {
      return "A guerra está começando";
    }

    return "Tempo encerrado";
  }

  /**
   * Converte a diferença de milissegundos para minutos inteiros.
   *
   * Utilizamos Math.floor para evitar exibir um minuto adicional
   * que ainda não foi completamente transcorrido.
   */
  const totalMinutes = Math.floor(difference / 60_000);

  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}min`;
  }

  return `${hours}h ${minutes}min`;
}

/**
 * Formata o percentual de destruição utilizando o padrão brasileiro.
 *
 * Exemplos:
 *
 * 85      → 85,0%
 * 99.54   → 99,54%
 *
 * @param value Percentual de destruição retornado pela API.
 * @returns Percentual formatado.
 */
function formatPercentage(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}%`;
}

/**
 * Retorna uma mensagem amigável para cada motivo de
 * indisponibilidade da guerra atual.
 *
 * O Exclude remove do tipo o cenário em que a guerra está disponível,
 * garantindo que a função aceite somente motivos de indisponibilidade.
 *
 * @param reason Motivo retornado pela camada responsável pela API.
 * @returns Mensagem que será apresentada ao usuário.
 */
function getUnavailableMessage(
  reason: Exclude<CurrentWarResult, { available: true }>["reason"],
): string {
  const messages: Record<typeof reason, string> = {
    notInWar: "O clã não está participando de uma guerra neste momento.",
    privateWarLog:
      "A guerra atual não pode ser exibida porque o registro de guerra está privado.",
    unavailable: "Não foi possível consultar as informações da guerra atual.",
  };

  return messages[reason];
}

/**
 * Exibe uma prévia da guerra atual no painel principal.
 *
 * O componente trata três cenários:
 *
 * 1. Guerra indisponível;
 * 2. Guerra disponível, mas com dados incompletos;
 * 3. Guerra disponível e pronta para exibição.
 */
export function WarOverview({
  result,
  showWarRoomLink = true,
  warRoomHref = "/war",
}: WarOverviewProps) {
  /**
   * Primeiro cenário:
   *
   * A guerra não pode ser apresentada porque o clã não está em guerra,
   * o registro está privado ou a API está temporariamente indisponível.
   */
  if (!result.available) {
    return (
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-red-400">
              Sala de Guerra
            </p>

            <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
              Nenhuma guerra disponível
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              {getUnavailableMessage(result.reason)}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * A partir deste ponto, o TypeScript sabe que result representa
   * uma guerra disponível.
   */
  const { war } = result;
  const clan = war.clan;
  const opponent = war.opponent;

  /**
   * Segundo cenário:
   *
   * A API retornou a guerra, mas algum dos lados está ausente.
   * Mantemos uma interface segura em vez de tentar acessar
   * propriedades inexistentes.
   */
  if (!clan || !opponent) {
    return (
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <p className="font-semibold text-slate-400">
              As informações da guerra estão incompletas.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * O cálculo é realizado uma única vez durante a renderização.
   *
   * Antes, getRemainingTime era chamada em dois pontos diferentes.
   * Centralizar o valor evita processamento duplicado e garante
   * consistência entre os textos exibidos.
   */
  const remainingTime = getRemainingTime(war);

  /**
   * Terceiro cenário:
   *
   * Todos os dados essenciais estão disponíveis e a guerra
   * pode ser apresentada normalmente.
   */
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-red-400">
              Sala de Guerra
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Guerra atual
            </h2>

            <p className="mt-3 text-slate-400">
              {warStateLabels[war.state]} · {remainingTime}
            </p>
          </div>

          {showWarRoomLink && (
            <Link
              href={warRoomHref}
              className="inline-flex w-fit rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:border-red-300 hover:bg-red-400/20"
            >
              Abrir Sala de Guerra
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
          {/*
           * O atributo translate="no" impede que tradutores automáticos
           * alterem os nomes dos clãs.
           */}
          <div
            translate="no"
            className="notranslate grid lg:grid-cols-[1fr_auto_1fr]"
          >
            <WarClanSide
              label="Kings of Doom"
              name={clan.name}
              badgeUrl={clan.badgeUrls.large}
              stars={clan.stars}
              destruction={clan.destructionPercentage}
              attacks={clan.attacks}
            />

            <div className="flex items-center justify-center border-y border-slate-800 px-8 py-6 lg:border-x lg:border-y-0">
              <span className="text-sm font-black uppercase tracking-[0.35em] text-slate-500">
                VS
              </span>
            </div>

            <WarClanSide
              label="Adversário"
              name={opponent.name}
              badgeUrl={opponent.badgeUrls.large}
              stars={opponent.stars}
              destruction={opponent.destructionPercentage}
              attacks={opponent.attacks}
            />
          </div>

          <div className="grid gap-px border-t border-slate-800 bg-slate-800 sm:grid-cols-3">
            <WarDetail
              label="Tamanho da guerra"
              value={war.teamSize ? `${war.teamSize} x ${war.teamSize}` : "—"}
            />

            <WarDetail
              label="Ataques por jogador"
              value={String(war.attacksPerMember ?? "—")}
            />

            <WarDetail label="Tempo restante" value={remainingTime} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Propriedades utilizadas para exibir um dos lados da guerra.
 */
type WarClanSideProps = {
  /** Identificação visual do lado, como "Kings of Doom" ou "Adversário". */
  label: string;

  /** Nome oficial do clã. */
  name: string;

  /** URL do escudo disponibilizado pela Clash API. */
  badgeUrl: string;

  /** Quantidade de estrelas conquistadas pelo clã. */
  stars: number;

  /** Percentual total de destruição. */
  destruction: number;

  /** Quantidade de ataques realizados. */
  attacks: number;
};

/**
 * Exibe as informações resumidas de um clã participante da guerra.
 *
 * O mesmo componente é reutilizado para o clã selecionado
 * e para o adversário, evitando duplicação de marcação JSX.
 */
function WarClanSide({
  label,
  name,
  badgeUrl,
  stars,
  destruction,
  attacks,
}: WarClanSideProps) {
  return (
    <div className="flex flex-col items-center p-7 text-center sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      {/*
       * O componente Image do Next.js otimiza o carregamento
       * e o dimensionamento do escudo.
       */}
      <Image
        src={badgeUrl}
        alt={`Escudo do clã ${name}`}
        width={110}
        height={110}
        className="mt-6 h-[110px] w-[110px] object-contain"
      />

      <h3 className="mt-5 text-2xl font-black text-white">{name}</h3>

      <p className="mt-6 text-5xl font-black text-amber-300">
        {stars}
        <span className="ml-2 text-2xl">★</span>
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <span className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-300">
          {formatPercentage(destruction)}
        </span>

        <span className="rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-300">
          {attacks} ataques
        </span>
      </div>
    </div>
  );
}

/**
 * Propriedades de um item apresentado na área de detalhes da guerra.
 */
type WarDetailProps = {
  /** Título da informação. */
  label: string;

  /** Valor já preparado para exibição. */
  value: string;
};

/**
 * Exibe uma informação complementar da guerra.
 *
 * Exemplos:
 *
 * - Tamanho da guerra;
 * - Ataques por jogador;
 * - Tempo restante.
 */
function WarDetail({ label, value }: WarDetailProps) {
  return (
    <div className="bg-slate-900 px-5 py-5 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">{value}</p>
    </div>
  );
}
