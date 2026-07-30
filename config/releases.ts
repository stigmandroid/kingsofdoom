/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * config/releases.ts
 *
 * Responsabilidade:
 * Centralizar o histórico público de versões, atualizações
 * e o roadmap do Kings of Doom Command Center.
 *
 * Cada versão registra as funcionalidades adicionadas,
 * melhorias realizadas, correções importantes e mudanças
 * técnicas da aplicação.
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
   * 0.4.0
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
 * Status disponíveis para cada etapa do roadmap.
 */
export type RoadmapStatus = "in-development" | "next" | "planned" | "future";

/**
 * Representa uma funcionalidade planejada dentro de uma
 * determinada etapa do roadmap.
 */
export type RoadmapItem = {
  /**
   * Nome público da funcionalidade.
   */
  title: string;

  /**
   * Explicação resumida do que será desenvolvido.
   */
  description: string;
};

/**
 * Representa uma fase de desenvolvimento do portal.
 */
export type RoadmapPhase = {
  /**
   * Identificador numérico da fase.
   */
  phase: number;

  /**
   * Nome público da fase.
   */
  title: string;

  /**
   * Estado atual da fase.
   */
  status: RoadmapStatus;

  /**
   * Resumo do objetivo principal da fase.
   */
  description: string;

  /**
   * Funcionalidades pertencentes à fase.
   */
  items: RoadmapItem[];
};

/**
 * Histórico de versões do Kings of Doom Command Center.
 *
 * As versões mais recentes devem permanecer no início
 * da lista.
 */
export const releases: Release[] = [
  {
    version: "0.5.0",
    title: "War Center",
    date: "2026-07-29",
    summary:
      "Primeira versão da Sala de Guerra, com uma página dedicada ao acompanhamento da guerra atual utilizando dados reais da Clash of Clans API.",

    current: true,

    changes: [
      {
        type: "feature",
        title: "Sala de Guerra",
        description:
          "Criada uma página dedicada para acompanhar a guerra atual do clã.",
      },
      {
        type: "feature",
        title: "Dados reais da guerra",
        description:
          "A Sala de Guerra exibe o placar, as estrelas, a destruição, os ataques realizados e o tamanho da guerra utilizando a API oficial do Clash of Clans.",
      },
      {
        type: "feature",
        title: "Contagem regressiva",
        description:
          "Adicionado um contador atualizado automaticamente para exibir o tempo restante da preparação ou da batalha.",
      },
      {
        type: "improvement",
        title: "Visão geral reutilizável",
        description:
          "O componente de guerra foi reutilizado entre o painel principal e a página dedicada, evitando duplicação de código.",
      },
      {
        type: "improvement",
        title: "Nomenclatura arquitetural",
        description:
          "O componente CurrentWarPreview foi renomeado para WarOverview para representar melhor sua responsabilidade dentro do projeto.",
      },
      {
        type: "fix",
        title: "Normalização das datas",
        description:
          "Corrigido o tratamento das datas retornadas pela Clash API, impedindo valores inválidos no contador da guerra.",
      },
      {
        type: "technical",
        title: "Base do War Center",
        description:
          "Estruturada a página que receberá futuras funcionalidades de análise e acompanhamento das guerras.",
      },
    ],
  },

  {
    version: "0.4.0",
    title: "Inteligência de jogadores",
    date: "2026-07-26",
    summary:
      "Integração com os perfis individuais dos jogadores para exibir informações competitivas mais completas e confiáveis.",

    changes: [
      {
        type: "feature",
        title: "Integração com a Player API",
        description:
          "O portal passou a consultar individualmente o perfil de cada jogador utilizando o endpoint oficial de jogadores da Clash of Clans API.",
      },
      {
        type: "feature",
        title: "Liga individual atualizada",
        description:
          "A liga atual dos jogadores agora utiliza prioritariamente o campo leagueTier retornado pelo perfil individual.",
      },
      {
        type: "feature",
        title: "Melhor temporada ranqueada",
        description:
          "Os cards passaram a exibir os troféus e a colocação da melhor temporada registrada na Liga Lendária.",
      },
      {
        type: "improvement",
        title: "Fallback de informações",
        description:
          "Quando os dados individuais não estão disponíveis, o portal utiliza as informações básicas presentes na lista de membros do clã.",
      },
      {
        type: "improvement",
        title: "Tratamento de jogadores sem ranking",
        description:
          "Informações como Unranked são ocultadas quando não representam uma classificação competitiva válida.",
      },
      {
        type: "improvement",
        title: "Resiliência no carregamento",
        description:
          "Uma falha na consulta de um jogador não impede que os demais membros do clã sejam carregados normalmente.",
      },
      {
        type: "technical",
        title: "Separação entre Clan e Player",
        description:
          "Os dados de clã e jogador passaram a utilizar modelos independentes, preservando as responsabilidades de cada endpoint.",
      },
      {
        type: "technical",
        title: "Serviço especializado de jogadores",
        description:
          "Criado o arquivo services/player.service.ts para centralizar as consultas aos perfis individuais.",
      },
      {
        type: "technical",
        title: "Tipagem completa de jogadores",
        description:
          "Criado o arquivo types/player.ts com os tipos utilizados pelos dados retornados pelo endpoint oficial de jogadores.",
      },
      {
        type: "technical",
        title: "Cache de consultas",
        description:
          "As consultas individuais receberam cache com revalidação periódica para reduzir chamadas repetidas à API.",
      },
      {
        type: "technical",
        title: "Composição de dados",
        description:
          "Criada uma estrutura que combina os dados básicos do membro com seu perfil individual sem modificar o modelo original do clã.",
      },
    ],
  },

  {
    version: "0.3.0",
    title: "Formação dos clãs",
    date: "2026-07-26",
    summary:
      "Nova experiência visual para consulta dos membros dos clãs Kings of Doom.",

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

/**
 * Roadmap público do Kings of Doom Command Center.
 *
 * As fases devem permanecer organizadas na ordem prevista
 * de desenvolvimento.
 */
export const roadmap: RoadmapPhase[] = [
  {
    phase: 1,
    title: "Navegação responsiva",
    status: "in-development",
    description:
      "Finalização da experiência de navegação em computadores, tablets e celulares.",

    items: [
      {
        title: "Menu hambúrguer",
        description:
          "Adicionar um botão de navegação específico para telas menores.",
      },
      {
        title: "Drawer mobile",
        description:
          "Criar um painel lateral responsivo com os principais links do portal.",
      },
      {
        title: "Links funcionais",
        description:
          "Conectar os itens da barra de navegação às páginas correspondentes.",
      },
      {
        title: "Página ativa",
        description:
          "Destacar visualmente a seção que o visitante está acessando.",
      },
      {
        title: "Seletor de clãs mobile",
        description: "Adaptar a troca entre os clãs para dispositivos móveis.",
      },
    ],
  },

  {
    phase: 2,
    title: "Estrutura do portal",
    status: "next",
    description:
      "Construção dos elementos globais e das páginas institucionais do projeto.",

    items: [
      {
        title: "Footer global",
        description:
          "Adicionar rodapé com identidade do projeto, versão atual e links importantes.",
      },
      {
        title: "Página de roadmap",
        description:
          "Apresentar publicamente as próximas etapas de desenvolvimento do portal.",
      },
      {
        title: "Release Notes aprimoradas",
        description:
          "Melhorar a apresentação visual do histórico de versões e atualizações.",
      },
      {
        title: "Estados de carregamento",
        description:
          "Criar feedback visual durante consultas e carregamentos de informações.",
      },
      {
        title: "Tratamento visual de erros",
        description:
          "Exibir mensagens amigáveis quando uma consulta ou página não puder ser carregada.",
      },
      {
        title: "SEO e metadados",
        description:
          "Adicionar títulos, descrições e informações específicas para cada página.",
      },
    ],
  },

  {
    phase: 3,
    title: "Perfis de jogadores",
    status: "planned",
    description:
      "Expansão dos dados individuais para criar páginas completas de jogadores.",

    items: [
      {
        title: "Página individual do jogador",
        description:
          "Criar uma rota própria para consultar detalhadamente cada membro.",
      },
      {
        title: "Heróis",
        description:
          "Exibir níveis e progressão dos heróis disponíveis para o jogador.",
      },
      {
        title: "Pets",
        description:
          "Apresentar os pets desbloqueados e seus respectivos níveis.",
      },
      {
        title: "Equipamentos",
        description:
          "Exibir os equipamentos dos heróis e seus níveis de evolução.",
      },
      {
        title: "Tropas e feitiços",
        description:
          "Apresentar o progresso das tropas, máquinas de cerco e feitiços.",
      },
      {
        title: "Conquistas",
        description:
          "Criar uma área dedicada às principais conquistas do perfil.",
      },
    ],
  },

  {
    phase: 4,
    title: "War Command Center",
    status: "planned",
    description:
      "Transformação da área de guerras em um centro completo de acompanhamento e análise.",

    items: [
      {
        title: "Mapa da guerra",
        description:
          "Exibir os participantes de cada clã organizados pelas posições do mapa.",
      },
      {
        title: "Ataques realizados",
        description:
          "Apresentar os ataques já executados durante a guerra atual.",
      },
      {
        title: "Ataques restantes",
        description:
          "Identificar rapidamente quais jogadores ainda possuem ataques disponíveis.",
      },
      {
        title: "Desempenho individual",
        description:
          "Mostrar estrelas, destruição e eficiência de cada participante.",
      },
      {
        title: "Histórico de guerras",
        description:
          "Criar uma página com os resultados das guerras anteriores.",
      },
      {
        title: "Comparação de desempenho",
        description:
          "Comparar resultados ofensivos e defensivos entre diferentes guerras.",
      },
      {
        title: "Estatísticas do clã",
        description:
          "Gerar indicadores gerais de desempenho competitivo do clã.",
      },
    ],
  },

  {
    phase: 5,
    title: "Analytics e inteligência competitiva",
    status: "future",
    description:
      "Criação de ferramentas avançadas para acompanhar evolução, participação e desempenho.",

    items: [
      {
        title: "Evolução de troféus",
        description:
          "Acompanhar mudanças na quantidade de troféus dos jogadores ao longo do tempo.",
      },
      {
        title: "Histórico de doações",
        description:
          "Registrar e comparar a participação dos membros nas doações do clã.",
      },
      {
        title: "Desempenho em guerras",
        description:
          "Gerar médias de estrelas, destruição e aproveitamento por jogador.",
      },
      {
        title: "Indicadores de atividade",
        description:
          "Criar métricas para ajudar a identificar participação e regularidade.",
      },
    ],
  },
];
