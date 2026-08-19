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
 * • equipamentos atualmente utilizados.
 *
 * Futuras evoluções:
 * • histórico de guerras;
 * • histórico da CWL;
 * • exército completo;
 * • Raid Weekend;
 * • Jogos do Clã;
 * • inteligência histórica de desempenho.
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

import Link from "next/link";
import { notFound } from "next/navigation";

import { getClanBySlug } from "@/config/clans";
import { getClan } from "@/services/clan.service";
import { getPlayer } from "@/services/player.service";
import { HeroTile } from "@/components/player/HeroTile";
import { EquipmentTile } from "@/components/player/EquipmentTile";

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
  const normalizedPlayerTag = `#${playerTag.replace(/^#/, "").toUpperCase()}`;

  /**
   * Consulta o clã e o jogador simultaneamente.
   */
  const [clan, player] = await Promise.all([
    getClan(clanConfig.tag),
    getPlayer(normalizedPlayerTag),
  ]);

  /**
   * Garante que o jogador consultado realmente pertence
   * ao clã informado na URL.
   */
  const clanMember = clan.memberList.find(
    (member) => member.tag.toUpperCase() === normalizedPlayerTag,
  );

  if (!clanMember) {
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

  /**
   * Melhor resultado disponível no sistema
   * ranqueado atual.
   */
  const bestSeason = player.legendStatistics?.bestSeason;

  /**
   * Heróis da Vila Principal.
   */
  const homeHeroes = getHomeHeroes(player.heroes);

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
       * HERÓIS
       * ======================================================
       *
       * A apresentação utiliza uma grade visual compacta para
       * permitir a leitura rápida da evolução dos heróis.
       *
       * Em dispositivos móveis, três heróis são apresentados
       * por linha para preservar o tamanho e a legibilidade
       * das artes.
       *
       * Em telas médias ou maiores, os seis heróis da Vila
       * Principal podem ser apresentados simultaneamente.
       */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Exército"
            title="Heróis"
            description="Progresso atual dos heróis da Vila Principal."
          />

          {homeHeroes.length > 0 ? (
            /**
             * Grade responsiva dos heróis.
             *
             * Mobile:
             * 3 colunas.
             *
             * Desktop:
             * 6 colunas.
             *
             * Cada HeroTile é responsável pela imagem,
             * nível atual, nível máximo e estado de evolução.
             */
            <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
              {homeHeroes.map((hero) => (
                <HeroTile key={`${hero.name}-${hero.village}`} hero={hero} />
              ))}
            </div>
          ) : (
            /**
             * Fallback utilizado quando nenhum herói da Vila
             * Principal for retornado pela Player API.
             */
            <EmptyState text="Nenhum herói da Vila Principal foi retornado pela API." />
          )}
        </div>
      </section>

      {/**
       * ======================================================
       * EQUIPAMENTOS DE HERÓI
       * ======================================================
       *
       * A API retorna o inventário completo de equipamentos
       * desbloqueados pelo jogador por meio de
       * `player.heroEquipment`.
       *
       * A apresentação utiliza uma grade visual compacta,
       * seguindo a mesma linguagem utilizada nos heróis.
       */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Exército"
            title="Equipamentos de Herói"
            description="Níveis atuais dos equipamentos desbloqueados pelo jogador."
          />

          {player.heroEquipment && player.heroEquipment.length > 0 ? (
            /**
             * Quatro colunas no mobile equilibram densidade
             * visual e legibilidade.
             *
             * Em telas maiores aumentamos progressivamente a
             * quantidade de itens por linha.
             */
            <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {player.heroEquipment.map((equipment) => (
                <EquipmentTile key={equipment.name} equipment={equipment} />
              ))}
            </div>
          ) : (
            /**
             * Fallback utilizado quando a Player API não
             * retornar equipamentos para o jogador.
             */
            <EmptyState text="Nenhum equipamento de herói foi retornado pela API." />
          )}
        </div>
      </section>

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
              title="Exército"
              description="Tropas, feitiços, pets e equipamentos."
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
