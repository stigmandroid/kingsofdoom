/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/database.ts
 *
 * Responsabilidade:
 * Criar e disponibilizar a conexão persistente com o
 * banco SQLite utilizado pelo Command Center.
 *
 * O banco é compartilhado pelos módulos persistentes da
 * plataforma, incluindo:
 *
 * - Passe de Temporada da CWL;
 * - histórico completo da CWL;
 * - histórico das guerras normais.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 15/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

import { initializeDatabaseSchema } from "./schema";
import { initializeCwlArchiveSchema } from "./cwl-archive-schema";
import { initializeWarArchiveSchema } from "./war-archive-schema";

/**
 * Diretório persistente utilizado pelo banco.
 */
const dataDirectory = path.join(process.cwd(), "data");

/**
 * Caminho físico do banco SQLite.
 */
const databasePath = path.join(dataDirectory, "kings-of-doom.sqlite");

/**
 * Garante que o diretório exista.
 *
 * Isso também protege a aplicação caso a pasta data/
 * ainda não tenha sido criada em determinado ambiente.
 */
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, {
    recursive: true,
  });
}

/**
 * Abre a conexão com o banco.
 *
 * timeout:
 * aguarda temporariamente caso o banco esteja ocupado
 * por outra operação antes de retornar SQLITE_BUSY.
 */
const database = new DatabaseSync(databasePath, {
  timeout: 5_000,
});

/**
 * WAL melhora o comportamento do SQLite quando existem
 * leituras e gravações acontecendo simultaneamente.
 *
 * foreign_keys garante que os relacionamentos entre
 * tabelas respeitem integridade referencial.
 */
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Inicializa as estruturas gerais da aplicação.
 *
 * Atualmente inclui, entre outras responsabilidades,
 * a persistência utilizada pelo Passe de Temporada.
 */
initializeDatabaseSchema(database);

/**
 * Inicializa as estruturas responsáveis pelo histórico
 * completo das temporadas da CWL.
 */
initializeCwlArchiveSchema(database);

/**
 * Inicializa as estruturas responsáveis pelo histórico
 * persistente das guerras normais.
 *
 * Mantemos esse schema separado do CWL Archive porque os
 * ciclos de vida e identificadores das duas modalidades
 * são diferentes.
 */
initializeWarArchiveSchema(database);

/**
 * Exporta uma única instância para utilização
 * pelos repositories da aplicação.
 */
export { database };
