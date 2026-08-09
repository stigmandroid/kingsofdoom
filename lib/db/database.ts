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
 * O banco será utilizado inicialmente para persistir
 * os eventos do sorteio do Passe de Temporada da CWL.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 08/08/2026
 *
 * Versão:
 * 0.8.0
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { initializeDatabaseSchema } from "./schema";

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
 * foreign_keys garante que relacionamentos futuros
 * respeitem integridade referencial.
 */
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

/**
 * Garante que todas as tabelas necessárias existam
 * antes que repositories tentem utilizar o banco.
 */
initializeDatabaseSchema(database);

/**
 * Exporta uma única instância para utilização
 * pelos repositories da aplicação.
 */
export { database };
