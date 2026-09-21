# ==========================================================

# Kings of Doom Command Center

# ----------------------------------------------------------

# Arquivo:

# ROADMAP.md

#

# Responsabilidade:

# Documentar o planejamento oficial de evolução do

# Kings of Doom Command Center.

#

# Objetivo:

# Definir as entregas planejadas para cada versão do

# projeto, servindo como referência para engenharia,

# produto e documentação.

#

# Autor:

# stigmandroid

#

# Última atualização:

# 21/09/2026

#

# Versão:

# v1.0.0

#

# Status:

# 🚧 Em desenvolvimento

# ==========================================================

# Roadmap

> **Grandes plataformas não são construídas de uma só vez. São construídas versão após versão.**

---

# Objetivo

Este documento apresenta o planejamento oficial de evolução do Kings of Doom Command Center.

O roadmap representa a direção estratégica do projeto.

As funcionalidades descritas podem sofrer alterações conforme novas necessidades forem identificadas durante o desenvolvimento.

---

# Legenda

| Status | Significado        |

| ------ | ------------------ |

| ⬜     | Planejado          |

| 🟨     | Em desenvolvimento |

| ✅     | Concluído          |

| 🚫     | Cancelado          |

---

# Situação Atual

**Versão atual**

`v1.0.0`

**Fase do projeto**

`KODA — Competitive Command Center`

**Objetivo atual**

Consolidar a Home como centro de inteligência competitiva do ecossistema Kings of Doom, utilizando dados históricos de K.O.D. e K.O.D.rec para avaliar elegibilidade, classificar jogadores, sugerir formações competitivas e identificar objetivamente necessidades de recrutamento.

---

# Roadmap

---

# ✅ v0.5.0 — War Center

## Objetivo

Criar a primeira Sala de Guerra conectada aos dados reais da Clash API.

### Entregas

✅ Página dedicada da Sala de Guerra

✅ Placar em tempo real

✅ Estrelas, destruição e ataques realizados

✅ Contagem regressiva

✅ Tratamento de guerra privada ou indisponível

✅ Componente de guerra reutilizável

---

````md# ✅ v0.6.0 — War Intelligence Foundation

## Objetivo

Transformar a Sala de Guerra em uma ferramenta prática de acompanhamento e consulta.

### Entregas concluídas

✅ Sala de Guerra dinâmica por clã

✅ Mapa comparativo K.O.D. × adversário

✅ Participantes organizados pela posição do mapa

✅ Bases destruídas, danificadas e intactas

✅ Ataques pendentes por jogador

✅ Navegação contextual entre K.O.D. e K.O.D.rec

✅ Dashboard unificado

✅ Diagnóstico aprimorado da Clash API

✅ Fundação tipada para ataques, participantes e resultados defensivos

---

# ✅ v0.7.0 — War Intelligence

## Objetivo

Organizar os eventos da guerra para responder rapidamente às principais dúvidas dos jogadores.

### Entregas concluídas

✅ Indicadores ofensivos individuais

✅ Quantidade de ataques utilizados e restantes

✅ Total de estrelas conquistadas

✅ Destruição acumulada por jogador

✅ Quantidade de ataques recebidos por base

✅ Melhor ataque recebido

✅ Histórico expansível de ataques realizados

✅ Histórico expansível de ataques recebidos

✅ Identificação do atacante e do alvo

✅ Nome e posição dos participantes envolvidos

✅ Estrelas e destruição de cada ataque

✅ Duração formatada em minutos e segundos

✅ Resumo compacto do melhor ataque recebido

✅ Posições padronizadas com dois dígitos

✅ Cores defensivas adaptadas à perspectiva do clã selecionado

✅ Nome real dos clãs no layout mobile

✅ Layout responsivo otimizado para dispositivos móveis

✅ Botão "Detalhes" otimizado para mobile

✅ Footer global

✅ Navegação direta entre Release Notes e Roadmap

✅ Hero atualizado com o logotipo oficial do K.O.D.

✅ Hero redesenhado com identidade visual própria

✅ Animação, iluminação e destaque visual no logotipo

### Evoluções futuras da Sala de Guerra

⬜ Pesquisa por jogador

⬜ Pesquisa por posição do mapa

⬜ Filtros por resultado

⬜ Timeline cronológica completa

⬜ Melhor e pior desempenho ofensivo

⬜ Melhor desempenho defensivo

⬜ Relatório individual da guerra

⬜ Resumo final da guerra

⬜ Histórico de guerras anteriores

---

# 🟨 v0.8.0 — CWL Intelligence Foundation

## Objetivo

Construir o primeiro Command Center dedicado à Liga de Guerras de Clãs, permitindo acompanhar temporadas, escalações, rodadas, confrontos e, futuramente, a classificação completa da liga.

### Entregas concluídas

✅ Página completa da Clash War League

✅ Suporte multi-clã na CWL (K.O.D. e K.O.D.rec)

✅ Detecção automática de temporada ativa

✅ Estado profissional para períodos sem CWL

✅ Visão geral da temporada

✅ Lista de clãs participantes

✅ Distribuição dos Centros de Vila por clã

✅ Calendário completo das 7 rodadas

✅ Consulta automática de todas as guerras disponíveis

✅ Identificação do confronto do clã selecionado

✅ Placar em tempo real das guerras

✅ Indicador visual do clã que está na frente

✅ Indicador de confrontos aguardando primeiros ataques

✅ Destaque visual para o clã selecionado nos confrontos

✅ Seleção de clã compatível com todas as páginas da CWL

✅ Integração com o grupo atual da Clash War League

✅ Consulta individual das guerras através de warTags

✅ Estrutura dedicada da CWL reutilizando a arquitetura da Sala de Guerra

✅ Estado atual da liga

✅ Quantidade de clãs participantes

✅ Quantidade de rodadas

✅ Quantidade de guerras disponíveis

✅ Cards dos clãs participantes

✅ Destaque automático do clã selecionado

✅ Distribuição dos Centros de Vila por clã

✅ Quantidade de jogadores inscritos

✅ Calendário das sete rodadas

✅ Identificação da rodada disponível

✅ Consulta automática dos confrontos da rodada

✅ Cards dos confrontos

✅ Identificação visual do confronto do clã selecionado

✅ Estado visual para períodos sem CWL ativa

✅ Navegação independente da CWL para K.O.D. e K.O.D.rec

### Próximas entregas

⬜ Classificação geral da liga em tempo real

⬜ Histórico completo de temporadas anteriores

⬜ Histórico permanente das rodadas

⬜ Exportação da distribuição dos Centros de Vila (PNG/JPG)

⬜ Compartilhamento das escalações

⬜ Comparação automática entre escalações

⬜ Estatísticas ofensivas da CWL

⬜ Estatísticas defensivas da CWL

⬜ Ranking de jogadores da temporada

⬜ Linha do tempo dos confrontos

⬜ Página individual de cada guerra da CWL

⬜ Medalhas e desempenho histórico dos clãs

⬜ Atualização automática dos confrontos ao trocar de rodada

⬜ Placar em tempo real da rodada atual

⬜ Classificação geral da temporada

⬜ Vitórias, derrotas e empates

⬜ Total de estrelas conquistadas

⬜ Destruição acumulada

⬜ Destaque da posição do clã selecionado

⬜ Navegação para a Sala de Guerra da CWL

⬜ Histórico das temporadas anteriores

⬜ Persistência das temporadas encerradas

⬜ Estatísticas históricas da CWL

⬜ Exportação de imagens das escalações

⬜ Exportação da classificação

⬜ Motor de exportação reutilizável para todo o portal

---

# 🟨 v0.8.1 — CWL War Room

## Objetivo

Transformar a Clash War League em uma verdadeira Sala de Guerra, permitindo acompanhar cada confronto individualmente, consultar os ataques realizados e preparar a arquitetura para a inteligência completa da temporada.

### Entregas concluídas

✅ Sala de Guerra exclusiva para cada confronto da CWL

✅ Navegação direta para a Sala de Guerra através dos confrontos

✅ Resumo completo da guerra

✅ Placar em tempo real

✅ Estrelas

✅ Destruição

✅ Quantidade de ataques realizados

✅ Estado atual da guerra

✅ Alternância entre os dois clãs do confronto

✅ Acompanhamento ofensivo

✅ Identificação de jogadores que já atacaram

✅ Identificação de jogadores pendentes

✅ Quantidade de ataques realizados

✅ Quantidade de ataques pendentes

✅ Informações completas do atacante

✅ Nome do jogador

✅ Centro de Vila

✅ Posição no mapa

✅ Estrelas conquistadas

✅ Porcentagem de destruição

✅ Informações completas do alvo atacado

✅ Nome do defensor

✅ Centro de Vila do defensor

✅ Posição da base atacada

✅ Estrutura preparada para qualquer confronto da temporada

✅ Componentes reutilizáveis para futuras expansões da Sala de Guerra

---

## Próximas entregas

⬜ Histórico completo das sete rodadas da temporada

⬜ Sala de Guerra para qualquer confronto da CWL

⬜ Linha do tempo dos ataques

⬜ Melhor ataque da guerra

⬜ Estatísticas ofensivas por jogador

⬜ Estatísticas defensivas por jogador

⬜ Eficiência ofensiva

⬜ Comparativo entre os dois clãs

⬜ MVP da guerra

⬜ Classificação geral da liga em tempo real

⬜ Vitórias, derrotas e empates

⬜ Total de estrelas conquistadas

⬜ Destruição acumulada

⬜ Destaque automático da posição do clã selecionado

⬜ Histórico permanente de temporadas

⬜ Persistência das temporadas encerradas

⬜ Estatísticas históricas da CWL

⬜ Ranking histórico de jogadores

⬜ Exportação da distribuição dos Centros de Vila (PNG)

⬜ Exportação da distribuição dos Centros de Vila (JPG)

⬜ Exportação da classificação da temporada

⬜ Compartilhamento de imagens

⬜ Motor de exportação reutilizável para todo o portal

---

# ✅ v0.8.2 — CWL Intelligence

## Objetivo

Transformar a CWL em um painel inteligente de tomada de decisão, permitindo acompanhar o andamento da temporada, navegar entre rodadas e prever matematicamente o resultado de cada confronto.

### Entregas

✅ Seleção dinâmica de rodadas

✅ Seleção instantânea sem recarregar a página

✅ Navegação totalmente client-side

✅ Atualização dinâmica dos confrontos

✅ Consulta automática das guerras de cada rodada

✅ Navegação entre rodadas sem recarregar a página

✅ Destaque visual do confronto do clã selecionado

✅ Identificação automática do adversário

✅ Nome do adversário exibido diretamente nos cards das rodadas

✅ Indicadores visuais para preparação, guerra em andamento e encerrada

✅ Cálculo matemático do cenário da guerra

✅ Algoritmo de projeção matemática da rodada

✅ Detecção automática de:

• Vitória confirmada

• Derrota confirmada

• Clã atualmente na frente

• Possibilidade matemática de vitória

• Possibilidade matemática de empate

• Quantidade mínima de estrelas necessárias para evitar a derrota

• Quantidade máxima de estrelas ainda alcançáveis

✅ Melhorias de interface para desktop e mobile

✅ Primeira funcionalidade de inteligência estratégica do Kings of Doom Command Center

---

# ✅ v0.8.3 — CWL Season Pass Event

## Objetivo

Transformar o acompanhamento da CWL em uma experiência completa de temporada e criar a infraestrutura do evento automático do Passe de Temporada, permitindo acompanhar jogadores elegíveis, congelar os participantes ao término da liga, realizar um sorteio único e persistente e preparar uma revelação sincronizada para todos os jogadores.

### Entregas

✅ Classificação geral consolidada da CWL

✅ Soma automática das estrelas conquistadas nas rodadas

✅ Aplicação do bônus oficial de 10 estrelas por vitória

✅ Destruição acumulada utilizada como critério de desempate

✅ Identificação das zonas de promoção, permanência e rebaixamento

✅ Adaptação das zonas de acordo com a liga atual

✅ Refinamento visual das zonas no desktop

✅ Refinamento visual das zonas no mobile

✅ Remoção das setas redundantes de promoção e rebaixamento

✅ Visão geral das rodadas da temporada

✅ Exibição dos clãs que se enfrentaram em cada rodada

✅ Exibição da pontuação de cada confronto

✅ Diferenciação visual entre vencedor e derrotado

✅ Tratamento visual para empates

✅ Tratamento visual para guerras em preparação

✅ Tratamento visual para guerras em andamento

✅ Melhorias de responsividade da visão geral das rodadas

✅ Regra automática de elegibilidade ao Passe de Temporada

✅ Participação mínima de três guerras

✅ Exigência de utilização de todos os ataques disponíveis

✅ Exigência de três estrelas em cada participação válida

✅ Exigência de 100% de destruição em cada participação válida

✅ Acompanhamento dinâmico dos jogadores elegíveis durante a CWL

✅ Definição do sorteio automático após o encerramento da temporada

✅ Horário oficial definido para 12:00 do dia seguinte

✅ Utilização do fuso horário America/Sao_Paulo

✅ Persistência local utilizando SQLite nativo

✅ Integração com node:sqlite no Node.js 24

✅ Criação do schema persistente do Passe de Temporada

✅ Persistência dos eventos por clã e temporada

✅ Persistência da lista definitiva de jogadores elegíveis

✅ Congelamento da elegibilidade após o encerramento da CWL

✅ Persistência permanente do vencedor

✅ Proteção contra execução duplicada do sorteio

✅ Separação entre horário do sorteio e horário da revelação

✅ Criação do repository do Passe de Temporada

✅ Criação do service responsável pelo ciclo completo do evento

✅ Sorteio realizado exclusivamente no servidor

✅ Seleção segura do vencedor

✅ Criação da API interna /api/season-pass

✅ Proteção contra exposição antecipada do vencedor

✅ Criação do CwlSeasonPassEvent

✅ Estado tracking

✅ Estado scheduled

✅ Estado revealing

✅ Estado revealed

✅ Polling automático para sincronização do evento

✅ Contagem regressiva preparada para o sorteio

✅ Interface preparada para acompanhar o evento em tempo real

✅ Correção da renderização duplicada de Rodadas e confrontos

---

## Validações operacionais pendentes

⬜ Confirmar o comportamento do primeiro sorteio oficial em produção

⬜ Confirmar sincronização da revelação em múltiplos acessos simultâneos

⬜ Confirmar persistência do vencedor após reinicialização do servidor

⬜ Registrar evidências da primeira execução oficial do evento

---

---

# 🚧 v0.8.4 — CWL Historical Archive & Infrastructure

## Objetivo

Construir a infraestrutura de persistência histórica da Clash War League, garantindo que os dados completos de cada temporada sejam preservados para análises futuras, inteligência estratégica e evolução histórica dos jogadores e do clã.

### Entregas concluídas

✅ Estrutura histórica da CWL em SQLite

✅ Persistência independente por temporada

✅ Arquivamento dos 8 clãs participantes do grupo

✅ Arquivamento das 7 rodadas da temporada

✅ Arquivamento de todas as 28 guerras do grupo

✅ Persistência das participações individuais em cada guerra

✅ Persistência individual de todos os ataques realizados

✅ Registro do atacante e defensor de cada ataque

✅ Registro do Centro de Vila do atacante e defensor

✅ Registro de estrelas e percentual de destruição

✅ Registro da ordem dos ataques

✅ Preservação dos dados brutos necessários para futuras análises

✅ Atualização idempotente através de UPSERT, evitando duplicação de temporadas e registros

✅ Endpoint administrativo para atualização manual do arquivo histórico

✅ Auditoria automática da integridade do arquivo histórico

✅ Validação da estrutura completa da temporada

✅ Validação de ataques sem atacante ou defensor

✅ Validação de ataques sem informação de Centro de Vila

✅ Validação da ordem dos ataques

✅ Distribuição histórica de ataques por 0★, 1★, 2★ e 3★

✅ Cálculo da taxa de triplas do clã monitorado

✅ Identificação de jogadores que deixaram ataques

✅ Backup físico consistente do banco SQLite

✅ Backup compatível com SQLite em WAL mode

✅ Validação automática do backup através de PRAGMA integrity_check

✅ Reabertura isolada do banco de backup para confirmação dos dados

✅ Primeiro snapshot histórico da CWL de Agosto/2026 protegido

✅ Configuração do PM2 como gerenciador do processo de produção

✅ Persistência da aplicação através de pm2 save

✅ Inicialização automática do PM2 através do systemd

✅ Recuperação automática da aplicação através de pm2 resurrect

✅ Validação do Next.js após reinicialização controlada do PM2

### Validação atual — CWL Agosto/2026

✅ 1 temporada arquivada

✅ 8 clãs

✅ 7 rodadas

✅ 28 guerras

✅ 840 participações em guerras

✅ 744 ataques preservados no snapshot atual

✅ 100 ataques registrados do K.O.D.

✅ 85 triplas do K.O.D.

✅ Taxa atual de triplas de 85%

✅ Nenhum ataque arquivado sem atacante

✅ Nenhum ataque arquivado sem defensor

✅ Nenhum ataque arquivado sem CV do atacante

✅ Nenhum ataque arquivado sem CV do defensor

✅ Nenhum ataque arquivado sem ordem

✅ Integridade geral do arquivo histórico aprovada

✅ Backup físico validado com os mesmos totais do banco principal

### Pendente para fechamento da temporada

⬜ Executar snapshot definitivo após o encerramento da última rodada

⬜ Confirmar estado final da temporada

⬜ Executar auditoria definitiva da CWL de Agosto/2026

⬜ Gerar backup definitivo pós-temporada

⬜ Validar os números finais contra os dados exibidos na CWL

### Automação do arquivo histórico

✅ Detecção automática de temporadas CWL disponíveis

✅ Arquivamento automático de K.O.D. e K.O.D.rec

✅ Execução automática de snapshots durante a temporada

✅ Atualização de guerras já conhecidas através de UPSERT

✅ Execução automática do arquivamento a cada 15 minutos em produção

✅ Endpoint administrativo protegido por segredo privado

✅ Execução multi-clã através de uma única rotina administrativa

✅ Tratamento seguro quando nenhum dos clãs possui CWL ativa

⬜ Detectar automaticamente o encerramento definitivo da temporada

⬜ Executar auditoria automática após o encerramento

⬜ Gerar backup automático da temporada concluída

⬜ Marcar a temporada como definitivamente arquivada

⬜ Registrar falhas de arquivamento ou integridade para intervenção administrativa

⬜ Proteger também os demais endpoints administrativos de auditoria e backup

---

# ✅ v0.8.5 — CWL Season Pass Ceremony

## Objetivo

Concluir a experiência pública do Passe de Temporada da CWL, conectando o vencedor oficial persistido no servidor a uma cerimônia cinematográfica responsiva, sem permitir que o frontend determine ou altere o resultado do sorteio.

### Entregas concluídas

✅ Cerimônia cinematográfica oficial do Passe de Temporada

✅ Contagem regressiva 3–2–1

✅ Rotação visual dos jogadores elegíveis

✅ Desaceleração progressiva antes da revelação

✅ Travamento visual no vencedor oficial

✅ Integração da imagem oficial do Passe de Temporada

✅ Animação de entrada e entrega do Passe

✅ Efeito de impacto no momento da premiação

✅ Halo, partículas e iluminação de celebração

✅ Transição contínua entre sorteio, entrega e resultado final

✅ Exibição das métricas do vencedor

✅ Composição responsiva específica para desktop

✅ Composição responsiva específica para dispositivos móveis

✅ Ajustes para telas estreitas próximas de 320px

✅ Dimensionamento adaptativo do nome do jogador

✅ Integração do CwlSeasonPassCeremony ao CwlSeasonPassEvent

✅ Utilização exclusiva do vencedor oficial retornado pelo backend

✅ Remoção do Math.random() como fonte de decisão no frontend

✅ Remoção da antiga CwlSeasonPassSimulation do fluxo principal

✅ Remoção da trava que limitava a cerimônia ao ambiente de desenvolvimento

✅ Correção do conflito de declaração duplicada de winner

✅ Build de produção validado no Next.js 16.2.11 com Turbopack

### Arquitetura da revelação

✅ Sorteio permanece exclusivamente server-side

✅ Vencedor permanece persistido no SQLite

✅ Frontend atua somente como camada de apresentação

✅ Cerimônia não possui autoridade para trocar o vencedor

✅ Resultado público continua protegido até o momento autorizado pelo backend

### Próximas validações

⬜ Validar a cerimônia no primeiro evento oficial em produção

⬜ Confirmar sincronização visual entre múltiplos acessos durante a revelação

⬜ Registrar evidências do vencedor e da cerimônia após a primeira execução oficial

---

# ✅ v0.8.6 — War Historical Archive & Navigation

## Objetivo

Transformar a Sala de Guerra em uma estrutura persistente de acompanhamento histórico, permitindo preservar guerras normais de K.O.D. e K.O.D.rec e consultar confrontos encerrados mesmo após deixarem de estar disponíveis pela API oficial.

### Persistência histórica

✅ Criação da estrutura histórica de guerras normais em SQLite

✅ Persistência independente das guerras monitoradas

✅ Identificação determinística de cada guerra através de warKey

✅ Atualização idempotente através de UPSERT

✅ Persistência dos participantes dos dois clãs

✅ Persistência individual dos ataques realizados

✅ Registro do atacante e defensor

✅ Registro do Centro de Vila do atacante

✅ Registro do Centro de Vila do defensor

✅ Registro da diferença de Centro de Vila entre atacante e defensor

✅ Registro de estrelas conquistadas

✅ Registro do percentual de destruição

✅ Registro da ordem do ataque

✅ Registro da duração do ataque

✅ Classificação dos ataques em 0★, 1★, 2★ e 3★

✅ Preservação do payload bruto da guerra para auditoria e análises futuras

### Suporte multi-clã

✅ Histórico independente para K.O.D.

✅ Histórico independente para K.O.D.rec

✅ Arquivamento dos dois clãs através da mesma rotina administrativa

✅ Separação histórica através da tag do clã monitorado

### Automação

✅ Endpoint administrativo para arquivamento das guerras normais

✅ Proteção do endpoint através de segredo privado

✅ Execução automática do War Archive em produção

✅ Snapshot automático a cada 5 minutos

✅ Atualização contínua da guerra durante preparação e ataques

✅ Ausência de duplicação entre snapshots sucessivos

✅ Tratamento seguro quando o clã não está participando de guerra

### Histórico de guerras

✅ Seção de guerras recentes integrada à Sala de Guerra

✅ Exibição exclusiva de guerras encerradas no histórico

✅ Diferenciação visual entre vitória, derrota e empate

✅ Lista compacta para reduzir o tamanho da página

✅ Limitação inicial das guerras exibidas na Sala de Guerra

✅ Navegação para detalhamento completo de cada confronto

### Detalhamento histórico

✅ Rota dedicada para cada guerra histórica

✅ Reconstrução da guerra a partir do snapshot persistido no SQLite

✅ Consulta histórica independente da disponibilidade atual da Clash API

✅ Reutilização do resumo completo da guerra

✅ Reutilização do mapa comparativo da guerra

✅ Consulta dos ataques e situação dos participantes

✅ Subnavegação interna para evitar páginas excessivamente longas

✅ Separação entre Resumo, Mapa e Ataques não utilizados

### Experiência responsiva

✅ Histórico compacto adaptado para desktop

✅ Histórico adaptado para dispositivos móveis

✅ Botões com área de toque adequada

✅ Navegação horizontal responsiva nas áreas internas da guerra

✅ Conteúdo pesado exibido somente sob demanda

✅ Estratégia de resumo primeiro e detalhamento posterior

### Validação atual

✅ War Archive validado localmente

✅ War Archive validado em produção

✅ Idempotência validada para os dois clãs

✅ Cron validado através de execução automática real

✅ Primeira guerra de K.O.D. preservada

✅ Primeira guerra de K.O.D.rec preservada

✅ Membros e ataques persistidos corretamente

### Próximas evoluções — War Intelligence

⬜ Página completa do histórico de guerras

⬜ Estatísticas gerais de vitórias, derrotas e empates

⬜ Histórico individual de guerras por jogador

⬜ Taxa de 0★, 1★, 2★ e 3★ por jogador

⬜ Taxa de triplas por jogador

⬜ Média de estrelas por ataque

⬜ Média de destruição por ataque

⬜ Desempenho por Centro de Vila

⬜ Desempenho por matchup de Centro de Vila

⬜ Identificação histórica de ataques não utilizados

⬜ Análise defensiva dos jogadores

⬜ Evolução de desempenho ao longo do tempo

⬜ Índice de consistência ofensiva

⬜ Ranking histórico dos membros

⬜ Comparação entre guerras normais e CWL

⬜ Identificação de tendências de evolução ou queda de performance

⬜ Base histórica para recomendações futuras de escalação

⬜ Base histórica para inteligência estratégica de guerra

---

# ✅ v0.8.7 — Members Module & Development Gateway

## Objetivo

Separar a gestão e consulta de membros do Dashboard principal e consolidar uma infraestrutura de desenvolvimento independente do IP residencial, preparando o Command Center para os futuros perfis individuais e análises históricas dos jogadores.

### Entregas concluídas

✅ Página dedicada de Membros

✅ Rotas independentes para K.O.D. e K.O.D.rec

✅ Reutilização dos cards existentes de jogadores

✅ Remoção da listagem completa de membros do Dashboard

✅ Redução das consultas desnecessárias à Player API na página inicial

✅ Service reutilizável para enriquecimento dos membros

✅ Gateway privado para dados de clã

✅ Gateway privado para perfis individuais de jogadores

✅ Gateway privado já integrado à guerra atual

✅ Gateway privado já integrado ao histórico de guerras

✅ Flag KOD_USE_DEV_PROXY independente de NODE_ENV

✅ Build local utilizando dados reais através da VPS

✅ Navegação contextual no seletor de clãs

✅ Preservação do módulo Painel ao trocar de clã

✅ Preservação do módulo Guerra ao trocar de clã

✅ Preservação do módulo CWL ao trocar de clã

✅ Preservação do módulo Membros ao trocar de clã

✅ Interface da página de Membros reorganizada

✅ Fundação preparada para perfis individuais dos jogadores

### Próximas evoluções do módulo de Membros

⬜ Busca por nome ou tag

⬜ Filtros por Centro de Vila

⬜ Filtros por cargo

⬜ Filtros por liga

⬜ Ordenação por troféus, doações e posição

⬜ Página individual do jogador

⬜ Histórico de participação em guerras

⬜ Histórico de desempenho na CWL

⬜ Integração futura com Raid Weekend

⬜ Integração futura com Jogos do Clã

---

---

# ✅ v0.8.8 — Player Profiles & Hero Equipment

## Objetivo

Iniciar a construção dos perfis individuais dos jogadores e estabelecer a fundação visual do Player Intelligence, permitindo consultar informações detalhadas de cada membro e acompanhar a evolução de heróis e equipamentos diretamente a partir dos dados da Clash API.

### Entregas concluídas

✅ Página individual de cada jogador

✅ Rota dinâmica de perfil por clã e playerTag

✅ Navegação direta da página de Membros para o perfil individual

✅ Integração com dados reais da Player API

✅ Cabeçalho individual do jogador

✅ Exibição de tag, Centro de Vila, nível de experiência e troféus

✅ Exibição da liga atual do jogador

✅ Exibição de doações realizadas e recebidas

✅ Exibição de estrelas de guerra

✅ Seção dedicada ao Exército

✅ Cards individuais dos heróis

✅ Exibição dos níveis atuais dos heróis

✅ Identificação visual de heróis no nível máximo

✅ Integração de assets visuais oficiais dos heróis

✅ Catálogo visual de equipamentos de herói

✅ Integração dos equipamentos retornados pela Clash API

✅ Assets locais dos equipamentos obtidos através do Fan Kit oficial

✅ Organização centralizada dos assets dos equipamentos

✅ Exibição do nível atual de cada equipamento

✅ Identificação visual de equipamentos no nível máximo através do contorno do nível

✅ Diferenciação visual entre equipamentos comuns e épicos

✅ Paleta visual própria para raridade comum

✅ Paleta visual própria para raridade épica

✅ Layout responsivo dos equipamentos para desktop e mobile

✅ Correção do asset visual da Lança-Foguetes

✅ Integração visual do Baralho Vingativo

✅ Fallback seguro para equipamentos sem asset disponível

✅ Build de produção validado com Next.js 16.2.11 e Turbopack

### Player Intelligence — próxima evolução

⬜ Tropas

⬜ Feitiços

⬜ Máquinas de Cerco

⬜ Pets

⬜ Conquistas

⬜ Histórico de guerras por jogador

⬜ Histórico de desempenho na CWL

⬜ Estatísticas ofensivas individuais

⬜ Estatísticas defensivas individuais

⬜ Evolução histórica do jogador

⬜ Índice de consistência

---

# ✅ v0.8.9 — Player Army & Pets

## Objetivo

Expandir o perfil individual dos jogadores e avançar o Player Intelligence através da integração visual do Exército da Vila Principal, permitindo consultar tropas, feitiços, Máquinas de Cerco e Pets diretamente a partir dos dados retornados pela Clash API.

### Entregas concluídas

✅ Seção visual de Tropas da Vila Principal

✅ Integração das tropas retornadas pela Player API

✅ Exibição dos níveis atuais das tropas

✅ Identificação visual de tropas no nível máximo

✅ Catálogo local de assets das tropas

✅ Seção visual de Feitiços

✅ Integração dos feitiços retornados pela Player API

✅ Exibição dos níveis atuais dos feitiços

✅ Identificação visual de feitiços no nível máximo

✅ Catálogo local de assets dos feitiços

✅ Integração dos feitiços mais recentes retornados pela API

✅ Seção visual de Máquinas de Cerco

✅ Separação das Máquinas de Cerco das tropas convencionais

✅ Integração das Máquinas de Cerco retornadas pela Player API

✅ Exibição dos níveis atuais das Máquinas de Cerco

✅ Identificação visual de Máquinas de Cerco no nível máximo

✅ Catálogo local de assets das Máquinas de Cerco

✅ Seção visual de Pets

✅ Integração dos Pets retornados pela Player API

✅ Suporte aos 12 Pets atualmente retornados pela API

✅ Exibição dos níveis atuais dos Pets

✅ Identificação visual de Pets no nível máximo

✅ Catálogo local de assets dos Pets

✅ Organização centralizada dos novos assets do Exército

✅ Integração dos assets obtidos através do Fan Kit oficial

✅ Criação de scripts internos para busca, classificação, seleção e exportação de assets do Fan Kit

✅ Componentes visuais reutilizáveis para Tropas, Feitiços, Máquinas de Cerco e Pets

✅ Fallback seguro para unidades sem asset visual disponível

✅ Layout responsivo das novas categorias para desktop e mobile

✅ Expansão da fundação visual do Player Intelligence

✅ Build de produção validado com Next.js 16.2.11 e Turbopack

### Pendências visuais

⬜ Revisar assets de algumas tropas recentes que ainda não correspondem exatamente aos ícones utilizados no jogo

⬜ Revisar assets de algumas Máquinas de Cerco que ainda não correspondem exatamente aos ícones utilizados no jogo

⬜ Corrigir definitivamente a nomenclatura visual de Sky Wagon para Táxi Aéreo e garantir sua exibição exclusiva em Máquinas de Cerco

---

# ✅ v0.9.0 — Trophy League & Season Intelligence

## Objetivo

Expandir o Player Intelligence através da integração da Liga de Troféus ao perfil individual, criando uma base histórica própria para acompanhar temporadas, evolução de pontuação, contribuição individual para o Clan Score e movimentações observadas entre capturas.

### Entregas concluídas

✅ Painel de Liga de Troféus no perfil individual

✅ Exibição da liga atual do jogador

✅ Exibição da pontuação observada da temporada

✅ Exibição do peso-base da liga

✅ Cálculo da contribuição estimada do jogador para o Clan Score

✅ Exibição da melhor marca histórica do jogador

✅ Validação da composição do Clan Score através dos 30 maiores pesos individuais

✅ Correspondência exata entre o Clan Score calculado e o clanPoints oficial do K.O.D.

✅ Correspondência exata entre o Clan Score calculado e o clanPoints oficial do K.O.D.rec

✅ Endpoint interno para auditoria automática do Clan Score

✅ Estrutura persistente de snapshots da Liga de Troféus em SQLite

✅ Coleta de snapshots dos membros do K.O.D.

✅ Coleta de snapshots dos membros do K.O.D.rec

✅ Associação dos snapshots ao clã monitorado

✅ Deduplicação de snapshots sem alterações relevantes

✅ Histórico cronológico de pontuação por jogador

✅ Cálculo das variações entre snapshots

✅ Separação do histórico através do leagueSeasonId

✅ Estrutura de histórico individual por temporada

✅ Identificação da temporada atual do jogador

✅ Registro visual da temporada no perfil

✅ Navegação entre Observados, Ataques e Defesas

✅ Classificação segura de movimentos observados

✅ Identificação de movimentos positivos possíveis

✅ Identificação de movimentos negativos possíveis

✅ Identificação de períodos sem alteração líquida

✅ Identificação de intervalos com movimentos agregados

✅ Regra empírica inicial para inferência de estrelas

✅ Suporte a resultados de zero estrela

✅ Fundação para interpretação dos resultados defensivos

✅ Cards compactos para movimentações da temporada

✅ Grade de alta densidade preparada para grandes quantidades de resultados

✅ Centralização dos cards e indicadores no mobile

✅ Redução de espaços vazios no painel da Liga de Troféus

✅ Investigação de possíveis endpoints públicos para battle log individual da Ranked League

✅ Definição de snapshots próprios como base histórica do Command Center

✅ Reformulação responsiva da navegação do Arsenal

✅ Remoção do scroll horizontal das categorias do Arsenal no mobile

✅ Organização das categorias do Arsenal em duas linhas centralizadas no mobile

✅ Build de produção validado com Next.js 16.2.11 e Turbopack

### Trophy League — em validação

🟨 Acumular novos snapshots durante a temporada para aumentar a resolução do histórico

🟨 Refinar a identificação entre ataques, defesas e movimentos agregados

🟨 Validar empiricamente os limites utilizados para inferência de estrelas

🟨 Comparar resultados reconstruídos pelo Command Center com registros reais observados no jogo

🟨 Refinar a interpretação de resultados defensivos

🟨 Identificar casos de múltiplas batalhas ocorridas entre snapshots

🟨 Preparar a interface para temporadas com até dezenas de ataques e defesas por jogador

### Próxima evolução da Liga de Troféus

⬜ Automatizar a coleta recorrente de snapshots

⬜ Exibir ataques reconstruídos na aba Ataques

⬜ Exibir defesas reconstruídas na aba Defesas

⬜ Exibir estrelas inferidas nos resultados em que houver confiança suficiente

⬜ Exibir totais ofensivos observados da temporada

⬜ Exibir totais defensivos observados da temporada

⬜ Comparar temporadas anteriores do jogador

⬜ Criar indicadores de evolução entre temporadas

⬜ Avaliar métricas de consistência ofensiva

⬜ Avaliar métricas de consistência defensiva

---

# 🟨 Assets e refinamento visual

## Objetivo

Revisar os assets já integrados ao perfil individual e corrigir elementos que ainda não correspondem exatamente às representações utilizadas no jogo.

### Pendências

⬜ Revisar assets de tropas recentes que ainda não correspondem exatamente aos ícones utilizados no jogo

⬜ Revisar assets de Máquinas de Cerco que ainda precisam de correção

⬜ Corrigir definitivamente Sky Wagon para Táxi Aéreo

⬜ Garantir a exibição do Táxi Aéreo exclusivamente na categoria Máquinas de Cerco

⬜ Revisar enquadramento e consistência visual dos assets do Arsenal

### Status

🟨 As correções de assets planejadas para 23/08/2026 não foram executadas devido à priorização da implementação da Liga de Troféus e da fundação histórica do Player Intelligence.

---

# Player Intelligence — próximas evoluções

✅ Histórico de guerras por jogador

✅ Histórico de desempenho na CWL

✅ Estatísticas ofensivas individuais

🟨 Estatísticas defensivas individuais

🟨 Evolução histórica do jogador

⬜ Índice de consistência

✅ Histórico de Raid Weekend

✅ Jogos do Clã

---

# ✅ v0.9.1 — Player History & Raid Archive

## Objetivo

Transformar os dados históricos já persistidos pelo Command Center em inteligência individual útil para cada jogador e iniciar a preservação permanente dos Raid Weekends.

### Player Intelligence — Guerras

✅ Histórico individual de guerras por jogador

✅ Participações em guerras

✅ Ataques realizados

✅ Estrelas conquistadas

✅ Média de estrelas

✅ Destruição média

✅ Distribuição de ataques por 0★, 1★, 2★ e 3★

✅ Quantidade de triples

✅ Taxa de triples

✅ Guerras recentes no perfil

✅ Atualização das métricas durante guerras em andamento

✅ Reconciliação automática de guerras encerradas através do War Log

✅ War Monitor automático em produção

### Player Intelligence — CWL

✅ Histórico individual de CWL por jogador

✅ Temporadas participadas

✅ Guerras disputadas

✅ Ataques realizados

✅ Estrelas conquistadas

✅ Média de estrelas

✅ Destruição média

✅ Distribuição por 0★, 1★, 2★ e 3★

✅ Triple rate

✅ Rodadas recentes

✅ Identificação correta do adversário independentemente do lado do payload

✅ Painel CWL integrado ao perfil individual

### Trophy League

✅ Battle Log real de ataques

✅ Battle Log real de defesas

✅ Separação explícita entre ataque e defesa

✅ Estrelas reais

✅ Destruição real

✅ Troféus reais por batalha

✅ Destaque visual para ataques máximos

✅ Destaque visual para defesas perfeitas

✅ Linguagem visual distinta entre ataques e defesas

### Raid Weekend

✅ Gateway privado para Capital Raid Seasons

✅ Consulta multi-clã de Raid Weekend

✅ Schema persistente em SQLite

✅ Tabela de Raid Weekends

✅ Tabela de participantes

✅ Repository dedicado

✅ Archive Service dedicado

✅ Raid Collector multi-clã

✅ Persistência de Capital Gold saqueado

✅ Persistência de ataques realizados

✅ Persistência de limite de ataques

✅ Persistência de ataques bônus

✅ Recuperação dos três Raid Weekends mais recentes

✅ Persistência validada para K.O.D. e K.O.D.rec

### Clan Capital

✅ Player type preparado para clanCapitalContributions

🟨 Criar snapshots de contribuições acumuladas

🟨 Calcular contribuição realizada no período

⬜ Ranking semanal de Capital Contributions

⬜ Histórico individual de contribuições

### Próximas entregas

🟨 Automatizar o Raid Collector em produção

✅ Integrar Raid Weekend ao perfil individual

✅ Ranking geral de Raid Weekend

✅ Histórico de Raid Weekends por jogador

✅ Média de Capital Gold por ataque

✅ Jogos do Clã

✅ Player Intelligence de Jogos do Clã

---

# ✅ v0.9.2 — Event Intelligence & Raid Weekend

## Objetivo

Criar a primeira visão global de eventos do clã e transformar os dados persistidos de Raid Weekend em inteligência visual e histórica.

### Event Intelligence

✅ Nova página global de Eventos

✅ Eventos integrado à navbar principal

✅ Navegação contextual entre K.O.D. e K.O.D.rec

✅ Estrutura preparada para múltiplos eventos

✅ Placeholder preparado para Jogos do Clã

### Raid Weekend

✅ Visão global do Raid Weekend mais recente

✅ Capital Gold total

✅ Total de ataques

✅ Raids concluídos

✅ Distritos inimigos destruídos

✅ Quantidade de participantes

✅ Loot médio por ataque

✅ Média de ataques por participante

✅ Taxa de utilização dos ataques

✅ Ranking resumido Top 10

✅ Ranking completo dos participantes

✅ Capital Gold por jogador

✅ Ataques utilizados por jogador

✅ Ataque bônus identificado

✅ Loot médio individual por ataque

✅ Destaque visual do Top 3

### Histórico

✅ Histórico persistido de Raid Weekends

✅ Comparação entre eventos consecutivos

✅ Variação percentual de Capital Gold

✅ Comparação de ataques

✅ Comparação de raids concluídos

✅ Comparação de loot por ataque

### Arquitetura

✅ Raid History Service

✅ Leitura do histórico diretamente do SQLite

✅ Endpoint interno de validação

✅ Independência da Clash API para visualização histórica

### Próximas entregas

⬜ Tornar jogadores do ranking clicáveis

✅ Integrar Raid Weekend ao perfil individual

✅ Histórico individual de Raid Weekend

⬜ Capital Contributions por período

✅ Jogos do Clã

✅ Event Intelligence de Jogos do Clã

---

# ✅ v0.9.3 — Clan Games Intelligence

## Objetivo

Expandir o Event Intelligence para os Jogos do Clã, criando uma estrutura persistente capaz de preservar eventos e participantes, acompanhar a evolução individual e estabelecer a fundação para coleta e finalização automáticas nas próximas edições.

### Entregas concluídas

✅ Integração dos Jogos do Clã ao Event Intelligence

✅ Estrutura persistente dos Jogos do Clã em SQLite

✅ Eventos independentes por clã e temporada

✅ Persistência individual dos participantes

✅ Preservação dos participantes mesmo após saída do clã

✅ Ranking individual dos Jogos do Clã

✅ Pontuação individual persistida

✅ Posição final persistida quando disponível

✅ Integração da conquista Games Champion da Player API

✅ Snapshots individuais da conquista Games Champion

✅ Estrutura de baseline por jogador

✅ Coletor dos Jogos do Clã

✅ Processamento dos participantes persistidos do evento

✅ Atualização dos snapshots individuais

✅ Atualização da pontuação consolidada do evento

✅ Suporte multi-clã para K.O.D. e K.O.D.rec

✅ Lifecycle dedicado aos Jogos do Clã

✅ Separação entre coleta e finalização

✅ Registro de observações para finalização

✅ Verificação de estabilidade antes do encerramento definitivo

✅ Intervalo mínimo entre observações de finalização

✅ Proteção contra finalização prematura

✅ Preservação do primeiro histórico de Agosto/2026

✅ Reconciliação dos resultados finais disponíveis de Agosto/2026

### Raid Weekend — refinamentos responsivos

✅ Ranking completo otimizado para dispositivos móveis

✅ Redução da largura e dos espaços internos no mobile

✅ Maior densidade de informações em telas estreitas

✅ Organização compacta de posição, jogador, ataques e Capital Gold

✅ Melhor aproveitamento de telas próximas de 375px

### Fundação para as próximas edições dos Jogos do Clã

✅ Fundação para snapshot pré-evento

✅ Fundação para cálculo de evolução através da conquista Games Champion

✅ Fundação para acompanhamento automático durante o evento

✅ Fundação para finalização baseada em observações estáveis

### Próximas evoluções — Jogos do Clã

⬜ Automatizar a preparação de cada nova edição antes do início dos Jogos do Clã

⬜ Capturar automaticamente o baseline antes do início de cada evento

⬜ Definir calendário/configuração confiável para identificação das datas dos Jogos do Clã

⬜ Tratar de forma automática jogadores que entrarem no clã após o snapshot inicial

⬜ Automatizar completamente o fechamento e arquivamento das próximas edições

⬜ Integrar o histórico dos Jogos do Clã ao Player Intelligence

⬜ Criar histórico individual de participações nos Jogos do Clã

⬜ Criar estatísticas históricas de pontuação por jogador

⬜ Criar comparativos entre temporadas dos Jogos do Clã

⬜ Criar indicadores de participação e consistência

⬜ Criar histórico consolidado de eventos por jogador

### Próximas evoluções — Capital do Clã

⬜ Capturar snapshots periódicos de clanCapitalContributions

⬜ Calcular a contribuição individual de Capital Gold por período

⬜ Criar histórico semanal de contribuições da Capital do Clã

⬜ Integrar as contribuições da Capital ao Player Intelligence

---

# 🚧 v0.9.4 — Player Event History & Raid Reliability

## Objetivo

Expandir o Player Intelligence através da integração dos eventos históricos ao perfil individual e fortalecer a coleta de Raid Weekend para preservar continuamente a participação e o desempenho dos jogadores.

### Player Intelligence — Jogos do Clã

✅ Histórico individual de Jogos do Clã

✅ Participações registradas por temporada

✅ Pontuação histórica individual

✅ Pontuação total acumulada

✅ Média de pontos por participação

✅ Melhor pontuação registrada

✅ Melhor posição registrada

✅ Participações recentes no perfil

### Player Intelligence — Raid Weekend

✅ Histórico individual de Raid Weekend

✅ Integração do Raid Archive ao perfil do jogador

✅ Quantidade de participações

✅ Capital Gold acumulado

✅ Ataques utilizados

✅ Ataques disponíveis

✅ Ataques não utilizados

✅ Taxa histórica de utilização dos ataques

✅ Média de Capital Gold por Raid

✅ Média de Capital Gold por ataque

✅ Melhor saque individual

✅ Histórico dos Raid Weekends recentes

### Interface histórica

✅ Guerra integrada ao Player Intelligence

✅ CWL integrada ao Player Intelligence

✅ Jogos do Clã integrado ao Player Intelligence

✅ Raid Weekend integrado ao Player Intelligence

✅ Nova organização responsiva dos painéis históricos

✅ Guerra e CWL com altura visual consistente

✅ Jogos do Clã e Raid Weekend organizados em coluna dedicada

### Confiabilidade do Raid Archive

✅ Persistência por Raid Weekend e jogador

✅ UPSERT sem remoção de participantes anteriores

✅ Preservação de jogadores mesmo após saída do clã

✅ Proteção contra regressão de ataques através de MAX

✅ Proteção contra regressão do Capital Gold através de MAX

✅ Recuperação dos três Raid Weekends mais recentes

✅ Runner independente do Next.js

✅ Comando npm run raid:collect

✅ Coleta manual validada para K.O.D.

✅ Coleta manual validada para K.O.D.rec

### Automação de produção

✅ Executar Raid Collector automaticamente a cada 10 minutos

✅ Validar primeira execução automática em produção

⬜ Validar coleta de jogadores que entrem, ataquem e deixem o clã durante o evento

⬜ Registrar monitoramento da última execução do collector

⬜ Criar backup automático periódico do SQLite

### Próximas evoluções

⬜ Capital Contributions por período

⬜ Histórico semanal de contribuições da Capital do Clã

⬜ Índice de consistência do jogador

⬜ Comparação histórica entre Raid Weekends

⬜ Comparação histórica entre temporadas dos Jogos do Clã

⬜ Indicadores consolidados de participação nos eventos

---

# ✅ v0.9.5 — War Archive Reliability & Event History UX

## Objetivo

Fortalecer a integridade do histórico de guerras e melhorar a experiência de consulta dos eventos individuais, garantindo que o crescimento contínuo dos registros não comprometa a confiabilidade dos dados nem a organização do perfil do jogador.

### War Archive Reliability

✅ Investigação de guerra duplicada em produção

✅ Identificação da causa relacionada à alteração dos horários retornados pela Clash API

✅ Reconciliação de identidade entre snapshots de preparation, inWar e warEnded

✅ Busca por guerras compatíveis antes da criação de um novo warKey

✅ Validação pelo clã monitorado

✅ Validação pelo adversário

✅ Validação pelo tamanho da guerra

✅ Validação por proximidade temporal

✅ Preservação do warKey existente quando a guerra já é conhecida

✅ Proteção contra duplicidades provocadas por mudanças de timestamp

✅ Snapshots em preparation removidos do histórico individual do jogador

✅ Preservação de guerras encerradas mesmo quando o jogador não utilizou ataques

✅ Auditoria do registro duplicado em produção

✅ Backup consistente do SQLite antes da correção

✅ Remoção segura do snapshot histórico fantasma

✅ Preservação integral da guerra definitiva

✅ Validação dos ataques e estrelas após a limpeza

### Event History UX

✅ Jogos do Clã adaptado para ocupar corretamente a largura disponível

✅ Melhorias responsivas no histórico individual dos Jogos do Clã

✅ Padronização dos badges de participação

✅ Alinhamento vertical dos indicadores históricos

✅ Correção da linha de base dos valores no desktop

✅ Refinamento do cabeçalho do Raid Weekend

✅ Badge de participação do Raid Weekend reorganizado no desktop

✅ Jogos do Clã e Raid Weekend com linguagem visual consistente

✅ Histórico recente limitado para impedir crescimento vertical ilimitado

✅ Dados históricos completos preservados no SQLite

### Estratégia de crescimento histórico

✅ Separação entre armazenamento completo e visualização resumida

✅ Perfil preparado para apresentar somente registros recentes

✅ Fundação visual para crescimento de múltiplas temporadas dos Jogos do Clã

✅ Fundação visual para crescimento contínuo dos Raid Weekends

### Próxima evolução — Histórico Completo

⬜ Criar área dedicada ao histórico completo do jogador

⬜ Histórico completo de guerras

⬜ Histórico completo de CWL

⬜ Histórico completo dos Jogos do Clã

⬜ Histórico completo de Raid Weekend

⬜ Paginação dos registros históricos

⬜ Filtros por ano

⬜ Filtros por período

⬜ Navegação entre modalidades históricas

⬜ Indicadores de evolução temporal

⬜ Comparações entre períodos

⬜ Preparar gráficos históricos de desempenho

---

# ✅ v0.9.6 — COC Bot Verification Gateway

## Objetivo

Criar a primeira integração oficial entre o Kings of Doom Command Center e o COC Bot, utilizando o portal como camada web segura para fluxos iniciados pelo WhatsApp que exigem confirmação de identidade fora da conversa.

### Entregas concluídas

✅ Rota localizada para verificação de contas Clash

✅ Página dedicada em `/[locale]/cocbot/verify/[token]`

✅ Interface independente da Navbar e Footer do Command Center

✅ Criação do `LocaleShell` para rotas especiais

✅ Identificação visual da conta sendo verificada

✅ Exibição do nome do jogador

✅ Exibição da tag do jogador

✅ Campo protegido para Clash API Token

✅ Estado de carregamento da sessão

✅ Estado de sessão inválida

✅ Estado de sessão expirada

✅ Estado de conta verificada

✅ Sessões temporárias iniciadas pelo COC Bot

✅ Links individuais de verificação

✅ Validade limitada das sessões

✅ Integração com Português do Brasil

✅ Integração com Inglês

✅ Traduções através do `next-intl`

✅ Locale definido através da URL gerada pelo COC Bot

✅ Gateway server-side para consulta de sessões

✅ Gateway server-side para confirmação da conta

✅ Comunicação autenticada com a API privada do COC Bot

✅ Segredo privado mantido exclusivamente no backend

✅ Clash API Token não persistido pelo Command Center

✅ Arquitetura preparada para comunicação local entre site e bot na mesma VPS

✅ Interface responsiva para dispositivos móveis

### Validação de produção pendente

🟨 Publicar as novas rotas no servidor de produção

🟨 Configurar `COCBOT_PRIVATE_API_URL` no ambiente de produção

🟨 Configurar `COCBOT_PRIVATE_API_SECRET` no ambiente de produção

🟨 Confirmar comunicação `Command Center → COC Bot` através de `127.0.0.1:3100`

🟨 Validar abertura de um link real gerado pelo `/linkplayer`

🟨 Validar consulta de uma sessão real do COC Bot

🟨 Validar envio de Clash API Token através do portal

🟨 Confirmar encerramento da sessão após verificação bem-sucedida

🟨 Confirmar vínculo definitivo `WhatsApp User ↔ Clash Player`

🟨 Validar experiência completa em dispositivo móvel

### Próxima evolução — COC Bot Web Integration

✅ Adicionar identidade visual oficial do COC Bot à página

⬜ Refinar mensagens de erro retornadas pela API

⬜ Criar experiência específica para conta já vinculada

⬜ Criar experiência específica para sessão já utilizada

✅ Criar página pública de informações do COC Bot

⬜ Integrar status operacional do COC Bot ao Command Center

⬜ Preparar futuras visualizações de contas vinculadas

⬜ Preparar futuras visualizações de clãs vinculados

⬜ Preparar futura integração com tracking e eventos do COC Bot

⬜ Preparar páginas públicas de Releases e Roadmap do COC Bot

---

# 🟨 v0.9.7 — Player Arsenal Visual System & COC Bot Public Experience

## Objetivo

Consolidar a linguagem visual do Arsenal do Jogador e transformar o COC Bot em uma superfície pública integrada ao Kings of Doom Command Center, preservando a experiência mobile-first e a separação arquitetural entre divulgação, navegação institucional e verificação segura de contas.

### Entregas concluídas

✅ Padronização visual dos estados maximizados no Arsenal do Jogador

✅ Definição do dourado `#FACC15` como cor oficial de destaque para unidades e equipamentos no nível máximo

✅ Remoção da indicação textual de MAX em favor de bordas, badges de nível e glow contextual

✅ Preservação da identidade de raridade dos Equipamentos de Herói

✅ Fundo azul para equipamentos comuns

✅ Fundo roxo/fúcsia para equipamentos épicos

✅ Estrutura visual neutra para cards e estados não maximizados

✅ Glow de hover e destaque do badge de nível em itens maximizados

✅ Ajustes individuais de escala e posicionamento através do catálogo central de assets

✅ Correções de enquadramento em Equipamentos, Tropas e Pets

✅ Revisão dos nomes em Português do Brasil dos Equipamentos de Herói

✅ Revisão dos nomes em Português do Brasil dos Pets

✅ Primeira landing page pública do COC Bot em `/[locale]/cocbot`

✅ Desenvolvimento mobile-first da página pública do COC Bot

✅ Integração do COC Bot à Navbar principal e ao menu mobile

✅ Integração da landing ao Footer institucional do Command Center

✅ Refinamento do `LocaleShell` para manter somente `/[locale]/cocbot/verify/[token]` fora da navegação institucional

✅ Separação explícita entre landing pública e fluxo seguro de verificação

✅ Criação da identidade visual oficial do COC Bot

✅ Criação do logotipo oficial do COC Bot

✅ Criação de versão transparente do logotipo para utilização no site

✅ Integração do logotipo oficial ao Hero da landing

✅ Criação de imagem oficial para o perfil do COC Bot no WhatsApp

✅ Consolidação da identidade visual dark navy, slate e dourado entre Command Center e COC Bot

✅ Revisão dos nomes em Português do Brasil das Tropas

✅ Revisão dos nomes em Português do Brasil dos Feitiços

✅ Revisão dos nomes em Português do Brasil das Máquinas de Cerco

✅ Localização dos assets corretos para unidades que utilizavam imagens ausentes ou inadequadas

✅ Substituição dos assets identificados como incorretos

✅ Ajustes finais de escala e posicionamento das categorias do Arsenal

✅ Revisão visual final do Arsenal do Jogador em desktop e mobile

### Próximas evoluções — COC Bot

⬜ Refinar conteúdo e composição visual da landing pública

⬜ Inserir screenshots reais das automações do COC Bot

⬜ Configurar CTA definitivo de contato pelo WhatsApp

⬜ Criar card visual completo do estado da conta do jogador

⬜ Criar acompanhamento individual da Liga de Troféus pelo COC Bot

⬜ Expandir a experiência individual para Raid Weekend

⬜ Expandir a experiência individual para Jogos do Clã

⬜ Integrar histórico e indicadores individuais do Player Intelligence ao COC Bot

---

# ✅ v0.9.8 — CWL Season Pass Reliability & Ceremony Experience

## Objetivo

Fortalecer o Passe de Temporada da CWL desde o encerramento da liga até a apresentação pública do vencedor, garantindo consistência histórica, criação automática do evento, recuperação segura após indisponibilidade da Clash API e uma experiência de cerimônia individual para cada visitante.

### Entregas concluídas

✅ Correção da exibição de vencedor pertencente a temporada anterior

✅ Associação determinística de cada evento através de `season + clanTag`

✅ Preservação permanente dos sorteios e vencedores históricos

✅ Manutenção independente do histórico de K.O.D. e K.O.D.rec

✅ Integração da criação do Passe ao encerramento definitivo da CWL

✅ Utilização do CWL Archive como fonte pós-temporada

✅ Recuperação da season correta quando a Clash API não disponibiliza mais a CWL encerrada

✅ Criação idempotente do evento do Passe

✅ Proteção contra duplicação através de `UNIQUE (season, clan_tag)`

✅ Congelamento da lista definitiva de jogadores elegíveis

✅ Preservação da lista congelada após o sorteio

✅ Cálculo do agendamento a partir do `endTime` real da temporada

✅ Sorteio mantido para 12:00 do dia seguinte ao encerramento da CWL

✅ Utilização do fuso `America/Sao_Paulo`

✅ Validação de carregamento completo das guerras antes do encerramento definitivo

✅ Proteção contra snapshots parciais da temporada

✅ Exigência de todas as guerras carregadas em `warEnded`

✅ Fallback seguro através do histórico persistido em SQLite

✅ Cerimônia desacoplada do instante exato do sorteio

✅ Cerimônia disponível para primeira visualização mesmo após o horário oficial

✅ Controle individual da cerimônia por navegador, clã e temporada

✅ Persistência da visualização utilizando `localStorage`

✅ Início automático somente quando o usuário chega à seção do Passe

✅ Utilização de `IntersectionObserver` para detectar visibilidade real da cerimônia

✅ Prevenção de execução da animação fora da viewport

✅ Proteção contra interrupção causada pelo polling periódico da API

✅ Vencedor permanece exclusivamente definido e persistido pelo backend

✅ Frontend permanece sem autoridade para refazer ou alterar o sorteio

### Validações pendentes em produção

⬜ Confirmar criação automática do evento após o encerramento completo da CWL

⬜ Confirmar comportamento independente de K.O.D. e K.O.D.rec

⬜ Confirmar que vencedores históricos permanecem intactos

⬜ Confirmar cerimônia automática na primeira visualização de cada navegador

⬜ Confirmar que a cerimônia não inicia antes de entrar na viewport

⬜ Confirmar acesso posterior direto ao resultado oficial

⬜ Registrar evidências do primeiro ciclo completo após a atualização

---

# ✅ v0.9.9 — KODA Public Experience & Assistant Identity

## Objetivo

Consolidar a transição pública do COC Bot para KODA — Kings of Doom Assistant — criando uma identidade própria, uma landing mais madura e uma apresentação clara das funcionalidades que conectam WhatsApp e Command Center.

### Entregas concluídas

✅ Definição pública da marca KODA — Kings of Doom Assistant

✅ Redesign completo da landing pública

✅ Integração da personagem visual oficial da KODA

✅ Hero redesenhado com animações, glow e movimento

✅ Integração de screenshots reais das automações no WhatsApp

✅ Organização das funcionalidades atuais em uma narrativa mais clara

✅ Reforço da proposta de valor para líderes e jogadores

✅ Comunicação explícita de que a KODA informa e organiza, sem automatizar jogabilidade

✅ Substituição de “COC Bot” por “KODA” na navegação principal

✅ Preservação da rota /[locale]/cocbot para compatibilidade

✅ Manutenção da experiência responsiva em desktop e mobile

### Próximas evoluções — KODA

⬜ Card visual completo do estado da conta do jogador

⬜ Expansão do acompanhamento da Liga Ranqueada

⬜ Histórico individual de Guerra e CWL

⬜ Integração progressiva de Raid Weekend e Jogos do Clã

⬜ Evolução das configurações administrativas via web

⬜ Ampliação da inteligência operacional para líderes e co-líderes

---

# ✅ v1.0.0 — KODA Competitive Command Center

## Objetivo

Transformar a página inicial do Kings of Doom Command Center em um centro real de inteligência competitiva, conectando os dados históricos de K.O.D. e K.O.D.rec à KODA para apoiar decisões de escalação, elegibilidade e recrutamento.

### Home & Command Center

✅ Nova Home oficial do Kings of Doom Command Center

✅ Rotas contextuais para K.O.D. e K.O.D.rec

✅ Navbar como fonte única do contexto do clã

✅ Troca completa das informações da Home ao alternar o clã selecionado

✅ Novo Hero oficial do Command Center

✅ Integração visual entre KODA, King e identidade Kings of Doom

✅ Conceito visual "Dados vencem guerras"

✅ Card compacto de Guerra Agora

✅ Card compacto de Informações do Clã

✅ Experiência responsiva para desktop e dispositivos móveis

✅ Identidade visual oficial compartilhada entre Hero e Navbar

### KODA Competitive Intelligence

✅ Pool competitivo unificado entre K.O.D. e K.O.D.rec

✅ Independência entre clã cotidiano e formação competitiva da CWL

✅ Identificação permanente dos jogadores através da playerTag

✅ Janela móvel de análise competitiva de 30 dias

✅ Consolidação de evidências históricas da CWL

✅ Consolidação de evidências de guerras normais

✅ Preservação da origem das evidências competitivas

### Elegibilidade

✅ Elegibilidade aplicada antes da classificação

✅ Amostra mínima de 12 ataques competitivos válidos

✅ Participação mínima de 90% dos ataques disponíveis

✅ Média mínima de 2,60 estrelas

✅ Média mínima de 90% de destruição

✅ Taxa mínima de 80% de triplas

✅ Estados eligible, provisional e ineligible

✅ Separação entre insuficiência de evidências e desempenho abaixo dos critérios

✅ Centro de Vila tratado como restrição de composição e não como pontuação

### Classificação competitiva

✅ Classificação exclusiva dos jogadores elegíveis

✅ Taxa de triplas como primeiro critério competitivo

✅ Média de estrelas como segundo critério

✅ Média de destruição como terceiro critério

✅ Confiabilidade como critério adicional

✅ Volume de ataques como critério adicional

✅ Critério determinístico de desempate

### Formação competitiva

✅ Formação automática sugerida pela KODA

✅ Até 15 titulares para K.O.D.

✅ Até 15 titulares para K.O.D.rec

✅ Até 3 reservas para K.O.D.

✅ Até 3 reservas para K.O.D.rec

✅ Distribuição baseada na classificação competitiva global

✅ Ausência de preenchimento artificial da escalação

✅ Preservação de vagas quando não existem jogadores elegíveis suficientes

✅ Identificação automática das vagas de titulares

✅ Identificação automática das vagas de reservas

✅ Identificação objetiva da necessidade de recrutamento

✅ Decisão final preservada para líderes e colíderes

### Arquitetura

✅ Pipeline separado entre evidência, elegibilidade, classificação e alocação

✅ Motor competitivo independente da camada visual

✅ Integração com o arquivo histórico persistente

✅ Home dinâmica utilizando os dados reais do ambiente de produção

✅ Validação do motor competitivo em produção

---

# 🟨 v1.0.1 — Competitive Ranking & Explainability

## Objetivo

Transformar a classificação interna utilizada pela KODA em uma experiência transparente e auditável, permitindo compreender não apenas quem foi selecionado, mas por que cada jogador ocupa determinada posição competitiva.

### Próximas entregas

⬜ Classificação competitiva global visível na Home

⬜ Posição individual de cada jogador no ranking KODA

⬜ Métricas competitivas exibidas junto à classificação

⬜ Taxa de triplas

⬜ Média de estrelas

⬜ Média de destruição

⬜ Confiabilidade

⬜ Quantidade de ataques válidos

⬜ Explicação dos critérios responsáveis pela posição do jogador

⬜ Explicação de elegibilidade, estado provisório ou inelegibilidade

⬜ Diferenciação visual entre classificação e escalação

⬜ Justificativa da KODA para titulares

⬜ Justificativa da KODA para reservas

⬜ Identificação dos jogadores imediatamente abaixo da linha de corte

⬜ Visualização da distância competitiva entre jogadores

⬜ Auditoria da classificação com dados históricos

⬜ Refinamento da composição por Centro de Vila sem transformar CV em pontuação

⬜ Preparação da classificação para futuras recomendações estratégicas

---

# v0.10.0 — Community

## Objetivo

Criar ferramentas para facilitar a administração de comunidades.

### Planejamento

⬜ Gestão de membros

⬜ Histórico individual

⬜ Sistema de recrutamento

⬜ Perfil dos jogadores

⬜ Organização por funções

⬜ Ferramentas administrativas

---

# v0.11.0 — Automation

---

# 🎉 v1.0.0 — First Stable Release

## Objetivo

Disponibilizar a primeira versão estável do Kings of Doom Command Center.

### Funcionalidades previstas

⬜ Dashboard completo

⬜ Sala de Guerra

⬜ Gestão de membros

⬜ Histórico

⬜ Analytics

⬜ Internacionalização

⬜ Arquitetura modular

⬜ Documentação técnica

⬜ Código totalmente padronizado

⬜ Performance otimizada

---

# Futuro do Projeto

As versões abaixo representam a visão de longo prazo.

As prioridades poderão mudar conforme a evolução do projeto.

---

# v2.0 — Player Intelligence

### Objetivo

Construir perfis inteligentes para cada jogador.

Planejamento

⬜ Histórico completo

⬜ Consistência

⬜ Evolução

⬜ Indicadores individuais

⬜ Recomendações

---

# v2.1 — Artificial Intelligence

### Objetivo

Introduzir Inteligência Artificial para auxiliar líderes.

Planejamento

⬜ Recomendações automáticas

⬜ Respostas inteligentes

⬜ Análise de guerras

⬜ Resumos

⬜ Sugestões estratégicas

---

# v2.2 — Predictions

### Objetivo

Antecipar acontecimentos antes das guerras.

Planejamento

⬜ Previsão de desempenho

⬜ Probabilidade de vitória

⬜ Tendências

⬜ Riscos

⬜ Indicadores preditivos

---

# v2.3 — Integrations

### Objetivo

Expandir o Kings of Doom Command Center como plataforma integrada a serviços, automações e canais externos.

Planejamento

🟨 WhatsApp através do COC Bot

⬜ Expansão da integração Command Center ↔ COC Bot

⬜ Discord

⬜ APIs externas

⬜ Exportação de dados

⬜ Compartilhamento

⬜ Integrações com serviços de terceiros

---

# v2.4 — Mobile Experience

### Objetivo

Disponibilizar o Kings of Doom em dispositivos móveis.

Planejamento

⬜ Aplicativo Android

⬜ Aplicativo iOS

⬜ Push Notifications

⬜ Sincronização

---

# 🌎 v3.0 — Complete Clan Management Platform

## Objetivo

Consolidar o Kings of Doom Command Center como uma plataforma completa para gerenciamento de comunidades competitivas.

Planejamento

⬜ Inteligência Artificial avançada

⬜ Analytics completos

⬜ Gestão de múltiplos clãs

⬜ Gestão de alianças

⬜ Plataforma de recrutamento

⬜ Ferramentas administrativas

⬜ Integrações completas

⬜ Plataforma mobile

⬜ API pública

⬜ Marketplace de integrações

---

# Critérios para uma Nova Versão

Uma nova versão deverá ser publicada somente quando:

- Todas as funcionalidades planejadas estiverem concluídas.- O build estiver estável.- Não existirem erros críticos conhecidos.- A documentação estiver atualizada.- As Release Notes estiverem publicadas.- O CHANGELOG estiver atualizado.

---

# Filosofia de Evolução

O Kings of Doom Command Center será desenvolvido de forma incremental.

Cada versão deverá tornar o sistema:

- Mais inteligente.- Mais útil.- Mais automatizado.- Mais confiável.- Mais fácil de manter.

Não buscamos adicionar funcionalidades por quantidade.

Buscamos entregar funcionalidades que realmente gerem valor para líderes e comunidades.

---

# Regra de Ouro

Antes de iniciar uma nova funcionalidade, pergunte:

> Esta funcionalidade aproxima o projeto da visão definida em `VISION.md`?

Se a resposta for "não", ela deve ser reavaliada.

---

> **Toda grande plataforma começa com uma única versão. O importante é nunca parar de evoluir.**```

````
