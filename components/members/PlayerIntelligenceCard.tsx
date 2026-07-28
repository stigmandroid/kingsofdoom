// ==========================================================
// Kings of Doom Command Center
// ----------------------------------------------------------
// Arquivo:
// PlayerIntelligenceCard.tsx
//
// Responsabilidade:
// Exibir o resumo da inteligência calculada para um jogador.
// ==========================================================

import type { PlayerIntelligenceResult } from "@/domain/player";

interface PlayerIntelligenceCardProps {
  intelligence: PlayerIntelligenceResult;
}

function getClassificationLabel(classification: string) {
  switch (classification) {
    case "elite":
      return "Elite";
    case "excellent":
      return "Excelente";
    case "good":
      return "Bom";
    case "developing":
      return "Em desenvolvimento";
    case "attention":
      return "Atenção";
    default:
      return "Dados insuficientes";
  }
}

export function PlayerIntelligenceCard({
  intelligence,
}: PlayerIntelligenceCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🧠 Player Intelligence</h3>

        <span className="text-sm text-slate-400">
          v{intelligence.algorithmVersion}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-4xl font-bold">
          {intelligence.overallScore ?? "--"}
        </p>

        <p className="text-sm text-slate-400">
          {getClassificationLabel(intelligence.classification)}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {intelligence.metrics.map((metric) => (
          <div key={metric.key} className="flex items-center justify-between">
            <span>{metric.label}</span>

            <span className="font-semibold">{metric.score ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
