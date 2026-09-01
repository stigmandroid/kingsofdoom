/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * scripts/test-ranked-endpoints.mjs
 *
 * Responsabilidade:
 * Investigar possíveis endpoints públicos relacionados ao
 * sistema Ranked / Liga de Troféus utilizando um League
 * Group Tag real retornado pela Player API.
 *
 * O script:
 *
 * • não altera banco;
 * • não altera dados do projeto;
 * • não grava snapshots;
 * • apenas executa requisições GET de diagnóstico.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 22/08/2026
 *
 * Versão:
 * 0.9.0
 *
 * Status:
 * 🧪 Diagnóstico
 * ==========================================================
 */

import fs from "node:fs";

/**
 * ==========================================================
 * CONFIGURAÇÃO
 * ==========================================================
 */

const CLASH_API_BASE_URL = "https://api.clashofclans.com/v1";

/**
 * Group Tag real obtido do HELVIS SOBRINHO.
 */
const leagueGroupTag = "#8LVL90Q";

/**
 * ==========================================================
 * TOKEN
 * ==========================================================
 *
 * Lê o CLASH_API_TOKEN diretamente do .env.local sem
 * imprimir seu conteúdo no terminal.
 */

const envContent = fs.readFileSync(".env.local", "utf8");

const tokenLine = envContent
  .split(/\r?\n/)
  .find((line) => line.startsWith("CLASH_API_TOKEN="));

if (!tokenLine) {
  throw new Error("CLASH_API_TOKEN não encontrado no .env.local.");
}

const token = tokenLine
  .slice("CLASH_API_TOKEN=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

const encodedTag = encodeURIComponent(leagueGroupTag);

/**
 * ==========================================================
 * ENDPOINTS CANDIDATOS
 * ==========================================================
 *
 * Não assumimos que essas rotas existam.
 *
 * São testadas exclusivamente para descobrir se a API
 * pública oferece algum recurso relacionado ao Group Tag
 * retornado no objeto Player.
 */

const candidates = [
  `/leaguegroups/${encodedTag}`,
  `/leaguegroup/${encodedTag}`,

  `/ranked/leaguegroups/${encodedTag}`,
  `/ranked/leaguegroup/${encodedTag}`,

  `/leagues/groups/${encodedTag}`,

  `/players/leaguegroups/${encodedTag}`,

  `/ranked/groups/${encodedTag}`,
];

/**
 * ==========================================================
 * TESTE
 * ==========================================================
 */

async function testEndpoint(path) {
  const url = `${CLASH_API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "application/json",
      },
    });

    const text = await response.text();

    let body = text;

    try {
      body = JSON.parse(text);
    } catch {
      // Mantém resposta textual.
    }

    console.log("");
    console.log("------------------------------------------------------------");

    console.log("Endpoint:", path);

    console.log("Status:", response.status, response.statusText);

    console.log("Resposta:", body);
  } catch (error) {
    console.error("Erro ao consultar:", path, error);
  }
}

/**
 * ==========================================================
 * EXECUÇÃO
 * ==========================================================
 */

console.log("Testando possíveis endpoints Ranked...");

console.log("League Group Tag:", leagueGroupTag);

for (const candidate of candidates) {
  await testEndpoint(candidate);
}
