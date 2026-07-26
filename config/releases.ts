/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * config/releases.ts
 *
 * Responsabilidade:
 * Centralizar o histórico público de versões e atualizações
 * do Kings of Doom Command Center.
 *
 * Cada versão registra as funcionalidades adicionadas,
 * melhorias realizadas e correções importantes.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 26/07/2026
 * ==========================================================
 */

/**
 * Define os tipos de alteração que podem aparecer em uma
 * versão do portal.
 */
export type ReleaseChangeType = "feature" | "improvement" | "fix" | "technical";

/**
 * Representa uma alteração individual pertencente a uma
 * versão do projeto.
 */
export type ReleaseChange = {
  /**
   * Categoria da alteração.
   */
  type: ReleaseChangeType;

  /**
   * Título resumido da alteração.
   */
  title: string;

  /**
   * Explicação complementar da alteração.
   */
  description: string;
};

/**
 * Representa uma versão publicada do portal.
 */
export type Release = {
  /**
   * Identificador público da versão.
   *
   * Exemplo:
   * 0.3.0
   */
  version: string;

  /**
   * Nome público da versão.
   */
  title: string;

  /**
   * Data de publicação no formato ISO.
   */
  date: string;

  /**
   * Resumo principal da versão.
   */
  summary: string;

  /**
   * Indica se esta é a versão atualmente publicada.
   */
  current?: boolean;

  /**
   * Lista completa de alterações pertencentes à versão.
   */
  changes: ReleaseChange[];
};

/**
 * Histórico de versões do Kings of Doom Command Center.
 *
 * As versões mais recentes devem permanecer no início
 * da lista.
 */
export const releases: Release[] = [
  {
    version: "0.3.0",
    title: "Formação dos clãs",
    date: "2026-07-26",
    summary:
      "Nova experiência visual para consulta dos membros dos clãs Kings of Doom.",

    current: true,

    changes: [
      {
        type: "feature",
        title: "Lista completa de membros",
        description:
          "Adicionada uma seção responsiva com todos os jogadores atualmente pertencentes ao clã selecionado.",
      },
      {
        type: "feature",
        title: "Cards individuais de jogadores",
        description:
          "Cada membro agora possui um card com Centro de Vila, cargo, ranking, troféus, doações e nível de experiência.",
      },
      {
        type: "feature",
        title: "Imagens dos Centros de Vila",
        description:
          "Adicionadas imagens reais dos Centros de Vila com escala e posicionamento configuráveis individualmente.",
      },
      {
        type: "feature",
        title: "Brasões das ligas",
        description:
          "Os cards agora exibem o brasão e o nome da liga atual de cada jogador.",
      },
      {
        type: "improvement",
        title: "Identificação visual de cargos",
        description:
          "Líderes, co-líderes, anciãos e membros receberam badges visuais diferentes.",
      },
      {
        type: "improvement",
        title: "Layout responsivo",
        description:
          "A grade de membros foi adaptada para celulares, tablets, notebooks e monitores grandes.",
      },
      {
        type: "technical",
        title: "Biblioteca central de assets",
        description:
          "Os caminhos e ajustes das imagens dos Centros de Vila passaram a ser controlados pelo arquivo config/assets.ts.",
      },
    ],
  },

  {
    version: "0.2.0",
    title: "Navegação entre clãs",
    date: "2026-07-25",
    summary:
      "Implementação da navegação dinâmica entre os clãs do ecossistema Kings of Doom.",

    changes: [
      {
        type: "feature",
        title: "Rotas dinâmicas de clãs",
        description:
          "Cada clã passou a possuir uma rota própria utilizando um identificador amigável.",
      },
      {
        type: "feature",
        title: "Seletor de clãs",
        description:
          "A barra de navegação recebeu um seletor para alternar rapidamente entre K.O.D. e K.O.D.rec.",
      },
      {
        type: "improvement",
        title: "Preservação do idioma",
        description:
          "O idioma atual permanece ativo durante a navegação entre os clãs.",
      },
      {
        type: "technical",
        title: "Serviços especializados",
        description:
          "As consultas de clã e guerra foram separadas em serviços independentes.",
      },
    ],
  },

  {
    version: "0.1.0",
    title: "Fundação do Command Center",
    date: "2026-07-24",
    summary: "Primeira versão funcional do painel oficial Kings of Doom.",

    changes: [
      {
        type: "feature",
        title: "Dashboard principal",
        description: "Criação do painel inicial com informações gerais do clã.",
      },
      {
        type: "feature",
        title: "Integração com a Clash of Clans API",
        description:
          "O portal passou a consultar informações reais diretamente da API oficial.",
      },
      {
        type: "feature",
        title: "Prévia da guerra atual",
        description:
          "Adicionada uma seção para acompanhar o estado da guerra em andamento.",
      },
      {
        type: "technical",
        title: "Infraestrutura de produção",
        description:
          "Configuração do Next.js, Nginx, PM2, HTTPS e comunicação com a API por IP fixo.",
      },
    ],
  },
];
