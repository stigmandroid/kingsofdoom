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
 * 01/08/2026
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
    version: "0.8.3",
    title: "CWL Season Pass Event",
    date: "2026-08-08",

    summary:
      "A experiência da Clash War League foi ampliada com uma visão consolidada da temporada e a fundação completa do evento automático do Passe de Temporada, incluindo elegibilidade dinâmica, persistência em SQLite, agendamento do sorteio, proteção do vencedor e uma interface preparada para acompanhar todo o evento em tempo real.",

    current: true,

    changes: [
      {
        type: "feature",
        title: "Classificação geral da temporada",
        description:
          "O ranking da CWL passou a consolidar automaticamente o desempenho dos clãs ao longo das rodadas, considerando estrelas conquistadas, bônus oficiais por vitória e destruição acumulada.",
      },

      {
        type: "feature",
        title: "Zonas de promoção e rebaixamento",
        description:
          "A classificação passou a identificar visualmente os clãs posicionados nas zonas de promoção, permanência e rebaixamento de acordo com a liga atual.",
      },

      {
        type: "feature",
        title: "Visão geral das rodadas",
        description:
          "Foi adicionada uma visão consolidada da temporada mostrando os confrontos de cada rodada e suas respectivas pontuações sem substituir a navegação detalhada já existente.",
      },

      {
        type: "feature",
        title: "Resultado visual dos confrontos",
        description:
          "As pontuações das rodadas passaram a utilizar indicadores visuais para diferenciar vitória, derrota, empate, guerra em andamento e preparação.",
      },

      {
        type: "feature",
        title: "Elegibilidade automática ao Passe",
        description:
          "Foi implementada a regra de elegibilidade do Passe de Temporada, exigindo participação mínima em três guerras, utilização de todos os ataques disponíveis e desempenho perfeito de três estrelas e 100% de destruição em cada participação válida.",
      },

      {
        type: "feature",
        title: "Evento automático do Passe de Temporada",
        description:
          "Foi criada a máquina de estados do evento com acompanhamento da elegibilidade durante a CWL, agendamento após o encerramento, fase de revelação e publicação permanente do vencedor.",
      },

      {
        type: "feature",
        title: "Sorteio agendado em horário oficial",
        description:
          "Após o encerramento da CWL, o evento é preparado automaticamente para o meio-dia do dia seguinte utilizando o fuso horário oficial de Brasília.",
      },

      {
        type: "feature",
        title: "Lista definitiva de participantes",
        description:
          "Ao término da temporada, os jogadores elegíveis são congelados em uma fotografia persistente, impedindo que alterações posteriores nos dados da Clash API modifiquem os participantes do sorteio.",
      },

      {
        type: "feature",
        title: "Sorteio único e persistente",
        description:
          "O vencedor passa a ser selecionado exclusivamente no servidor e armazenado de forma persistente, com proteção contra múltiplos sorteios ou substituição acidental do resultado.",
      },

      {
        type: "feature",
        title: "API pública do evento",
        description:
          "Foi criada uma rota interna dedicada ao Passe de Temporada para fornecer ao frontend somente o estado público do evento, mantendo o vencedor oculto até o momento oficial da revelação.",
      },

      {
        type: "feature",
        title: "Interface do evento do Passe",
        description:
          "Foi criado o CwlSeasonPassEvent com suporte aos estados tracking, scheduled, revealing e revealed, preparando a experiência completa desde a classificação dos participantes até a apresentação do vencedor.",
      },

      {
        type: "feature",
        title: "Contagem regressiva do sorteio",
        description:
          "A interface foi preparada para apresentar uma contagem regressiva sincronizada com o horário oficial do evento e atualizar automaticamente seu estado sem exigir recarregamento manual.",
      },

      {
        type: "improvement",
        title: "Responsividade da CWL",
        description:
          "A classificação e a visão das rodadas receberam novos ajustes para melhorar alinhamento, legibilidade e aproveitamento de espaço em dispositivos móveis.",
      },

      {
        type: "improvement",
        title: "Simplificação das zonas da liga",
        description:
          "As setas de promoção e rebaixamento foram removidas após a adoção das cores das zonas como indicador principal, reduzindo ruído visual especialmente no mobile.",
      },

      {
        type: "improvement",
        title: "Organização da página da CWL",
        description:
          "A composição da página foi revisada para eliminar renderizações duplicadas e manter ranking, progresso da temporada, evento do Passe e confrontos organizados em uma única experiência.",
      },

      {
        type: "technical",
        title: "Persistência com SQLite nativo",
        description:
          "Foi adicionada uma camada persistente utilizando node:sqlite no Node.js 24 para armazenar eventos do Passe, participantes elegíveis e vencedores oficiais.",
      },

      {
        type: "technical",
        title: "Repository do Passe de Temporada",
        description:
          "Foi criada uma camada dedicada de repository para centralizar consultas, criação de eventos, congelamento de participantes, persistência do vencedor e controle da revelação.",
      },

      {
        type: "technical",
        title: "Service do ciclo do evento",
        description:
          "Foi implementado um serviço responsável por orquestrar o ciclo completo do Passe, incluindo encerramento da CWL, agendamento, sorteio, persistência e liberação segura do resultado.",
      },

      {
        type: "technical",
        title: "Proteção contra revelação antecipada",
        description:
          "O backend passou a controlar separadamente os momentos de sorteio e revelação, impedindo que o vencedor seja enviado ao frontend antes do horário autorizado.",
      },
    ],
  },
  {
    version: "0.8.2",
    title: "CWL Intelligence",
    date: "2026-08-07",

    summary:
      "A Clash War League evoluiu para um verdadeiro painel estratégico, permitindo navegar entre rodadas, consultar automaticamente qualquer confronto disponível e analisar matematicamente as possibilidades de vitória, empate ou derrota de cada guerra da temporada.",

    current: false,

    changes: [
      {
        type: "feature",
        title: "Seleção dinâmica de rodadas",
        description:
          "As sete rodadas da temporada passaram a ser navegáveis diretamente pela interface, permitindo alternar entre os confrontos sem recarregar a página.",
      },

      {
        type: "feature",
        title: "Consulta automática das guerras",
        description:
          "Os confrontos da rodada selecionada são consultados automaticamente através da Clash API, exibindo apenas as guerras disponíveis naquele momento.",
      },

      {
        type: "feature",
        title: "Identificação automática do adversário",
        description:
          "Os cards das rodadas passaram a identificar automaticamente o adversário do clã selecionado sempre que o confronto estiver disponível.",
      },

      {
        type: "feature",
        title: "Destaque do confronto selecionado",
        description:
          "A rodada atualmente selecionada recebe destaque visual e atualiza instantaneamente todos os confrontos exibidos na página.",
      },

      {
        type: "feature",
        title: "Análise matemática dos confrontos",
        description:
          "Foi implementado um mecanismo capaz de interpretar o estado atual da guerra e calcular automaticamente as possibilidades matemáticas de vitória, empate ou derrota.",
      },

      {
        type: "feature",
        title: "Indicadores inteligentes de cenário",
        description:
          "Cada confronto passou a exibir automaticamente quando um clã está na frente, ainda possui chances matemáticas de vencer, ou quando a derrota já está matematicamente confirmada.",
      },

      {
        type: "feature",
        title: "Projeção de estrelas restantes",
        description:
          "Os confrontos agora calculam automaticamente a quantidade máxima de estrelas ainda alcançáveis e o mínimo necessário para evitar uma derrota.",
      },

      {
        type: "improvement",
        title: "Interface das rodadas",
        description:
          "Os cards das rodadas foram redesenhados para apresentar adversário, estado atual do confronto e indicadores estratégicos de forma mais clara e intuitiva.",
      },

      {
        type: "improvement",
        title: "Experiência desktop e mobile",
        description:
          "Diversos ajustes visuais foram realizados para melhorar a navegação, organização das informações e responsividade da página da Clash War League.",
      },

      {
        type: "technical",
        title: "Engine de inteligência da CWL",
        description:
          "Foi criada a primeira engine de análise estratégica do Kings of Doom Command Center, preparando a arquitetura para futuras funcionalidades como classificação em tempo real, simulações de temporada, previsões de colocação e estatísticas avançadas.",
      },
    ],
  },
  {
    version: "0.8.1",
    title: "CWL War Room",
    date: "2026-08-05",

    summary:
      "Introdução da Sala de Guerra da Clash War League, adicionando páginas individuais para cada confronto, acompanhamento ofensivo, informações detalhadas dos ataques e estrutura preparada para inteligência avançada da temporada.",

    current: true,

    changes: [
      {
        type: "feature",
        title: "Sala de Guerra da CWL",
        description:
          "Cada confronto da Clash War League passou a possuir uma página exclusiva para acompanhamento detalhado da batalha.",
      },

      {
        type: "feature",
        title: "Navegação para os confrontos",
        description:
          "Os confrontos da CWL agora permitem acessar diretamente a Sala de Guerra através do botão 'Ver Guerra'.",
      },

      {
        type: "feature",
        title: "Resumo do confronto",
        description:
          "A Sala de Guerra apresenta placar atualizado, estrelas, destruição, quantidade de ataques realizados e estado atual da batalha.",
      },

      {
        type: "feature",
        title: "Acompanhamento ofensivo",
        description:
          "Foi implementado um painel que separa automaticamente jogadores que já realizaram seus ataques daqueles que ainda permanecem pendentes.",
      },

      {
        type: "feature",
        title: "Informações do atacante",
        description:
          "Cada ataque realizado passou a exibir posição no mapa, nome do jogador, Centro de Vila, estrelas conquistadas e porcentagem de destruição.",
      },

      {
        type: "feature",
        title: "Informações do alvo atacado",
        description:
          "Os ataques agora identificam automaticamente a base adversária atingida, exibindo posição no mapa, nome do defensor e seu respectivo Centro de Vila.",
      },

      {
        type: "feature",
        title: "Alternância entre os clãs da guerra",
        description:
          "A Sala de Guerra permite alternar entre os dois participantes do confronto para acompanhar ofensivamente qualquer um dos lados.",
      },

      {
        type: "improvement",
        title: "Preparação para múltiplos confrontos",
        description:
          "A arquitetura da Sala de Guerra foi expandida para suportar futuramente qualquer confronto da temporada, independentemente do clã selecionado.",
      },

      {
        type: "improvement",
        title: "Componentes reutilizáveis",
        description:
          "A estrutura dos componentes da Sala de Guerra foi reorganizada para facilitar futuras expansões da inteligência da CWL.",
      },

      {
        type: "technical",
        title: "Base para inteligência avançada",
        description:
          "A nova arquitetura prepara o portal para histórico das rodadas, estatísticas ofensivas, timeline dos ataques, mapas completos e futuras análises avançadas da Clash War League.",
      },
    ],
  },
  {
    version: "0.8.0",
    title: "CWL Intelligence Foundation",
    date: "2026-08-02",

    summary:
      "Primeira estrutura do CWL Command Center, introduzindo temporadas, escalações, rodadas, confrontos, suporte multi-clã e arquitetura preparada para classificação em tempo real.",

    changes: [
      {
        type: "feature",
        title: "Página completa da Clash War League",
        description:
          "O portal agora possui uma área exclusiva para acompanhar toda a temporada da Liga de Guerras de Clãs.",
      },
      {
        type: "feature",
        title: "Suporte multi-clã",
        description:
          "A CWL passou a acompanhar automaticamente K.O.D. e K.O.D.rec, respeitando o clã selecionado na navegação.",
      },
      {
        type: "feature",
        title: "Calendário das rodadas",
        description:
          "Todas as sete rodadas da temporada são exibidas com seus confrontos e status atual.",
      },
      {
        type: "feature",
        title: "Distribuição dos Centros de Vila",
        description:
          "Cada clã participante apresenta a composição completa dos Centros de Vila inscritos na temporada.",
      },
      {
        type: "feature",
        title: "Placar em tempo real",
        description:
          "Os confrontos exibem estrelas, destruição, ataques realizados e atualização automática conforme a Clash API.",
      },
      {
        type: "improvement",
        title: "Leitura inteligente dos confrontos",
        description:
          "Os cards identificam automaticamente guerras em preparação, aguardando primeiros ataques, batalhas em andamento e resultados parciais.",
      },
      {
        type: "improvement",
        title: "Destaque do clã selecionado",
        description:
          "O confronto do clã atualmente selecionado recebe identidade visual exclusiva e maior destaque para facilitar o acompanhamento.",
      },
      {
        type: "improvement",
        title: "Compatibilidade total com o seletor de clãs",
        description:
          "A troca entre K.O.D. e K.O.D.rec agora funciona em toda a área da CWL mantendo o contexto da navegação.",
      },
      {
        type: "feature",
        title: "CWL Command Center",
        description:
          "O portal passou a possuir uma área dedicada para acompanhamento da Liga de Guerras de Clãs.",
      },

      {
        type: "feature",
        title: "Integração com a Clash War League",
        description:
          "O sistema consulta automaticamente o grupo atual da CWL através da API oficial do Clash of Clans.",
      },

      {
        type: "feature",
        title: "Visão geral da temporada",
        description:
          "A página apresenta temporada, estado da liga, quantidade de clãs participantes, rodadas disponíveis e guerras já criadas.",
      },

      {
        type: "feature",
        title: "Escalações da CWL",
        description:
          "Cada clã participante passou a exibir sua composição completa de Centros de Vila e quantidade de jogadores inscritos.",
      },

      {
        type: "feature",
        title: "Calendário da temporada",
        description:
          "As sete rodadas da CWL passaram a ser apresentadas juntamente com os confrontos disponíveis da rodada atual.",
      },

      {
        type: "feature",
        title: "Confrontos da liga",
        description:
          "Cada confronto apresenta escudos, participantes, estado da guerra, estrelas, destruição e informações da batalha.",
      },

      {
        type: "feature",
        title: "Suporte multi-clã",
        description:
          "A CWL agora suporta independentemente os clãs K.O.D. e K.O.D.rec através de rotas próprias.",
      },

      {
        type: "improvement",
        title: "Navegação contextual",
        description:
          "A troca de clã preserva automaticamente o módulo atual (Painel, Guerra ou CWL), proporcionando uma navegação consistente em todo o portal.",
      },

      {
        type: "feature",
        title: "Estado para períodos sem CWL",
        description:
          "Quando o clã não participa de uma temporada ativa, a página apresenta uma experiência visual dedicada e prepara o espaço para o futuro histórico de temporadas.",
      },

      {
        type: "technical",
        title: "Arquitetura reutilizável",
        description:
          "A estrutura da Sala de Guerra foi preparada para ser reutilizada futuramente nas guerras individuais da Clash War League.",
      },
    ],
  },
  {
    version: "0.7.0",
    title: "War Intelligence",
    date: "2026-08-01",
    summary:
      "A Sala de Guerra agora apresenta inteligência individual dos participantes, histórico expansível de ataques, métricas ofensivas e defensivas e uma experiência visual aprimorada.",

    changes: [
      {
        type: "feature",
        title: "Indicadores ofensivos por jogador",
        description:
          "Cada participante agora apresenta ataques utilizados, ataques restantes, estrelas conquistadas e destruição acumulada.",
      },
      {
        type: "feature",
        title: "Indicadores defensivos individuais",
        description:
          "Os cards passaram a exibir a quantidade de ataques recebidos e o melhor resultado obtido contra cada base.",
      },
      {
        type: "feature",
        title: "Histórico de ataques realizados",
        description:
          "Cada jogador possui uma área expansível com todos os ataques executados durante a guerra.",
      },
      {
        type: "feature",
        title: "Histórico de ataques recebidos",
        description:
          "As bases agora apresentam todos os ataques recebidos, permitindo identificar rapidamente quem atacou cada jogador.",
      },
      {
        type: "feature",
        title: "Identificação completa dos confrontos",
        description:
          "O histórico apresenta atacante, alvo, posição no mapa, estrelas, destruição e duração de cada ataque.",
      },
      {
        type: "improvement",
        title: "Detalhes expansíveis",
        description:
          "O histórico individual permanece oculto até que o usuário selecione Ver detalhes, preservando a leitura compacta do mapa.",
      },
      {
        type: "improvement",
        title: "Duração em minutos e segundos",
        description:
          "Os tempos dos ataques agora são apresentados em um formato legível, eliminando a necessidade de conversão manual.",
      },
      {
        type: "improvement",
        title: "Posições padronizadas",
        description:
          "As posições do mapa passaram a utilizar dois dígitos, como #01, #02 e #10, mantendo o alinhamento visual.",
      },
      {
        type: "improvement",
        title: "Cores por perspectiva",
        description:
          "Os resultados defensivos agora utilizam cores diferentes conforme representem um resultado positivo ou negativo para o clã selecionado.",
      },
      {
        type: "improvement",
        title: "Experiência mobile da guerra",
        description:
          "O layout mobile passou a exibir os nomes reais dos clãs, posições compactas e informações individuais organizadas.",
      },
      {
        type: "feature",
        title: "Footer global",
        description:
          "Todas as páginas localizadas receberam um rodapé com identidade do projeto, versão atual e links de navegação.",
      },
      {
        type: "improvement",
        title: "Navegação entre Releases e Roadmap",
        description:
          "O rodapé permite acessar diretamente o histórico de versões e a seção pública do roadmap.",
      },
      {
        type: "improvement",
        title: "Hero com identidade K.O.D.",
        description:
          "O escudo genérico foi substituído pelo logotipo oficial do K.O.D., reforçando a identidade visual do portal.",
      },
      {
        type: "improvement",
        title: "Animação do logotipo",
        description:
          "O Hero recebeu iluminação dourada, flutuação suave e efeitos visuais compatíveis com desktop e dispositivos móveis.",
      },
      {
        type: "technical",
        title: "Componente de histórico especializado",
        description:
          "O histórico de ataques foi isolado em um componente próprio, permitindo evolução independente e reutilização futura.",
      },
      {
        type: "technical",
        title: "Estado interativo nos cards da guerra",
        description:
          "Os participantes passaram a controlar individualmente a abertura e o fechamento de seus detalhes.",
      },
      {
        type: "improvement",
        title: "Resumo compacto do melhor ataque recebido",
        description:
          "O componente passou a apresentar estrelas, destruição e duração em uma única linha, reduzindo espaço e melhorando a leitura em dispositivos móveis.",
      },
      {
        type: "improvement",
        title: "Layout responsivo da Sala de Guerra",
        description:
          "Os componentes da guerra receberam ajustes específicos para desktop e dispositivos móveis, preservando a experiência visual em ambos os ambientes.",
      },
      {
        type: "improvement",
        title: "Botão de detalhes otimizado",
        description:
          "Na versão mobile, o botão de detalhes foi reposicionado ao lado do resultado do melhor ataque recebido, reduzindo a altura dos cards sem alterar o layout do desktop.",
      },
      {
        type: "improvement",
        title: "Hero redesenhado",
        description:
          "O Hero principal passou a utilizar o logotipo oficial do K.O.D. em destaque, com maior escala, reforçando a identidade visual da plataforma.",
      },
      {
        type: "improvement",
        title: "Efeitos visuais do Hero",
        description:
          "Foram adicionados efeitos de iluminação, flutuação e destaque visual ao logotipo principal, proporcionando uma experiência mais moderna tanto em computadores quanto em dispositivos móveis.",
      },
    ],
  },

  {
    version: "0.6.0",
    title: "War Intelligence Foundation",
    date: "2026-08-01",
    summary:
      "Evolução da Sala de Guerra com acompanhamento individual dos participantes, mapa comparativo entre os clãs e navegação dinâmica por clã.",

    changes: [
      {
        type: "feature",
        title: "Mapa comparativo da guerra",
        description:
          "As bases do clã selecionado e do adversário agora são apresentadas lado a lado, organizadas pela posição ocupada no mapa.",
      },
      {
        type: "feature",
        title: "Ataques pendentes",
        description:
          "Criada uma seção que identifica jogadores com nenhum, um ou dois ataques ainda disponíveis.",
      },
      {
        type: "feature",
        title: "Resumo defensivo",
        description:
          "O mapa apresenta a quantidade de bases destruídas, danificadas e ainda não atacadas em cada lado da guerra.",
      },
      {
        type: "feature",
        title: "Sala de Guerra por clã",
        description:
          "K.O.D. e K.O.D.rec passaram a possuir páginas próprias de guerra por meio das rotas dinâmicas /war/kod e /war/kod-rec.",
      },
      {
        type: "improvement",
        title: "Navegação contextual por clã",
        description:
          "O Hero, o resumo da guerra e o seletor de clãs passaram a respeitar o clã atualmente selecionado.",
      },
      {
        type: "improvement",
        title: "Dashboard unificado",
        description:
          "A página inicial agora redireciona para o painel completo do clã principal, eliminando uma implementação duplicada e incompleta.",
      },
      {
        type: "improvement",
        title: "Identificação correta no seletor",
        description:
          "O seletor reconhece o clã atual tanto nas rotas /clans/[slug] quanto nas rotas /war/[clan].",
      },
      {
        type: "fix",
        title: "Diagnóstico de erros da Clash API",
        description:
          "O sistema agora diferencia histórico privado, IP não autorizado e indisponibilidade temporária da API.",
      },
      {
        type: "technical",
        title: "Tipagem dos participantes da guerra",
        description:
          "Foram adicionados os modelos de membros, ataques realizados e melhores ataques recebidos.",
      },
      {
        type: "technical",
        title: "Fundação para inteligência de guerra",
        description:
          "A estrutura atual prepara o portal para Timeline, histórico por jogador, histórico por base e análises de desempenho.",
      },
    ],
  },

  {
    version: "0.5.0",
    title: "War Center",
    date: "2026-07-29",
    summary:
      "Primeira versão da Sala de Guerra, com uma página dedicada ao acompanhamento da guerra atual utilizando dados reais da Clash of Clans API.",

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
    title: "War Intelligence",
    status: "in-development",
    description:
      "Evolução contínua da Sala de Guerra com informações ofensivas, defensivas e históricas de fácil consulta.",

    items: [
      {
        title: "Pesquisa por jogador",
        description:
          "Permitir localizar rapidamente um participante dentro da guerra.",
      },
      {
        title: "Filtros por resultado",
        description:
          "Filtrar ataques por estrelas, destruição, atacante, alvo ou posição.",
      },
      {
        title: "Timeline completa",
        description:
          "Organizar cronologicamente todos os ataques realizados pelos dois clãs.",
      },
      {
        title: "Resumo final da guerra",
        description:
          "Gerar uma visão consolidada dos principais resultados após o encerramento.",
      },
      {
        title: "Histórico de guerras",
        description:
          "Armazenar e apresentar guerras anteriores para consultas e comparações.",
      },
    ],
  },

  {
    phase: 2,
    title: "CWL Intelligence Foundation",
    status: "next",
    description:
      "Construção da primeira experiência dedicada à Liga de Guerras de Clãs.",

    items: [
      {
        title: "Página dedicada da CWL",
        description:
          "Criar uma rota própria para acompanhar a temporada atual da liga.",
      },
      {
        title: "Classificação do grupo",
        description:
          "Exibir posição, estrelas, destruição e resultados acumulados dos clãs.",
      },
      {
        title: "Rodadas da temporada",
        description: "Apresentar todas as rodadas e seus respectivos estados.",
      },
      {
        title: "Navegação entre rodadas",
        description:
          "Permitir consultar facilmente cada confronto da temporada.",
      },
      {
        title: "Desempenho acumulado",
        description:
          "Calcular estrelas, destruição, ataques e resultados durante a CWL.",
      },
      {
        title: "Detalhes da guerra selecionada",
        description:
          "Reutilizar componentes da Sala de Guerra para apresentar cada rodada.",
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
    title: "Community",
    status: "planned",
    description:
      "Criação de ferramentas voltadas à gestão, organização e desenvolvimento dos membros.",

    items: [
      {
        title: "Gestão de membros",
        description:
          "Criar recursos para acompanhar a composição e a atividade do clã.",
      },
      {
        title: "Histórico individual",
        description:
          "Consolidar a participação e os resultados de cada jogador.",
      },
      {
        title: "Recrutamento",
        description:
          "Criar ferramentas para apoiar o processo de entrada de novos membros.",
      },
      {
        title: "Funções e permissões",
        description:
          "Organizar recursos específicos para líderes, co-líderes e membros.",
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
      {
        title: "Insights automáticos",
        description:
          "Transformar os dados coletados em informações prontas para consulta.",
      },
    ],
  },
];
