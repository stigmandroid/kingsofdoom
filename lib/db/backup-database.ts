/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * lib/db/backup-database.ts
 *
 * Responsabilidade:
 * Criar backups físicos consistentes do banco SQLite
 * utilizado pelo Kings of Doom Command Center.
 *
 * Objetivo:
 * Preservar snapshots restauráveis do histórico da CWL
 * e dos demais dados persistidos pela aplicação.
 *
 * Estratégia:
 *
 * - utilizar o mecanismo nativo de backup do node:sqlite;
 * - evitar cópia manual de arquivos enquanto WAL estiver ativo;
 * - gerar nomes únicos e rastreáveis;
 * - validar a integridade do banco copiado;
 * - permitir auditoria do conteúdo do backup.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 10/08/2026
 *
 * Versão:
 * 0.8.3
 *
 * Status:
 * 🚧 Em desenvolvimento
 * ==========================================================
 */

import fs from "node:fs";
import path from "node:path";

import { backup, DatabaseSync } from "node:sqlite";

import { database } from "@/lib/db/database";

/**
 * Diretório onde os backups físicos serão armazenados.
 */
const backupDirectory = path.join(process.cwd(), "backups");

/**
 * Resultado retornado após a criação do backup.
 */
export type DatabaseBackupResult = {
  /**
   * Caminho absoluto do arquivo criado.
   */
  path: string;

  /**
   * Nome físico do arquivo.
   */
  fileName: string;

  /**
   * Tamanho final do backup em bytes.
   */
  sizeBytes: number;

  /**
   * Quantidade de páginas copiadas pelo SQLite.
   */
  pagesTransferred: number;

  /**
   * Momento da criação do backup.
   */
  createdAt: string;

  /**
   * Resultado da validação interna.
   */
  validation: DatabaseBackupValidation;
};

/**
 * Resultado da auditoria básica do arquivo copiado.
 */
export type DatabaseBackupValidation = {
  valid: boolean;

  integrityCheck: string;

  seasons: number;
  clans: number;
  rounds: number;
  wars: number;
  members: number;
  attacks: number;
};

/**
 * Cria um backup completo do banco atual.
 *
 * Exemplo de nome:
 *
 * kings-of-doom-cwl-2026-08-03-2026-08-10T21-50-00.sqlite
 */
export async function createDatabaseBackup({
  season,
}: {
  season?: string;
} = {}): Promise<DatabaseBackupResult> {
  /**
   * Garante que o diretório exista.
   */
  if (!fs.existsSync(backupDirectory)) {
    fs.mkdirSync(backupDirectory, {
      recursive: true,
    });
  }

  const createdAt = new Date();

  const timestamp = formatTimestampForFileName(createdAt);

  /**
   * Sanitiza o identificador da temporada
   * antes de incorporá-lo ao nome do arquivo.
   */
  const seasonPart = season ? `-cwl-${sanitizeFileNamePart(season)}` : "";

  const fileName = `kings-of-doom${seasonPart}-${timestamp}.sqlite`;

  const backupPath = path.join(backupDirectory, fileName);

  /**
   * ========================================================
   * BACKUP NATIVO DO SQLITE
   * ========================================================
   *
   * Utilizamos a API oficial do node:sqlite.
   *
   * Isso é superior a copiar manualmente:
   *
   * kings-of-doom.sqlite
   *
   * porque o banco utiliza WAL e alterações recentes
   * podem ainda estar registradas no arquivo .sqlite-wal.
   */
  const pagesTransferred = await backup(database, backupPath, {
    /**
     * Copia em lotes de páginas.
     *
     * Para nosso banco atual, 100 páginas por etapa
     * é mais que suficiente e mantém a operação simples.
     */
    rate: 100,
  });

  /**
   * Confirma que o arquivo realmente foi criado.
   */
  if (!fs.existsSync(backupPath)) {
    throw new Error(
      `[Kings of Doom] O backup não foi encontrado após sua criação: ${backupPath}`,
    );
  }

  const statistics = fs.statSync(backupPath);

  /**
   * Um arquivo vazio nunca deve ser aceito
   * como backup válido.
   */
  if (statistics.size <= 0) {
    throw new Error(
      `[Kings of Doom] O backup criado está vazio: ${backupPath}`,
    );
  }

  /**
   * Abre a cópia isoladamente e valida seu conteúdo.
   */
  const validation = validateDatabaseBackup(backupPath);

  if (!validation.valid) {
    throw new Error(
      `[Kings of Doom] O backup foi criado, mas falhou na validação de integridade: ${backupPath}`,
    );
  }

  return {
    path: backupPath,

    fileName,

    sizeBytes: statistics.size,

    pagesTransferred,

    createdAt: createdAt.toISOString(),

    validation,
  };
}

/**
 * ==========================================================
 * VALIDAÇÃO
 * ==========================================================
 */

/**
 * Abre o arquivo de backup como um banco independente
 * e executa verificações básicas.
 *
 * Isso prova que o backup:
 *
 * - pode ser aberto;
 * - possui integridade SQLite;
 * - contém as tabelas históricas esperadas;
 * - preservou os dados arquivados.
 */
function validateDatabaseBackup(backupPath: string): DatabaseBackupValidation {
  const backupDatabase = new DatabaseSync(backupPath, {
    readOnly: true,
  });

  try {
    /**
     * PRAGMA integrity_check retorna "ok"
     * quando a estrutura SQLite está íntegra.
     */
    const integrityRow = backupDatabase
      .prepare(
        `
          PRAGMA integrity_check;
        `,
      )
      .get() as Record<string, string> | undefined;

    const integrityCheck = integrityRow
      ? (Object.values(integrityRow)[0] ?? "unknown")
      : "unknown";

    const seasons = getCount(
      backupDatabase,
      `
          SELECT COUNT(*) AS total
          FROM cwl_seasons
        `,
    );

    const clans = getCount(
      backupDatabase,
      `
          SELECT COUNT(*) AS total
          FROM cwl_season_clans
        `,
    );

    const rounds = getCount(
      backupDatabase,
      `
          SELECT COUNT(*) AS total
          FROM cwl_rounds
        `,
    );

    const wars = getCount(
      backupDatabase,
      `
          SELECT COUNT(*) AS total
          FROM cwl_wars
        `,
    );

    const members = getCount(
      backupDatabase,
      `
          SELECT COUNT(*) AS total
          FROM cwl_war_members
        `,
    );

    const attacks = getCount(
      backupDatabase,
      `
          SELECT COUNT(*) AS total
          FROM cwl_attacks
        `,
    );

    return {
      valid: integrityCheck === "ok",

      integrityCheck,

      seasons,
      clans,
      rounds,
      wars,
      members,
      attacks,
    };
  } finally {
    /**
     * O backup é aberto somente para auditoria.
     *
     * Sempre fechamos essa conexão isolada ao final.
     */
    backupDatabase.close();
  }
}

/**
 * Executa uma contagem simples em um banco
 * SQLite já aberto.
 */
function getCount(databaseConnection: DatabaseSync, sql: string): number {
  const row = databaseConnection.prepare(sql).get() as
    | {
        total: number;
      }
    | undefined;

  return row?.total ?? 0;
}

/**
 * ==========================================================
 * NOMES DE ARQUIVO
 * ==========================================================
 */

/**
 * Converte a data em um formato adequado
 * para nomes de arquivo.
 *
 * Exemplo:
 *
 * 2026-08-10T21-50-30
 */
function formatTimestampForFileName(date: Date): string {
  return date
    .toISOString()
    .replace(/\.\d{3}Z$/, "")
    .replace(/:/g, "-");
}

/**
 * Remove caracteres inadequados para nomes
 * de arquivos.
 */
function sanitizeFileNamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-");
}
