# ==========================================================

# Kings of Doom Command Center

# ----------------------------------------------------------

# Arquivo:

# ENGINEERING_STANDARDS.md

#

# Responsabilidade:

# Definir os padrões oficiais de desenvolvimento do

# Kings of Doom Command Center.

#

# Objetivo:

# Garantir consistência, qualidade, legibilidade e

# manutenibilidade em toda a base de código.

#

# Autor:

# stigmandroid

#

# Última atualização:

# 27/07/2026

#

# Versão:

# 1.0.0

#

# Status:

# ✅ Produção

# ==========================================================

# Engineering Standards

## Objetivo

Este documento define os padrões oficiais de engenharia do Kings of Doom Command Center.

Todo novo código desenvolvido deve seguir estas diretrizes.

O objetivo é garantir:

- Consistência
- Legibilidade
- Facilidade de manutenção
- Escalabilidade
- Padronização entre todos os módulos

---

# Índice

1. Estrutura do Projeto
2. Cabeçalho dos Arquivos
3. Organização dos Arquivos
4. Comentários
5. Tipagem
6. Imports
7. Componentes React
8. Helpers
9. Constantes
10. Tratamento de Erros
11. Performance
12. Estilo JSX
13. Versionamento
14. Checklist de Qualidade

---

# 1. Estrutura do Projeto

Cada diretório possui uma responsabilidade específica.

```text
app/
```

Responsável pelas páginas.

```text
components/
```

Componentes reutilizáveis.

```text
lib/
```

Regras de negócio.

```text
types/
```

Tipos TypeScript.

```text
public/
```

Arquivos públicos.

```text
docs/
```

Documentação do projeto.

---

# 2. Cabeçalho dos Arquivos

Todos os arquivos TypeScript devem iniciar com o cabeçalho oficial.

Modelo:

```ts
// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// NomeDoArquivo.tsx
//
// Localização:
// components/dashboard/
//
// Responsabilidade:
// Descrever claramente o propósito do arquivo.
//
// Funcionalidades:
//
// - Funcionalidade 1;
// - Funcionalidade 2;
// - Funcionalidade 3.
//
// Dependências:
//
// - Biblioteca 1
// - Biblioteca 2
//
// Autor:
// stigmandroid
//
// Última atualização:
// DD/MM/AAAA
//
// Versão:
// x.y.z
//
// Status:
// 🚧 Desenvolvimento
// ✅ Produção
// 🧪 Experimental
// ==========================================================
```

---

# 3. Organização dos Arquivos

Todo arquivo deve seguir esta ordem:

```text
Cabeçalho

↓

Imports

↓

Tipos

↓

Constantes

↓

Helpers

↓

Hooks

↓

Componente Principal

↓

Componentes Auxiliares

↓

Exportações
```

Nunca alterar esta sequência.

---

# 4. Comentários

Comentários existem para explicar regras de negócio.

Nunca comentar código óbvio.

❌ Evite:

```ts
const hours = 10; // Define as horas
```

✅ Prefira:

```ts
/**
 * Durante o dia de preparação o contador deve considerar
 * o horário de início da guerra.
 */
```

Toda função pública deve possuir documentação.

Modelo:

```ts
/**
 * Descrição da função.
 *
 * Explicação da regra de negócio.
 *
 * @param parametro
 * @returns retorno
 */
```

---

# 5. Tipagem

Sempre utilizar TypeScript.

Evitar:

```ts
any;
```

Sempre preferir:

```ts
type;
```

ou

```ts
interface;
```

quando apropriado.

---

# 6. Imports

Organizar sempre nesta ordem:

Bibliotecas externas

```ts
import Image from "next/image";
import Link from "next/link";
```

↓

Arquivos internos

```ts
import { getClan } from "@/lib/api";
```

↓

Tipos

```ts
import type { Clan } from "@/types/clan";
```

Nunca misturar as categorias.

---

# 7. Componentes React

Cada componente deve possuir apenas uma responsabilidade.

Quando um componente ultrapassar aproximadamente 300 linhas, avaliar:

- Separar componentes auxiliares.
- Mover lógica para helpers.
- Extrair regras de negócio para `lib/`.

Componentes devem renderizar.

Helpers devem calcular.

---

# 8. Helpers

Toda lógica reutilizável deve ficar fora do componente.

Exemplo:

```text
lib/date/
```

```text
normalizeClashDate.ts
```

```text
getRemainingTime.ts
```

Nunca duplicar regras de negócio.

---

# 9. Constantes

Constantes globais devem utilizar letras maiúsculas.

Exemplo:

```ts
const WAR_STATE_LABELS = {
```

Evitar:

```ts
const warStateLabels;
```

Também evitar números mágicos.

❌

```ts
1440;
```

✅

```ts
const MINUTES_PER_DAY = 1440;
```

---

# 10. Tratamento de Erros

Nunca confiar nos dados recebidos pela API.

Sempre validar:

- null
- undefined
- string vazia
- NaN
- objetos incompletos

Sempre apresentar mensagens amigáveis ao usuário.

Jamais permitir que erros internos sejam exibidos na interface.

---

# 11. Performance

Nunca repetir cálculos.

❌

```ts
getRemainingTime(war);
```

em vários locais.

✅

```ts
const remainingTime = getRemainingTime(war);
```

Sempre reutilizar valores calculados.

Evitar recriar objetos ou funções durante a renderização quando não houver necessidade.

---

# 12. Estilo JSX

Organizar os blocos visualmente.

Exemplo:

```tsx
return (
  <section>
    <Header />

    <Content />

    <Footer />
  </section>
);
```

Manter boa indentação.

Separar blocos com linhas em branco.

Priorizar legibilidade.

---

# 13. Versionamento

Todos os componentes devem possuir versão.

Padrão SemVer:

```text
MAJOR.MINOR.PATCH
```

Exemplos:

Nova funcionalidade:

```
1.1.0
```

Correção:

```
1.1.1
```

Mudança incompatível:

```
2.0.0
```

---

# 14. Checklist de Qualidade

Antes de concluir qualquer funcionalidade:

☐ Código comentado.

☐ Cabeçalho atualizado.

☐ Funções documentadas.

☐ Tipos documentados.

☐ Sem duplicação de lógica.

☐ Sem números mágicos.

☐ Tratamento de erros implementado.

☐ Build executado com sucesso.

☐ ESLint sem erros.

☐ CHANGELOG atualizado.

☐ Release Notes atualizadas.

☐ Código pronto para produção.

---

# Filosofia do Projeto

O Kings of Doom Command Center é um software de engenharia.

Todo código deve ser escrito pensando em:

- Clareza antes de complexidade.
- Legibilidade antes de otimização prematura.
- Reutilização antes de duplicação.
- Manutenção antes de velocidade.
- Robustez antes de conveniência.

Cada linha de código deve facilitar o trabalho do próximo desenvolvedor — mesmo que esse desenvolvedor seja você no futuro.

---

# Regra de Ouro

Antes de considerar uma tarefa concluída, pergunte:

> Este código seria fácil de entender por outro desenvolvedor daqui a um ano?

Se a resposta for "não", o código ainda pode ser melhorado.
