/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * services/season-pass.service.ts
 *
 * Responsabilidade:
 * Orquestrar o ciclo completo do evento automático
 * do Passe de Temporada da CWL.
 *
 * Funcionalidades:
 *
 * - acompanhar o encerramento da temporada;
 * - calcular e congelar jogadores elegíveis;
 * - agendar o sorteio para 12:00 do dia seguinte;
 * - utilizar o fuso horário de Brasília;
 * - executar um único sorteio oficial;
 * - persistir o vencedor;
 * - controlar o momento de revelação;
 * - impedir novo sorteio após definição do vencedor.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { randomInt } from "node:crypto";

import type { CwlRoundWar } from "@/components/cwl/CwlRounds";

import {
  calculateSeasonPassEligibility,
  type SeasonPassEligiblePlayer,
} from "@/lib/cwl/calculate-season-pass-eligibility";

import {
  createScheduledSeasonPassEvent,
  findSeasonPassEligiblePlayers,
  findSeasonPassEvent,
  findLatestSeasonPassEventByClan,
  markSeasonPassEventAsRevealed,
  replaceSeasonPassEligiblePlayers,
  saveSeasonPassWinner,
  type SeasonPassEligiblePlayerRecord,
  type SeasonPassEventRecord,
} from "@/repositories/season-pass.repository";

/**
 * Fuso oficial utilizado pelo evento.
 */
const SEASON_PASS_TIME_ZONE = "America/Sao_Paulo";

/**
 * Horário oficial do sorteio.
 */
const SEASON_PASS_DRAW_HOUR = 12;

/**
 * Quantidade de segundos reservada para a animação
 * antes da revelação pública do vencedor.
 */
const SEASON_PASS_REVEAL_DELAY_SECONDS = 10;

/**
 * Estados públicos do evento.
 */
export type SeasonPassPublicStatus =
  | "tracking"
  | "scheduled"
  | "revealing"
  | "revealed";

/**
 * Representa o estado público do evento.
 *
 * Esse contrato será utilizado posteriormente
 * pelo componente React responsável pela interface.
 */
export type SeasonPassEventState = {
  season: string;
  clanTag: string;

  status: SeasonPassPublicStatus;

  /**
   * Lista atual ou congelada de jogadores elegíveis.
   */
  eligiblePlayers: SeasonPassEligiblePlayer[];

  /**
   * Horário oficial do sorteio.
   */
  scheduledAt?: string;

  /**
   * Horário em que o vencedor poderá ser revelado.
   */
  revealAt?: string;

  /**
   * Vencedor público.
   *
   * Nunca é exposto antes do momento oficial
   * de revelação.
   */
  winner?: {
    tag: string;
    name: string;
  };
};

/**
 * Entrada principal do serviço.
 *
 * Esta função analisa o estado atual da temporada
 * e devolve o estado correspondente do evento.
 */
export function getSeasonPassEventState({
  season,
  clanTag,
  wars,
  seasonEnded,
  now = new Date(),
}: {
  season: string;
  clanTag: string;
  wars: CwlRoundWar[];
  seasonEnded: boolean;
  now?: Date;
}): SeasonPassEventState {
  /**
   * Verifica se já existe um evento persistido.
   */
  let event = findSeasonPassEvent({
    season,
    clanTag,
  });

  /**
   * ==========================================================
   * TEMPORADA AINDA EM ANDAMENTO
   * ==========================================================
   *
   * Enquanto a CWL ainda estiver ativa:
   *
   * - não criamos evento persistido;
   * - a elegibilidade continua dinâmica;
   * - nenhuma lista é congelada.
   */
  if (!seasonEnded && !event) {
    return {
      season,
      clanTag,

      status: "tracking",

      eligiblePlayers: calculateSeasonPassEligibility(wars, clanTag),
    };
  }

  /**
   * ==========================================================
   * TEMPORADA ENCERRADA
   * ==========================================================
   *
   * Se ainda não existe evento:
   *
   * - calcula a lista definitiva;
   * - cria o evento;
   * - congela os jogadores elegíveis.
   */
  if (seasonEnded && !event) {
    const eligiblePlayers = calculateSeasonPassEligibility(wars, clanTag);

    const schedule = calculateNextBrasiliaNoon(now);

    event = createScheduledSeasonPassEvent({
      season,
      clanTag,

      scheduledAt: schedule.scheduledAt,
      revealAt: schedule.revealAt,
    });

    replaceSeasonPassEligiblePlayers({
      eventId: event.id,
      players: eligiblePlayers,
    });
  }

  /**
   * Caso ainda não exista evento por algum cenário
   * inesperado, mantém o acompanhamento dinâmico.
   */
  if (!event) {
    return {
      season,
      clanTag,
      status: "tracking",

      eligiblePlayers: calculateSeasonPassEligibility(wars, clanTag),
    };
  }

  /**
   * A partir daqui, a lista oficial sempre vem
   * do banco congelado.
   */
  const frozenPlayers = findSeasonPassEligiblePlayers(event.id);

  /**
   * ==========================================================
   * SORTEIO
   * ==========================================================
   *
   * Ao atingir scheduledAt, tenta realizar o sorteio.
   *
   * saveSeasonPassWinner possui proteção no banco:
   * somente um processo conseguirá alterar
   * scheduled -> drawn.
   */
  if (
    event.status === "scheduled" &&
    now.getTime() >= new Date(event.scheduledAt).getTime()
  ) {
    executeSeasonPassDraw({
      event,
      players: frozenPlayers,
    });

    /**
     * Reconsulta porque outro request/processo
     * pode ter realizado o sorteio primeiro.
     */
    event =
      findSeasonPassEvent({
        season,
        clanTag,
      }) ?? event;
  }

  /**
   * ==========================================================
   * REVELAÇÃO
   * ==========================================================
   *
   * O vencedor já pode ter sido sorteado, mas permanece
   * oculto até revealAt.
   */
  if (
    event.status === "drawn" &&
    now.getTime() >= new Date(event.revealAt).getTime()
  ) {
    markSeasonPassEventAsRevealed(event.id);

    event =
      findSeasonPassEvent({
        season,
        clanTag,
      }) ?? event;
  }

  return buildPublicEventState({
    event,
    players: frozenPlayers,
    now,
  });
}

/**
 * Recupera e continua o último evento persistido de um clã
 * quando a Clash API já não disponibiliza a temporada encerrada.
 *
 * Esta função não recalcula elegibilidade e não cria novo evento.
 * Utiliza apenas o evento e a lista congelada no SQLite.
 */
export function getPersistedSeasonPassEventState({
  clanTag,
  now = new Date(),
}: {
  clanTag: string;
  now?: Date;
}): SeasonPassEventState | null {
  let event = findLatestSeasonPassEventByClan(clanTag);

  if (!event) {
    return null;
  }

  const frozenPlayers = findSeasonPassEligiblePlayers(event.id);

  if (
    event.status === "scheduled" &&
    now.getTime() >= new Date(event.scheduledAt).getTime()
  ) {
    executeSeasonPassDraw({
      event,
      players: frozenPlayers,
    });

    event =
      findSeasonPassEvent({
        season: event.season,
        clanTag: event.clanTag,
      }) ?? event;
  }

  if (
    event.status === "drawn" &&
    now.getTime() >= new Date(event.revealAt).getTime()
  ) {
    markSeasonPassEventAsRevealed(event.id);

    event =
      findSeasonPassEvent({
        season: event.season,
        clanTag: event.clanTag,
      }) ?? event;
  }

  return buildPublicEventState({
    event,
    players: frozenPlayers,
    now,
  });
}

/**
 * Executa o sorteio oficial.
 *
 * Esta função:
 *
 * - utiliza somente a lista congelada;
 * - escolhe um único jogador;
 * - persiste o vencedor;
 * - não permite sobrescrever vencedor existente.
 */
function executeSeasonPassDraw({
  event,
  players,
}: {
  event: SeasonPassEventRecord;
  players: SeasonPassEligiblePlayerRecord[];
}): void {
  /**
   * Sem jogadores elegíveis não existe sorteio.
   */
  if (players.length === 0) {
    return;
  }

  /**
   * randomInt gera um índice inteiro entre:
   *
   * 0 inclusivo
   * players.length exclusivo
   */
  const winnerIndex = randomInt(players.length);

  const winner = players[winnerIndex];

  saveSeasonPassWinner({
    eventId: event.id,
    winnerTag: winner.tag,
    winnerName: winner.name,
  });
}

/**
 * Constrói o estado que poderá ser enviado ao frontend.
 *
 * Segurança importante:
 *
 * mesmo que winnerTag e winnerName já estejam salvos
 * no banco, eles não são expostos antes de revealAt.
 */
function buildPublicEventState({
  event,
  players,
  now,
}: {
  event: SeasonPassEventRecord;
  players: SeasonPassEligiblePlayerRecord[];
  now: Date;
}): SeasonPassEventState {
  const currentTime = now.getTime();

  const scheduledTime = new Date(event.scheduledAt).getTime();

  const revealTime = new Date(event.revealAt).getTime();

  /**
   * Antes do sorteio.
   */
  if (event.status === "scheduled" && currentTime < scheduledTime) {
    return {
      season: event.season,
      clanTag: event.clanTag,

      status: "scheduled",

      scheduledAt: event.scheduledAt,
      revealAt: event.revealAt,

      eligiblePlayers: mapFrozenPlayers(players),
    };
  }

  /**
   * Sorteio já aconteceu, mas a animação/revelação
   * ainda está em andamento.
   */
  if (event.status === "drawn" && currentTime < revealTime) {
    return {
      season: event.season,
      clanTag: event.clanTag,

      status: "revealing",

      scheduledAt: event.scheduledAt,
      revealAt: event.revealAt,

      eligiblePlayers: mapFrozenPlayers(players),
    };
  }

  /**
   * Resultado revelado.
   *
   * Só aqui o nome do vencedor pode chegar ao frontend.
   */
  return {
    season: event.season,
    clanTag: event.clanTag,

    status: "revealed",

    scheduledAt: event.scheduledAt,
    revealAt: event.revealAt,

    eligiblePlayers: mapFrozenPlayers(players),

    winner:
      event.winnerTag && event.winnerName
        ? {
            tag: event.winnerTag,
            name: event.winnerName,
          }
        : undefined,
  };
}

/**
 * Converte registros persistidos para o contrato
 * público utilizado pelo serviço.
 */
function mapFrozenPlayers(
  players: SeasonPassEligiblePlayerRecord[],
): SeasonPassEligiblePlayer[] {
  return players.map((player) => ({
    tag: player.tag,
    name: player.name,

    warsPlayed: player.warsPlayed,

    attacksUsed: player.attacksUsed,
    attacksAvailable: player.attacksAvailable,

    stars: player.stars,
    destruction: player.destruction,
  }));
}

/**
 * Calcula 12:00 do dia seguinte no fuso
 * America/Sao_Paulo.
 *
 * O cálculo evita assumir manualmente UTC-3.
 */
function calculateNextBrasiliaNoon(referenceDate: Date): {
  scheduledAt: string;
  revealAt: string;
} {
  /**
   * Recupera a data civil correspondente ao horário
   * de Brasília.
   */
  const brasiliaParts = getDatePartsInTimeZone(
    referenceDate,
    SEASON_PASS_TIME_ZONE,
  );

  /**
   * Utilizamos meio-dia UTC como valor temporário
   * apenas para manipular a data civil com segurança.
   *
   * Depois convertemos novamente para o instante real
   * correspondente a 12:00 em Brasília.
   */
  const nextDay = new Date(
    Date.UTC(
      brasiliaParts.year,
      brasiliaParts.month - 1,
      brasiliaParts.day + 1,
      SEASON_PASS_DRAW_HOUR,
      0,
      0,
      0,
    ),
  );

  const nextDayParts = {
    year: nextDay.getUTCFullYear(),
    month: nextDay.getUTCMonth() + 1,
    day: nextDay.getUTCDate(),
  };

  /**
   * Converte 12:00 de Brasília para um instante UTC real.
   */
  const scheduledDate = zonedDateTimeToUtc({
    year: nextDayParts.year,
    month: nextDayParts.month,
    day: nextDayParts.day,

    hour: SEASON_PASS_DRAW_HOUR,
    minute: 0,
    second: 0,

    timeZone: SEASON_PASS_TIME_ZONE,
  });

  /**
   * O resultado só poderá ser revelado depois
   * da janela reservada à animação.
   */
  const revealDate = new Date(
    scheduledDate.getTime() + SEASON_PASS_REVEAL_DELAY_SECONDS * 1_000,
  );

  return {
    scheduledAt: scheduledDate.toISOString(),

    revealAt: revealDate.toISOString(),
  };
}

/**
 * Recupera componentes civis de uma data em
 * determinado fuso horário.
 */
function getDatePartsInTimeZone(
  date: Date,
  timeZone: string,
): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,

    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),

    month: Number(parts.find((part) => part.type === "month")?.value),

    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

/**
 * Converte uma data/hora civil pertencente a
 * determinado fuso para o instante UTC correspondente.
 *
 * Essa abordagem utiliza Intl para descobrir o offset
 * real do timezone informado.
 */
function zonedDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  second,
  timeZone,
}: {
  year: number;
  month: number;
  day: number;

  hour: number;
  minute: number;
  second: number;

  timeZone: string;
}): Date {
  /**
   * Primeiro tratamos os componentes como UTC.
   */
  const provisionalUtc = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second),
  );

  /**
   * Descobrimos como esse instante aparece
   * no timezone desejado.
   */
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,

    year: "numeric",
    month: "2-digit",
    day: "2-digit",

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",

    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(provisionalUtc);

  const getPart = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  /**
   * Reconstrói em UTC a representação civil
   * observada naquele timezone.
   */
  const representedAsUtc = Date.UTC(
    getPart("year"),
    getPart("month") - 1,
    getPart("day"),
    getPart("hour"),
    getPart("minute"),
    getPart("second"),
  );

  /**
   * Diferença entre o instante provisório e
   * sua representação civil revela o offset.
   */
  const offset = representedAsUtc - provisionalUtc.getTime();

  /**
   * Subtraindo o offset obtemos o instante real
   * correspondente ao horário civil solicitado.
   */
  return new Date(provisionalUtc.getTime() - offset);
}
