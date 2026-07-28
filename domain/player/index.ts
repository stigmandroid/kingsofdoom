// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// index.ts
//
// Localização:
// domain/player/index.ts
//
// Responsabilidade:
// Centralizar as exportações públicas do domínio Player.
//
// Funcionalidades:
//
// - Simplificar imports.
// - Definir a interface pública do módulo.
// - Evitar imports profundos.
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

export type { PlayerProfile } from "./PlayerProfile";

export type {
  PlayerIntelligenceClassification,
  PlayerIntelligenceMetric,
  PlayerIntelligenceResult,
  PlayerMetricStatus,
} from "./PlayerIntelligence";
