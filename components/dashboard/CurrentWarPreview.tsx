import Image from "next/image";
import Link from "next/link";
import type { CurrentWar, CurrentWarResult, WarState } from "@/types/war";

type CurrentWarPreviewProps = {
  result: CurrentWarResult;
};

const warStateLabels: Record<WarState, string> = {
  notInWar: "Fora de guerra",
  preparation: "Dia de preparação",
  inWar: "Guerra em andamento",
  warEnded: "Guerra encerrada",
};

function normalizeClashDate(value: string) {
  return value.replace(/^(\d{4})(\d{2})(\d{2})T/, "$1-$2-$3T");
}

function getRemainingTime(war: CurrentWar) {
  const targetTime = war.state === "preparation" ? war.startTime : war.endTime;

  if (!targetTime) {
    return "Horário indisponível";
  }

  const targetDate = new Date(normalizeClashDate(targetTime));

  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    if (war.state === "preparation") {
      return "A guerra está começando";
    }

    return "Tempo encerrado";
  }

  const totalMinutes = Math.floor(difference / 1000 / 60);

  const days = Math.floor(totalMinutes / 1440);

  const hours = Math.floor((totalMinutes % 1440) / 60);

  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}min`;
  }

  return `${hours}h ${minutes}min`;
}

function formatPercentage(value: number) {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}%`;
}

function getUnavailableMessage(
  reason: Exclude<CurrentWarResult, { available: true }>["reason"],
) {
  const messages = {
    notInWar: "O clã não está participando de uma guerra neste momento.",
    privateWarLog:
      "A guerra atual não pode ser exibida porque o registro de guerra está privado.",
    unavailable: "Não foi possível consultar as informações da guerra atual.",
  };

  return messages[reason];
}

export function CurrentWarPreview({ result }: CurrentWarPreviewProps) {
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

  const { war } = result;
  const clan = war.clan;
  const opponent = war.opponent;

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
              {warStateLabels[war.state]} · {getRemainingTime(war)}
            </p>
          </div>

          <Link
            href="/war"
            className="inline-flex w-fit rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:border-red-300 hover:bg-red-400/20"
          >
            Abrir Sala de Guerra
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
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

            <WarDetail label="Tempo restante" value={getRemainingTime(war)} />
          </div>
        </div>
      </div>
    </section>
  );
}

type WarClanSideProps = {
  label: string;
  name: string;
  badgeUrl: string;
  stars: number;
  destruction: number;
  attacks: number;
};

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

type WarDetailProps = {
  label: string;
  value: string;
};

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
