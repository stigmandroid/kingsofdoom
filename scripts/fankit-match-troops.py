"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-match-troops.py

Responsabilidade:
Comparar as tropas retornadas pela Clash of Clans API com os
assets classificados do Fan Kit da Supercell.

O script:
• utiliza a lista de tropas da Vila Principal;
• normaliza os nomes;
• procura correspondências nos arquivos classificados;
• identifica tropas encontradas;
• identifica tropas ainda sem asset;
• gera um relatório de validação.

Autor:
stigmandroid

Última atualização:
19/08/2026

Versão:
0.8.9

Status:
🧰 Ferramenta interna
==========================================================
"""

from __future__ import annotations

import re
from pathlib import Path


# ==========================================================
# CONFIGURAÇÃO
# ==========================================================

TROOPS_DIRECTORY = Path(
    "downloads/fankit/classified/troops"
)

REPORT_FILE = Path(
    "downloads/fankit/troop-match-report.txt"
)


# ==========================================================
# TROPAS DA VILA PRINCIPAL
# ==========================================================

API_TROOPS = [
    "Barbarian",
    "Archer",
    "Goblin",
    "Giant",
    "Wall Breaker",
    "Balloon",
    "Wizard",
    "Healer",
    "Dragon",
    "P.E.K.K.A",
    "Minion",
    "Hog Rider",
    "Valkyrie",
    "Golem",
    "Witch",
    "Lava Hound",
    "Bowler",
    "Baby Dragon",
    "Miner",
    "Yeti",
    "Ice Golem",
    "Electro Dragon",
    "Dragon Rider",
    "Headhunter",
    "Electro Titan",
    "Apprentice Warden",
    "Root Rider",
    "Druid",
    "Thrower",
    "Furnace",
    "Meteor Golem",
    "Sky Wagon",
    "Ruin Witch",
]


# ==========================================================
# ALIASES
# ==========================================================

ALIASES = {
    "pekka": (
        "p-e-k-k-a",
        "pekka",
    ),

    "wallbreaker": (
        "wall-breaker",
        "wallbreaker",
    ),

    "hogrider": (
        "hog-rider",
        "hogrider",
    ),

    "lavahound": (
        "lava-hound",
        "lavahound",
    ),

    "babydragon": (
        "baby-dragon",
        "babydragon",
    ),

    "icegolem": (
        "ice-golem",
        "icegolem",
    ),

    "electrodragon": (
        "electro-dragon",
        "electrodragon",
    ),

    "dragonrider": (
        "dragon-rider",
        "dragonrider",
    ),

    "electrotitan": (
        "electro-titan",
        "electrotitan",
    ),

    "apprenticewarden": (
        "apprentice-warden",
        "apprenticewarden",
    ),

    "rootrider": (
        "root-rider",
        "rootrider",
    ),

    "meteorgolem": (
        "meteor-golem",
        "meteorgolem",
    ),

    "skywagon": (
        "sky-wagon",
        "skywagon",
    ),

    "ruinwitch": (
        "ruin-witch",
        "ruinwitch",
    ),
}


# ==========================================================
# NORMALIZAÇÃO
# ==========================================================

def normalize(value: str) -> str:
    """
    Remove caracteres especiais para facilitar a comparação.
    """

    return re.sub(
        r"[^a-z0-9]",
        "",
        value.lower(),
    )


def filename_matches(
    troop_name: str,
    filename: str,
) -> bool:
    """
    Verifica se o asset corresponde à tropa informada.
    """

    normalized_troop = normalize(
        troop_name
    )

    normalized_filename = normalize(
        filename
    )

    if normalized_troop in normalized_filename:
        return True

    aliases = ALIASES.get(
        normalized_troop,
        (),
    )

    return any(
        normalize(alias) in normalized_filename
        for alias in aliases
    )


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Executa o cruzamento entre tropas e assets.
    """

    files = [
        path
        for path in TROOPS_DIRECTORY.iterdir()
        if path.is_file()
    ]

    lines: list[str] = []

    found_count = 0
    missing_count = 0

    for troop in API_TROOPS:
        matches = [
            path.name
            for path in files
            if filename_matches(
                troop,
                path.name,
            )
        ]

        if matches:
            found_count += 1

            lines.append(
                f"[OK] {troop}"
            )

            for match in matches:
                lines.append(
                    f"     -> {match}"
                )
        else:
            missing_count += 1

            lines.append(
                f"[FALTA] {troop}"
            )

        lines.append("")

    lines.append(
        "=" * 60
    )

    lines.append(
        f"Encontrados: {found_count}"
    )

    lines.append(
        f"Faltando: {missing_count}"
    )

    REPORT_FILE.write_text(
        "\n".join(lines),
        encoding="utf-8",
    )

    print(
        "\n".join(lines)
    )

    print()
    print(
        f"Relatório salvo em: "
        f"{REPORT_FILE.resolve()}"
    )


if __name__ == "__main__":
    main()