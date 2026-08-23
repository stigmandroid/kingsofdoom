/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/members/[clan]/[playerTag]/page.tsx
 *
 * Responsabilidade:
 * Renderizar o perfil individual de um jogador pertencente
 * ao clã selecionado.
 *
 * A página apresenta:
 * • identidade atual do jogador;
 * • dados competitivos atuais;
 * • atividade recente da temporada;
 * • heróis da Vila Principal;
 * • equipamentos atualmente utilizados;
 * • Liga de Troféus e contribuição estimada ao clã.
 *
 * Futuras evoluções:
 * • histórico de guerras;
 * • histórico da CWL;
 * • Raid Weekend;
 * • Jogos do Clã;
 * • inteligência histórica de desempenho.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import Link from "next/link";
import ArmyTabs from "@/components/player/ArmyTabs";
import { notFound } from "next/navigation";

import { getTrophyLeagueContribution } from "@/lib/trophy-league";
import { getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getPlayer } from "@/services/player.service";
import { HeroTile } from "@/components/player/HeroTile";
import { EquipmentTile } from "@/components/player/EquipmentTile";
import { TroopTile } from "@/components/player/TroopTile";
import { SpellTile } from "@/components/player/SpellTile";
import { SiegeMachineTile } from "@/components/player/SiegeMachineTile";
import { PetTile } from "@/components/player/PetTile";
import { TrophyLeaguePanel } from "@/components/player/TrophyLeaguePanel";
import { captureTrophyLeagueSnapshot } from "@/services/trophy-league-snapshot.service";
import { getTrophyLeaguePlayerSeasonHistory } from "@/services/trophy-league-season-history.service";
import type { PlayerHero } from "@/types/player";

type PlayerProfilePageProps = {
  params: Promise<{
    locale: string;
    clan: string;
    playerTag: string;
  }>;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

/**
 * Heróis que pertencem à Vila Principal.
 *
 * A API também retorna heróis da Base do Construtor
 * no mesmo array.
 */
function getHomeHeroes(heroes: PlayerHero[] | undefined): PlayerHero[] {
  if (!heroes) {
    return [];
  }

  return heroes.filter((hero) => hero.village === "home" && Boolean(hero.name));
}

/**
 * Normaliza tags da Clash API e da URL para permitir
 * comparação segura independentemente da presença de "#".
 */
function normalizeClashTag(tag: string): string {
  return tag.trim().replace(/^#/, "").toUpperCase();
}

export default async function PlayerProfilePage({
  params,
}: PlayerProfilePageProps) {
  const { locale, clan: clanSlug, playerTag } = await params;

  /**
   * Valida o clã informado na URL.
   */
  const clanConfig = getClanBySlug(clanSlug);

  if (!clanConfig) {
    notFound();
  }

  /**
   * O caractere "#" não deve fazer parte da URL,
   * pois representa fragmentos no navegador.
   *
   * Portanto:
   *
   * /members/kod/9C9QUPVQL
   *
   * torna-se:
   *
   * #9C9QUPVQL
   */
  const normalizedPlayerTag = `#${normalizeClashTag(playerTag)}`;

  /**
   * Consulta o clã e o jogador simultaneamente.
   */
  const [clan, player] = await Promise.all([
    getClan(clanConfig.tag),
    getPlayer(normalizedPlayerTag),
  ]);

  /**
   * Snapshot temporário da Liga de Troféus.
   *
   * O objetivo deste log é observar como os dados ranqueados
   * evoluem entre consultas enquanto definimos a persistência
   * histórica da Liga de Troféus.
   *
   * Remover quando a captura passar a ser persistida no SQLite.
   */
  console.log("[RANKED SNAPSHOT]", {
    capturedAt: new Date().toISOString(),
    player: player.name,
    tag: player.tag,
    leagueTier: player.leagueTier?.name,
    trophies: player.trophies,
    bestTrophies: player.bestTrophies,
    currentLeagueGroupTag: player.currentLeagueGroupTag,
    currentLeagueSeasonId: player.currentLeagueSeasonId,
    previousLeagueGroupTag: player.previousLeagueGroupTag,
    previousLeagueSeasonId: player.previousLeagueSeasonId,
  });

  /**
   * Garante que o jogador consultado realmente pertence
   * ao clã informado na URL.
   */
  const normalizedPlayerTagValue = normalizeClashTag(playerTag);

  const clanMember = clan.memberList.find(
    (member) => normalizeClashTag(member.tag) === normalizedPlayerTagValue,
  );

  if (!clanMember) {
    console.error("[PlayerProfile] Jogador não encontrado no memberList", {
      clanSlug,
      playerTag,
      normalizedPlayerTag,
      normalizedPlayerTagValue,
      memberTags: clan.memberList.map((member) => member.tag),
    });

    notFound();
  }

  /**
   * Liga atual.
   */
  const leagueName =
    player.leagueTier?.name ?? player.league?.name ?? "Sem liga";

  const leagueIcon =
    player.leagueTier?.iconUrls?.large ??
    player.leagueTier?.iconUrls?.medium ??
    player.leagueTier?.iconUrls?.small ??
    player.league?.iconUrls?.medium ??
    player.league?.iconUrls?.small;

  const trophyLeagueContribution = getTrophyLeagueContribution({
    leagueName,
    trophies: player.trophies,
  });

  /**
   * ========================================================
   * HISTÓRICO DA TEMPORADA DA LIGA DE TROFÉUS
   * ========================================================
   */

  const trophyLeagueSeasonHistory = getTrophyLeaguePlayerSeasonHistory(
    player.tag,
  );

  const currentTrophyLeagueSeason =
    trophyLeagueSeasonHistory.seasons[0] ?? null;

  /**
   * Persiste o estado atual da Liga de Troféus somente
   * quando houver mudança relevante em relação ao último
   * snapshot salvo.
   */
  captureTrophyLeagueSnapshot(player);

  /**
   * Melhor resultado disponível no sistema
   * ranqueado atual.
   */
  const bestSeason = player.legendStatistics?.bestSeason;

  /**
   * Heróis da Vila Principal.
   */
  const homeHeroes = getHomeHeroes(player.heroes);

  /**
   * ========================================================
   * TROPAS DA VILA PRINCIPAL
   * ========================================================
   *
   * O endpoint de jogador mistura no mesmo array:
   * • tropas normais;
   * • supertropas;
   * • máquinas de cerco;
   * • pets;
   * • unidades da Base do Construtor.
   *
   * Por esse motivo, mantemos uma lista explícita das tropas
   * que pertencem à seção principal do exército.
   */
  const homeVillageTroopNames = new Set([
    "Barbarian",
    "Archer",
    "Goblin",
    "Giant",
    "Wall Breaker",
    "Balloon",
    "Wizard",
    "Healer",
    "Dragon",
    "P.E.K.K.A",
    "Minion",
    "Hog Rider",
    "Valkyrie",
    "Golem",
    "Witch",
    "Lava Hound",
    "Bowler",
    "Baby Dragon",
    "Miner",
    "Yeti",
    "Ice Golem",
    "Electro Dragon",
    "Dragon Rider",
    "Headhunter",
    "Electro Titan",
    "Apprentice Warden",
    "Root Rider",
    "Druid",
    "Thrower",
    "Furnace",
    "Meteor Golem",
    "Ruin Witch",
  ]);

  const homeVillageTroops =
    player.troops?.filter(
      (troop) =>
        troop.village === "home" && homeVillageTroopNames.has(troop.name),
    ) ?? [];

  /**
   * ========================================================
   * MÁQUINAS DE CERCO
   * ========================================================
   *
   * A Player API devolve as Máquinas de Cerco dentro do
   * mesmo array utilizado para tropas e pets.
   *
   * Mantemos uma lista explícita para separar somente as
   * unidades pertencentes a esta categoria.
   */
  const siegeMachineNames = new Set([
    "Wall Wrecker",
    "Battle Blimp",
    "Stone Slammer",
    "Siege Barracks",
    "Log Launcher",
    "Flame Flinger",
    "Battle Drill",
    "Troop Launcher",
    "Sky Wagon",
  ]);

  const siegeMachines =
    player.troops?.filter(
      (troop) => troop.village === "home" && siegeMachineNames.has(troop.name),
    ) ?? [];

  /**
   * ========================================================
   * PETS
   * ========================================================
   *
   * A Player API retorna os Pets dentro do mesmo array
   * utilizado para tropas e máquinas.
   */
  const petNames = new Set([
    "L.A.S.S.I",
    "Mighty Yak",
    "Electro Owl",
    "Unicorn",
    "Phoenix",
    "Poison Lizard",
    "Diggy",
    "Frosty",
    "Spirit Fox",
    "Angry Jelly",
    "Sneezy",
    "Greedy Raven",
  ]);

  const pets =
    player.troops?.filter(
      (troop) => troop.village === "home" && petNames.has(troop.name),
    ) ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/**
       * ======================================================
       * CABEÇALHO DO PERFIL
       * ======================================================
       */}

      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Link
            href={`/${locale}/members/${clanSlug}`}
            className="inline-flex min-h-11 items-center text-sm font-bold text-slate-400 transition hover:text-white"
          >
            ← Voltar para membros
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-400">
                Perfil do jogador
              </p>

              <h1
                translate="no"
                className="notranslate mt-3 break-words text-3xl font-black tracking-tight text-white sm:text-5xl"
              >
                {player.name}
              </h1>

              <p
                translate="no"
                className="notranslate mt-2 text-sm font-semibold text-slate-500"
              >
                {player.tag}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span
                  translate="no"
                  className="notranslate rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 font-bold text-slate-200"
                >
                  {clan.name}
                </span>

                <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 font-bold text-sky-300">
                  {clanMember.role}
                </span>

                <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 font-bold text-amber-300">
                  #{clanMember.clanRank} no clã
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              {leagueIcon ? (
                <img
                  src={leagueIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-xl"
                >
                  ★
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Liga atual
                </p>

                <p className="mt-1 truncate text-base font-black text-white">
                  {leagueName}
                </p>

                <p className="mt-1 text-sm font-bold text-amber-300">
                  {numberFormatter.format(
                    player.trophies ?? clanMember.trophies,
                  )}{" "}
                  troféus
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/**
       * ======================================================
       * MÉTRICAS PRINCIPAIS
       * ======================================================
       */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ProfileMetric
              label="Centro de Vila"
              value={`TH${player.townHallLevel ?? clanMember.townHallLevel}`}
            />

            <ProfileMetric
              label="Experiência"
              value={numberFormatter.format(
                player.expLevel ?? clanMember.expLevel,
              )}
            />

            <ProfileMetric
              label="Estrelas de guerra"
              value={numberFormatter.format(player.warStars ?? 0)}
            />

            <ProfileMetric
              label="Melhor marca"
              value={
                typeof bestSeason?.trophies === "number"
                  ? numberFormatter.format(bestSeason.trophies)
                  : "—"
              }
              detail={
                typeof bestSeason?.rank === "number"
                  ? `#${numberFormatter.format(bestSeason.rank)}`
                  : undefined
              }
            />
          </div>
        </div>
      </section>

      {/**
       * ======================================================
       * ATIVIDADE
       * ======================================================
       */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Atividade"
            title="Temporada atual"
            description="Indicadores atuais retornados pelo perfil do jogador."
          />

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <ProfileMetric
              label="Doações"
              value={numberFormatter.format(
                player.donations ?? clanMember.donations,
              )}
            />

            <ProfileMetric
              label="Recebidas"
              value={numberFormatter.format(
                player.donationsReceived ?? clanMember.donationsReceived,
              )}
            />

            <ProfileMetric
              label="Ataques vencidos"
              value={numberFormatter.format(player.attackWins ?? 0)}
            />

            <ProfileMetric
              label="Defesas vencidas"
              value={numberFormatter.format(player.defenseWins ?? 0)}
            />
          </div>
        </div>
      </section>

      {/**
       * ======================================================
       * LIGA DE TROFÉUS
       * ======================================================
       */}

      <TrophyLeaguePanel
        leagueName={trophyLeagueContribution.leagueName}
        leagueIcon={leagueIcon}
        baseScore={trophyLeagueContribution.baseScore}
        seasonalScore={trophyLeagueContribution.seasonalScore}
        estimatedClanContribution={
          trophyLeagueContribution.estimatedClanContribution
        }
        bestTrophies={player.bestTrophies}
        isLegendOne={trophyLeagueContribution.isLegendOne}
        season={currentTrophyLeagueSeason}
      />

      {/**
       * ======================================================
       * EXÉRCITO
       * ======================================================
       *
       * As seis categorias principais do exército são
       * apresentadas dentro de uma única área navegável.
       *
       * Isso reduz o comprimento da página sem remover
       * nenhuma informação já existente.
       */}

      <ArmyTabs
        heroes={
          homeHeroes.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {homeHeroes.map((hero) => (
                <HeroTile key={hero.name} hero={hero} />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhum herói da Vila Principal foi retornado pela API." />
          )
        }
        equipment={
          player.heroEquipment && player.heroEquipment.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {player.heroEquipment.map((equipment) => (
                <EquipmentTile key={equipment.name} equipment={equipment} />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhum equipamento de herói foi retornado pela API." />
          )
        }
        troops={
          homeVillageTroops.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {homeVillageTroops.map((troop) => (
                <TroopTile key={troop.name} troop={troop} />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhuma tropa da Vila Principal foi retornada pela API." />
          )
        }
        spells={
          player.spells && player.spells.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {player.spells
                .filter((spell) => spell.village === "home")
                .map((spell) => (
                  <SpellTile key={spell.name} spell={spell} />
                ))}
            </div>
          ) : (
            <EmptyState text="Nenhum feitiço da Vila Principal foi retornado pela API." />
          )
        }
        siege={
          siegeMachines.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {siegeMachines.map((siegeMachine) => (
                <SiegeMachineTile
                  key={siegeMachine.name}
                  siegeMachine={siegeMachine}
                />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhuma Máquina de Cerco foi retornada pela API." />
          )
        }
        pets={
          pets.length > 0 ? (
            <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {pets.map((pet) => (
                <PetTile key={pet.name} pet={pet} />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhum Pet foi retornado pela API." />
          )
        }
      />

      {/**
       * ======================================================
       * PRÓXIMOS MÓDULOS
       * ======================================================
       */}

      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-400">
            Player Intelligence
          </p>

          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Histórico e inteligência
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            Esta área será conectada ao histórico persistido de guerras e CWL
            para apresentar evolução, consistência ofensiva, triplas, ataques
            não utilizados e desempenho ao longo do tempo.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FutureModule
              title="Guerras"
              description="Histórico individual de ataques e desempenho."
            />

            <FutureModule
              title="CWL"
              description="Participação e evolução entre temporadas."
            />

            <FutureModule
              title="Eventos"
              description="Raid Weekend e Jogos do Clã futuramente."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Métrica simples utilizada em diferentes áreas do perfil.
 */
function ProfileMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <p className="text-xl font-black text-white sm:text-2xl">{value}</p>

        {detail && (
          <span className="text-xs font-bold text-slate-500">{detail}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Cabeçalho reutilizável das áreas do perfil.
 */
function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function FutureModule({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-5">
      <p className="font-black text-white">{title}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-5 py-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
