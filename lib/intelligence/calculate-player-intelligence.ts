// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// calculate-player-intelligence.ts
//
// Localização:
// lib/intelligence/calculate-player-intelligence.ts
//
// Responsabilidade:
// Calcular a pontuação de inteligência de um jogador
// utilizando dados disponíveis na Clash API.
//
// Funcionalidades:
//
// - Calcular métricas disponíveis.
// - Identificar métricas indisponíveis.
// - Gerar classificação geral.
// - Produzir resultado padronizado.
//
// Autor:
// stigmandroid
//
// Última atualização:
// 27/07/2026
//
// Versão:
// 0.1.0
//
// Status:
// 🧪 Experimental
// ==========================================================

import {
  PlayerIntelligenceClassification,
  PlayerIntelligenceMetric,
  PlayerIntelligenceResult,
} from "@/domain/player/PlayerIntelligence";

import { ClanMember } from "@/types/clan";
import type { PlayerProfile } from "@/domain/player/PlayerProfile";
/**
 * Calcula uma nota de 0 a 100 para a quantidade
 * de doações realizadas pelo jogador.
 */
function calculateDonationScore(donations: number): number {
  return Math.min(100, Math.round((donations / 5000) * 100));
}

/**
 * Calcula uma nota baseada na quantidade de tropas recebidas.
 *
 * Quanto menor a diferença entre doações e recebimentos,
 * melhor a pontuação.
 */
function calculateDonationBalance(donations: number, received: number): number {
  if (received === 0) return 100;

  const ratio = donations / received;

  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

/**
 * Traduz uma pontuação em uma classificação.
 */
function classify(score: number): PlayerIntelligenceClassification {
  if (score >= 90) return "elite";
  if (score >= 80) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "developing";
  return "attention";
}

/**
 * Gera a primeira versão do Player Intelligence.
 */
export function calculatePlayerIntelligence(
  player: PlayerProfile,
): PlayerIntelligenceResult {
  const metrics: PlayerIntelligenceMetric[] = [];

  // -----------------------------
  // Doações
  // -----------------------------

  const donationScore = calculateDonationScore(player.donations);

  metrics.push({
    key: "donations",
    label: "Doações",
    score: donationScore,
    status: "available",
    description:
      "Pontuação calculada com base na quantidade de tropas doadas na temporada.",
  });

  // -----------------------------
  // Equilíbrio de doações
  // -----------------------------

  const balanceScore = calculateDonationBalance(
    player.donations,
    player.donationsReceived,
  );

  metrics.push({
    key: "donation-balance",
    label: "Equilíbrio de Doações",
    score: balanceScore,
    status: "available",
    description: "Compara tropas doadas e recebidas durante a temporada.",
  });

  // -----------------------------
  // Atividade
  // -----------------------------

  metrics.push({
    key: "activity",
    label: "Atividade",
    score: null,
    status: "insufficient-data",
    description:
      "Será calculada futuramente utilizando histórico de participação.",
  });

  // -----------------------------
  // Consistência
  // -----------------------------

  metrics.push({
    key: "consistency",
    label: "Consistência",
    score: null,
    status: "insufficient-data",
    description: "Depende do histórico de guerras e ataques.",
  });

  // -----------------------------
  // Participação
  // -----------------------------

  metrics.push({
    key: "participation",
    label: "Participação",
    score: null,
    status: "insufficient-data",
    description: "Será calculada com base na presença em guerras e eventos.",
  });

  // Apenas métricas disponíveis entram no cálculo geral
  const validMetrics = metrics.filter((metric) => metric.score !== null);

  const overallScore =
    validMetrics.length > 0
      ? Math.round(
          validMetrics.reduce((sum, metric) => sum + (metric.score ?? 0), 0) /
            validMetrics.length,
        )
      : null;

  return {
    playerTag: player.tag,
    playerName: player.name,
    overallScore,
    classification:
      overallScore === null ? "insufficient-data" : classify(overallScore),
    metrics,
    calculatedAt: new Date().toISOString(),
    algorithmVersion: "0.1.0",
  };
}
