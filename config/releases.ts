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
 * 12/08/2026
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
    version: "0.8.9",
    title: "Player Army & Pets",
    date: "2026-08-19",
    current: true,
    summary:
      "Expansão do perfil individual do jogador com a integração completa do Exército da Vila Principal, adicionando tropas, feitiços, Máquinas de Cerco e Pets com assets locais, níveis atuais, identificação visual de nível máximo e experiência responsiva.",

    changes: [
      {
        type: "feature",
        title: "Tropas da Vila Principal",
        description:
          "O perfil individual passou a apresentar as tropas da Vila Principal retornadas pela Player API, com seus níveis atuais e assets visuais próprios.",
      },
      {
        type: "feature",
        title: "Feitiços",
        description:
          "Foi adicionada uma seção dedicada aos feitiços da Vila Principal, apresentando níveis atuais e representação visual individual de cada feitiço.",
      },
      {
        type: "feature",
        title: "Máquinas de Cerco",
        description:
          "O perfil passou a exibir as Máquinas de Cerco desbloqueadas pelo jogador, separadas das tropas normais e apresentadas em uma seção própria.",
      },
      {
        type: "feature",
        title: "Pets",
        description:
          "Foi criada uma seção dedicada aos Pets do jogador, exibindo os níveis atuais dos 12 Pets retornados pela Player API.",
      },
      {
        type: "feature",
        title: "Assets visuais do Exército",
        description:
          "Foram adicionados catálogos locais para tropas, feitiços, Máquinas de Cerco e Pets, utilizando assets obtidos e organizados a partir do Fan Kit oficial.",
      },
      {
        type: "improvement",
        title: "Indicador visual de nível máximo",
        description:
          "Tropas, feitiços, Máquinas de Cerco e Pets passaram a utilizar o mesmo padrão visual do perfil, destacando o nível máximo através do contorno aplicado diretamente ao número.",
      },
      {
        type: "improvement",
        title: "Identidade visual por categoria",
        description:
          "As novas seções receberam tratamentos visuais próprios, preservando uma linguagem consistente entre Exército, Equipamentos e Heróis.",
      },
      {
        type: "improvement",
        title: "Experiência responsiva do Exército",
        description:
          "As grades de tropas, feitiços, Máquinas de Cerco e Pets foram adaptadas para desktop e dispositivos móveis, mantendo densidade, legibilidade e áreas adequadas para toque.",
      },
      {
        type: "technical",
        title: "Separação das categorias da Player API",
        description:
          "Foi implementada uma separação explícita dos dados retornados em player.troops para distinguir tropas normais, Máquinas de Cerco, Pets, supertropas e unidades de outras vilas.",
      },
      {
        type: "technical",
        title: "Exportadores de assets do Fan Kit",
        description:
          "Foram criadas ferramentas internas para localizar, selecionar e exportar assets de tropas, feitiços, Máquinas de Cerco e Pets para a biblioteca pública do projeto.",
      },
      {
        type: "technical",
        title: "Catálogo centralizado do Exército",
        description:
          "Os novos assets passaram a ser centralizados em config/assets.ts, permitindo que os componentes visuais utilizem um mapeamento único entre os nomes da Clash API e os arquivos locais.",
      },
      {
        type: "technical",
        title: "Componentes reutilizáveis do perfil",
        description:
          "Foram criados componentes dedicados para Tropas, Feitiços, Máquinas de Cerco e Pets, mantendo a mesma arquitetura visual e comportamental das demais áreas do perfil.",
      },
      {
        type: "technical",
        title: "Fallback seguro de assets",
        description:
          "A interface permanece funcional mesmo quando um asset visual ainda não estiver disponível ou precisar de revisão, impedindo que novos conteúdos retornados pela API quebrem o perfil.",
      },
      {
        type: "improvement",
        title: "Fundação visual do Exército concluída",
        description:
          "O perfil individual passou a oferecer uma visão ampla do estado atual do exército do jogador, preparando a próxima etapa do Player Intelligence.",
      },
      {
        type: "technical",
        title: "Build de produção validado",
        description:
          "A integração das novas categorias do perfil foi validada com sucesso no build de produção do Next.js 16.2.11 utilizando Turbopack.",
      },
    ],
  },

  {
    version: "0.8.8",
    title: "Player Profiles & Hero Equipment",
    date: "2026-08-18",
    current: false,
    summary:
      "Início dos perfis individuais de jogadores e da fundação visual do Player Intelligence, com navegação a partir do módulo de Membros, dados reais da Player API, heróis e catálogo completo de equipamentos com assets locais, níveis, raridades e experiência responsiva.",

    changes: [
      {
        type: "feature",
        title: "Perfil individual do jogador",
        description:
          "Cada membro passou a possuir uma página individual acessível diretamente pelo módulo de Membros através de uma rota dinâmica baseada no clã e na tag do jogador.",
      },
      {
        type: "feature",
        title: "Dados individuais da Player API",
        description:
          "O perfil passou a utilizar os dados reais do jogador para apresentar informações como Centro de Vila, experiência, troféus, liga, doações e estrelas de guerra.",
      },
      {
        type: "feature",
        title: "Heróis do jogador",
        description:
          "Criação de uma área visual dedicada aos heróis desbloqueados, apresentando seus níveis atuais e assets próprios.",
      },
      {
        type: "feature",
        title: "Equipamentos de Herói",
        description:
          "O perfil passou a apresentar os equipamentos de herói desbloqueados pelo jogador e seus respectivos níveis atuais.",
      },
      {
        type: "feature",
        title: "Assets oficiais dos equipamentos",
        description:
          "Foi criado um catálogo local de imagens dos equipamentos utilizando assets obtidos do Fan Kit oficial e organizados para reutilização pela aplicação.",
      },
      {
        type: "improvement",
        title: "Raridade dos equipamentos",
        description:
          "Os cards passaram a diferenciar visualmente equipamentos comuns e épicos através de fundos, bordas e tonalidades específicas para cada raridade.",
      },
      {
        type: "improvement",
        title: "Indicador visual de nível máximo",
        description:
          "A antiga indicação textual de MAX foi substituída por um contorno visual aplicado diretamente ao nível numérico do equipamento, reduzindo ruído e aproximando a interface da linguagem visual do jogo.",
      },
      {
        type: "improvement",
        title: "Experiência responsiva dos equipamentos",
        description:
          "A grade de equipamentos foi adaptada para desktop e dispositivos móveis, mantendo densidade de informação, legibilidade e identificação rápida dos níveis.",
      },
      {
        type: "fix",
        title: "Asset da Lança-Foguetes",
        description:
          "O asset incorreto da Lança-Foguetes foi substituído pela representação visual correspondente ao equipamento utilizado no jogo.",
      },
      {
        type: "feature",
        title: "Baralho Vingativo",
        description:
          "O novo equipamento Baralho Vingativo foi integrado ao catálogo visual e passou a ser apresentado corretamente quando retornado pela Player API.",
      },
      {
        type: "technical",
        title: "Catálogo centralizado de equipamentos",
        description:
          "Foi criada uma camada de mapeamento entre os nomes retornados pela Clash API e os assets locais utilizados pela interface.",
      },
      {
        type: "technical",
        title: "Fallback de assets",
        description:
          "Equipamentos sem imagem correspondente permanecem renderizáveis através de um fallback seguro, evitando quebra da página quando novos equipamentos forem adicionados pela API.",
      },
      {
        type: "technical",
        title: "Fundação do Player Intelligence",
        description:
          "A arquitetura do perfil individual foi preparada para receber tropas, feitiços, máquinas de cerco, pets, conquistas e posteriormente o histórico persistido de guerras e CWL.",
      },
      {
        type: "technical",
        title: "Build de produção validado",
        description:
          "A nova estrutura dos perfis, heróis, assets e equipamentos foi validada com sucesso no build de produção do Next.js 16.2.11 utilizando Turbopack.",
      },
    ],
  },

  {
    version: "0.8.7",
    title: "Members Module & Development Gateway",
    date: "2026-08-16",
    current: false,
    summary:
      "Criação do módulo dedicado de Membros e conclusão do gateway privado de desenvolvimento, permitindo navegar entre os clãs preservando o contexto e utilizar dados reais da Clash API no ambiente local sem depender do IP residencial.",

    changes: [
      {
        type: "feature",
        title: "Página dedicada de Membros",
        description:
          "A lista completa de jogadores deixou de ocupar o Dashboard principal e passou a possuir um módulo próprio para cada clã.",
      },
      {
        type: "feature",
        title: "Membros por clã",
        description:
          "Criação das rotas dedicadas /members/kod e /members/kod-rec, permitindo consultar independentemente a formação atual de cada clã.",
      },
      {
        type: "improvement",
        title: "Dashboard mais enxuto",
        description:
          "A listagem completa de membros foi removida da página principal, reduzindo o comprimento do painel e preparando espaço para futuros resumos e indicadores estratégicos.",
      },
      {
        type: "technical",
        title: "Service reutilizável de membros",
        description:
          "Criação de uma camada dedicada para enriquecer os membros do clã com dados individuais da Player API, mantendo falhas isoladas por jogador.",
      },
      {
        type: "technical",
        title: "Gateway privado para dados de clã",
        description:
          "O ambiente local passou a consultar os dados dos clãs através da VPS, impedindo que alterações no IP residencial interrompam o desenvolvimento.",
      },
      {
        type: "technical",
        title: "Gateway privado para jogadores",
        description:
          "As consultas individuais da Player API em desenvolvimento passaram a ser encaminhadas pela VPS utilizando autenticação privada.",
      },
      {
        type: "technical",
        title: "Gateway unificado de desenvolvimento",
        description:
          "Clãs, jogadores, guerra atual e histórico de guerras agora utilizam a VPS como ponto autorizado de acesso à Clash API durante o desenvolvimento local.",
      },
      {
        type: "technical",
        title: "Configuração explícita de ambiente",
        description:
          "A decisão de utilizar o gateway deixou de depender de NODE_ENV e passou a utilizar KOD_USE_DEV_PROXY, permitindo que builds locais também utilizem corretamente a infraestrutura da VPS.",
      },
      {
        type: "improvement",
        title: "Navegação contextual entre clãs",
        description:
          "O seletor de clãs passou a preservar o módulo atual ao alternar entre K.O.D. e K.O.D.rec em Painel, Guerra, CWL e Membros.",
      },
      {
        type: "improvement",
        title: "Interface dedicada de formação",
        description:
          "A página de Membros recebeu cabeçalho próprio, identificação da formação atual e contagem de jogadores sem repetir títulos desnecessariamente.",
      },
      {
        type: "improvement",
        title: "Fundação para perfis individuais",
        description:
          "A nova arquitetura prepara o módulo para futuras páginas individuais de jogadores, histórico de desempenho, guerras, CWL, Raids e Jogos do Clã.",
      },
    ],
  },
  {
    version: "0.8.6",
    title: "War Historical Archive & Navigation",
    date: "2026-08-15",
    current: false,
    summary:
      "Introdução da infraestrutura persistente para histórico de guerras normais, com arquivamento automático de K.O.D. e K.O.D.rec, histórico compacto e navegação para o detalhamento completo de confrontos encerrados.",

    changes: [
      {
        type: "feature",
        title: "Histórico persistente de guerras",
        description:
          "Criação da infraestrutura SQLite para preservar guerras normais, participantes e ataques, permitindo análises históricas independentes da disponibilidade posterior da API oficial.",
      },
      {
        type: "feature",
        title: "Arquivamento multi-clã",
        description:
          "Implementação do arquivamento das guerras normais de K.O.D. e K.O.D.rec através da mesma rotina administrativa, mantendo históricos independentes para cada clã.",
      },
      {
        type: "technical",
        title: "Captura automática a cada 5 minutos",
        description:
          "Configuração do servidor para atualizar automaticamente o histórico das guerras normais a cada cinco minutos, preservando a evolução dos confrontos em andamento.",
      },
      {
        type: "technical",
        title: "Persistência idempotente",
        description:
          "Criação de uma warKey determinística para identificar cada confronto e utilização de UPSERT para impedir duplicações entre snapshots sucessivos.",
      },
      {
        type: "feature",
        title: "Persistência de membros e ataques",
        description:
          "Registro histórico dos participantes, atacante, defensor, Centros de Vila, estrelas, destruição, ordem e duração dos ataques realizados.",
      },
      {
        type: "feature",
        title: "Guerras recentes",
        description:
          "Nova visualização compacta do histórico na Sala de Guerra, exibindo somente confrontos encerrados e diferenciando visualmente vitórias, derrotas e empates.",
      },
      {
        type: "feature",
        title: "Detalhamento completo da guerra",
        description:
          "Criação de uma rota dedicada para abrir guerras arquivadas e consultar o confronto completo sem depender da disponibilidade atual da Clash API.",
      },
      {
        type: "feature",
        title: "Mapa histórico da guerra",
        description:
          "Reutilização do mapa comparativo da Sala de Guerra para reconstruir posições, participantes e resultados defensivos a partir do snapshot histórico.",
      },
      {
        type: "improvement",
        title: "Navegação progressiva",
        description:
          "Reorganização da experiência com resumo primeiro e detalhamento sob demanda, reduzindo a quantidade de conteúdo exibido simultaneamente.",
      },
      {
        type: "improvement",
        title: "Subnavegação interna",
        description:
          "Criação de navegação interna entre Resumo, Mapa e Ataques não utilizados na página histórica, evitando páginas excessivamente longas.",
      },
      {
        type: "improvement",
        title: "Experiência responsiva",
        description:
          "Histórico e páginas de detalhamento adaptados para desktop e dispositivos móveis, com botões adequados para toque e conteúdo pesado exibido somente quando solicitado.",
      },
      {
        type: "technical",
        title: "Base para War Intelligence",
        description:
          "Separação dos dados históricos em estruturas próprias para guerras, membros e ataques, criando a base para métricas individuais, rankings e inteligência estratégica nas próximas versões.",
      },
    ],
  },
  {
    version: "0.8.5",
    title: "CWL Season Pass Ceremony",
    date: "2026-08-12",

    summary:
      "Conclusão do fluxo completo do Passe de Temporada da CWL, consolidando persistência em SQLite, orquestração server-side, congelamento transacional dos elegíveis, sorteio oficial protegido, API pública segura e a cerimônia cinematográfica integrada ao vencedor persistido.",

    current: false,

    changes: [
      {
        type: "feature",
        title: "Cerimônia cinematográfica do Passe",
        description:
          "Foi concluída a experiência visual oficial do sorteio do Passe de Temporada, transformando a revelação do vencedor em uma sequência animada integrada ao evento real da CWL.",
      },
      {
        type: "feature",
        title: "Contagem regressiva 3–2–1",
        description:
          "A cerimônia recebeu uma abertura sincronizada com contagem regressiva antes do início da sequência de seleção dos participantes.",
      },
      {
        type: "feature",
        title: "Rotação dos participantes",
        description:
          "Os jogadores elegíveis passam por uma sequência visual de rotação com desaceleração progressiva até o travamento no vencedor oficial.",
      },
      {
        type: "feature",
        title: "Lock do vencedor oficial",
        description:
          "A animação finaliza obrigatoriamente no jogador previamente sorteado e persistido pelo servidor, eliminando qualquer possibilidade de o frontend determinar ou alterar o resultado.",
      },
      {
        type: "feature",
        title: "Entrega visual do Passe",
        description:
          "O Passe de Temporada foi incorporado à cerimônia com entrada animada, destaque luminoso e transição contínua para o jogador vencedor.",
      },
      {
        type: "feature",
        title: "Impacto e celebração",
        description:
          "A revelação recebeu efeitos de impacto, halo, partículas e iluminação para reforçar visualmente o momento oficial da premiação.",
      },
      {
        type: "feature",
        title: "Resultado integrado à cerimônia",
        description:
          "A sequência cinematográfica passa naturalmente para o estado final do evento, apresentando o vencedor oficial e suas métricas de desempenho na CWL.",
      },
      {
        type: "improvement",
        title: "Cerimônia responsiva",
        description:
          "A experiência foi adaptada para desktop e dispositivos móveis, incluindo telas estreitas próximas de 320 pixels, preservando legibilidade e composição visual.",
      },
      {
        type: "improvement",
        title: "Nome do jogador adaptativo",
        description:
          "O nome exibido durante a cerimônia recebeu dimensionamento e tratamento responsivos para acomodar jogadores com nomes de diferentes comprimentos sem quebrar o layout.",
      },
      {
        type: "improvement",
        title: "Transições contínuas",
        description:
          "As etapas anteriormente isoladas foram refinadas para formar uma única experiência de revelação, reduzindo cortes visuais entre seleção, entrega, impacto e resultado.",
      },
      {
        type: "technical",
        title: "Fundação persistente da CWL com SQLite",
        description:
          "A infraestrutura do evento da CWL passou a contar com banco SQLite nativo no backend, criando uma base persistente para manter o estado do Passe de Temporada independentemente do ciclo de renderização do frontend.",
      },
      {
        type: "technical",
        title: "Configuração central do banco de dados",
        description:
          "Foi criada uma instância centralizada do SQLite com configurações de integridade e concorrência, incluindo foreign keys e journal mode WAL para dar suporte seguro às operações persistentes do evento.",
      },
      {
        type: "technical",
        title: "Persistência do ciclo do Passe da CWL",
        description:
          "O banco passou a armazenar o evento por temporada e clã, incluindo status, horário oficial do sorteio, horário de revelação, vencedor, momento do sorteio e momento da revelação.",
      },
      {
        type: "technical",
        title: "Persistência dos jogadores elegíveis",
        description:
          "A fotografia definitiva dos participantes elegíveis passou a ser gravada no SQLite com tag, nome, guerras disputadas, ataques utilizados e disponíveis, estrelas e destruição.",
      },
      {
        type: "technical",
        title: "Congelamento transacional dos participantes",
        description:
          "A substituição da lista de elegíveis é executada dentro de uma transação, garantindo que a fotografia oficial do sorteio seja persistida integralmente ou revertida em caso de falha.",
      },
      {
        type: "technical",
        title: "Repository dedicado ao Passe",
        description:
          "A camada season-pass.repository.ts centraliza criação e consulta de eventos, leitura e congelamento de elegíveis, gravação do vencedor e confirmação da revelação.",
      },
      {
        type: "technical",
        title: "Orquestração server-side do evento",
        description:
          "O season-pass.service.ts passou a controlar o ciclo tracking, scheduled, revealing e revealed, utilizando os dados da CWL para calcular elegibilidade, preparar o evento e liberar o resultado no momento correto.",
      },
      {
        type: "technical",
        title: "Sorteio criptograficamente seguro no servidor",
        description:
          "A escolha oficial do vencedor utiliza randomInt de node:crypto exclusivamente no backend, removendo a responsabilidade de sorteio do navegador.",
      },
      {
        type: "technical",
        title: "Proteção atômica contra sorteio duplicado",
        description:
          "A gravação do vencedor só é aceita enquanto o evento permanece com status scheduled; após a primeira atualização, novas tentativas não conseguem substituir o resultado persistido.",
      },
      {
        type: "technical",
        title: "Separação entre sorteio e revelação",
        description:
          "O backend mantém drawnAt e revealAt como momentos distintos, permitindo sortear e persistir o vencedor antes da apresentação pública sem expor antecipadamente sua identidade.",
      },
      {
        type: "technical",
        title: "API pública protegida do Passe",
        description:
          "A rota /api/season-pass consulta o estado da CWL e devolve ao frontend somente o contrato público do evento, sem revelar o vencedor antes do horário autorizado.",
      },
      {
        type: "technical",
        title: "Sincronização automática do estado público",
        description:
          "O frontend consulta periodicamente a API do Passe para acompanhar as transições do evento sem recarregamento manual, mantendo diferentes navegadores alinhados ao estado persistido no servidor.",
      },
      {
        type: "technical",
        title: "Integração com o vencedor persistido",
        description:
          "O CwlSeasonPassCeremony foi conectado ao estado oficial do evento, consumindo exclusivamente o vencedor autorizado pelo backend no momento de revelação.",
      },
      {
        type: "technical",
        title: "Remoção do sorteio client-side",
        description:
          "A lógica de escolha aleatória no navegador foi removida; o frontend deixou de utilizar Math.random() para definir o vencedor e passou a atuar somente como camada de apresentação.",
      },
      {
        type: "technical",
        title: "Substituição da simulação do Passe",
        description:
          "A antiga experiência CwlSeasonPassSimulation foi retirada do fluxo principal e substituída pela cerimônia conectada ao evento real.",
      },
      {
        type: "fix",
        title: "Conflito de declaração do vencedor",
        description:
          "Foi corrigida a declaração duplicada de winner no componente da cerimônia, eliminando o erro de compilação identificado pelo Turbopack.",
      },
      {
        type: "technical",
        title: "Build de produção validado",
        description:
          "A integração final da cerimônia foi validada com sucesso no build de produção do Next.js 16.2.11 utilizando Turbopack.",
      },
    ],
  },

  {
    version: "0.8.4",
    title: "CWL Historical Archive & Infrastructure",
    date: "2026-08-11",
    current: false,
    summary:
      "Construção da infraestrutura histórica da CWL, com persistência completa das temporadas em SQLite, auditoria de integridade, backup consistente e preparação da base de dados para futuras análises de desempenho e inteligência estratégica.",

    changes: [
      {
        type: "feature",
        title: "Arquivo histórico da CWL",
        description:
          "Criação da estrutura histórica em SQLite para preservar temporadas completas da Clash War League independentemente da disponibilidade futura dos dados na API oficial.",
      },
      {
        type: "feature",
        title: "Persistência completa das temporadas",
        description:
          "Arquivamento independente por temporada dos oito clãs participantes, sete rodadas, guerras do grupo, participações individuais e ataques realizados.",
      },
      {
        type: "technical",
        title: "Persistência detalhada dos ataques",
        description:
          "Registro de atacante, defensor, Centro de Vila de ambos os jogadores, estrelas, percentual de destruição e ordem de cada ataque realizado durante a CWL.",
      },
      {
        type: "technical",
        title: "Atualização idempotente",
        description:
          "Implementação de UPSERT para permitir snapshots incrementais e atualização segura de temporadas e guerras já conhecidas sem duplicação de registros.",
      },
      {
        type: "feature",
        title: "Endpoint administrativo de arquivamento",
        description:
          "Criação de endpoint administrativo para execução manual do processo de atualização do arquivo histórico da CWL.",
      },
      {
        type: "technical",
        title: "Auditoria automática de integridade",
        description:
          "Validação da estrutura das temporadas arquivadas, incluindo participantes, atacante, defensor, Centros de Vila, ordem dos ataques e consistência dos dados preservados.",
      },
      {
        type: "feature",
        title: "Métricas históricas iniciais",
        description:
          "Implementação da distribuição de ataques por 0, 1, 2 e 3 estrelas, cálculo da taxa de triplas do clã monitorado e identificação de jogadores que deixaram ataques.",
      },
      {
        type: "technical",
        title: "Backup consistente do SQLite",
        description:
          "Criação de backup físico compatível com WAL mode, validação por PRAGMA integrity_check e reabertura isolada do banco de backup para confirmação da integridade dos dados.",
      },
      {
        type: "technical",
        title: "Primeiro snapshot histórico protegido",
        description:
          "Preservação da CWL de Agosto de 2026 como primeiro conjunto histórico da plataforma, criando a base para análises futuras entre temporadas.",
      },
      {
        type: "technical",
        title: "Infraestrutura de produção com PM2",
        description:
          "Configuração do PM2 para gerenciamento do processo, persistência com pm2 save, inicialização automática via systemd e recuperação da aplicação com pm2 resurrect.",
      },
      {
        type: "improvement",
        title: "Base para inteligência histórica",
        description:
          "Estruturação dos dados necessários para futuras análises individuais, comparativos entre temporadas, índices de consistência, rankings e modelos de inteligência estratégica.",
      },
    ],
  },

  {
    version: "0.8.3",
    title: "CWL Season Pass Event",
    date: "2026-08-08",

    summary:
      "A experiência da Clash War League foi ampliada com uma visão consolidada da temporada e a fundação completa do evento automático do Passe de Temporada, incluindo elegibilidade dinâmica, persistência em SQLite, agendamento do sorteio, proteção do vencedor e uma interface preparada para acompanhar todo o evento em tempo real.",

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
    title: "War Intelligence — conclusão",
    status: "in-development",
    description:
      "Concluir a inteligência operacional da Sala de Guerra utilizando a infraestrutura histórica persistente já construída para transformar ataques e resultados em informações rápidas para tomada de decisão.",

    items: [
      {
        title: "Pesquisa por jogador",
        description:
          "Permitir localizar rapidamente um participante na guerra atual e nos confrontos históricos.",
      },
      {
        title: "Filtros por resultado",
        description:
          "Filtrar ataques por estrelas, destruição, atacante, alvo, posição e resultado ofensivo.",
      },
      {
        title: "Timeline completa",
        description:
          "Organizar cronologicamente todos os ataques realizados pelos dois clãs durante o confronto.",
      },
      {
        title: "Resumo final da guerra",
        description:
          "Gerar uma visão consolidada após o encerramento com resultado, principais números e destaques do confronto.",
      },
      {
        title: "Destaques ofensivos",
        description:
          "Identificar automaticamente os melhores desempenhos ofensivos da guerra utilizando estrelas, destruição e contexto dos ataques.",
      },
      {
        title: "Destaques defensivos",
        description:
          "Identificar automaticamente as bases com melhor desempenho defensivo durante o confronto.",
      },
      {
        title: "Relatório individual",
        description:
          "Consolidar em uma visão rápida os ataques realizados, resultados e desempenho defensivo de cada participante.",
      },
    ],
  },

  {
    phase: 2,
    title: "CWL Intelligence — próxima evolução",
    status: "next",
    description:
      "Expansão da inteligência da Clash War League após a conclusão da fundação, da Sala de Guerra, da classificação e do evento automático do Passe de Temporada.",

    items: [
      {
        title: "Histórico de temporadas",
        description:
          "Persistir e disponibilizar temporadas anteriores da CWL para consulta mesmo após o encerramento da liga atual.",
      },
      {
        title: "Histórico de desempenho por jogador",
        description:
          "Consolidar participação, ataques, estrelas e destruição dos jogadores ao longo de múltiplas temporadas.",
      },
      {
        title: "Estatísticas acumuladas da CWL",
        description:
          "Criar indicadores históricos dos clãs com resultados, posições, estrelas, destruição e aproveitamento por temporada.",
      },
      {
        title: "Resumo final da temporada",
        description:
          "Gerar uma visão consolidada ao término da CWL com classificação final, desempenho do clã e principais destaques.",
      },
      {
        title: "Arquivo dos vencedores do Passe",
        description:
          "Manter um histórico público dos vencedores oficiais do Passe de Temporada e das métricas que os tornaram elegíveis.",
      },
      {
        title: "Evolução da inteligência competitiva",
        description:
          "Utilizar os dados históricos persistidos para comparações, tendências e futuras análises estratégicas da CWL.",
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
