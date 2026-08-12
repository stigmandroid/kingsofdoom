/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/api/admin/database-backup/route.ts
 *
 * Responsabilidade:
 * Executar manualmente um backup físico validado
 * do banco SQLite da aplicação.
 *
 * Objetivo:
 * Criar uma cópia restaurável do banco histórico
 * e retornar imediatamente o resultado da auditoria.
 *
 * Segurança:
 * Esta rota é temporária e deve ser protegida
 * antes de permanecer disponível em produção.
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

import { NextResponse } from "next/server";

import { createDatabaseBackup } from "@/lib/db/backup-database";

/**
 * POST /api/admin/database-backup?season=2026-08-03
 *
 * Cria um backup físico completo do banco atual.
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    const season = url.searchParams.get("season") ?? undefined;

    const backup = await createDatabaseBackup({
      season,
    });

    return NextResponse.json({
      success: true,
      backup,
    });
  } catch (error) {
    console.error("[Kings of Doom] Erro ao criar backup do banco:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Não foi possível criar e validar o backup do banco.",
      },
      {
        status: 500,
      },
    );
  }
}
