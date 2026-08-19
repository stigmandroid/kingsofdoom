"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-match-equipment.py

Responsabilidade:
Comparar os equipamentos retornados pela Clash of Clans API
com os assets encontrados automaticamente no Fan Kit da
Supercell.

O script:
• utiliza a lista real de equipamentos conhecida pela API;
• normaliza os nomes;
• procura correspondências nos arquivos consolidados;
• identifica equipamentos encontrados;
• identifica equipamentos ainda sem asset correspondente;
• gera um relatório para revisão manual.

Autor:
stigmandroid

Última atualização:
18/08/2026

Versão:
0.8.8

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

EQUIPMENT_DIRECTORY = Path(
    "downloads/fankit/equipment-merged"
)

REPORT_FILE = Path(
    "downloads/fankit/equipment-match-report.txt"
)


# ==========================================================
# EQUIPAMENTOS RETORNADOS PELA PLAYER API
# ==========================================================

API_EQUIPMENT = [
    "Giant Gauntlet",
    "Rocket Spear",
    "Spiky Ball",
    "Frozen Arrow",
    "Monolith Arrow",
    "Heroic Torch",
    "Fireball",
    "Snake Bracelet",
    "Dark Crown",
    "Magic Mirror",
    "Electro Boots",
    "Lavaloon Puppet",
    "Action Figure",
    "Meteor Staff",
    "Frost Flake",
    "Stick Horse",
    "Rocket Backpack",
    "Barbarian Puppet",
    "Rage Vial",
    "Archer Puppet",
    "Invisibility Vial",
    "Eternal Tome",
    "Life Gem",
    "Seeking Shield",
    "Royal Gem",
    "Earthquake Boots",
    "Hog Rider Puppet",
    "Vampstache",
    "Haste Vial",
    "Giant Arrow",
    "Healer Puppet",
    "Rage Gem",
    "Healing Tome",
    "Henchmen Puppet",
    "Dark Orb",
    "Metal Pants",
    "Noble Iron",
    "Fire Heart",
    "Stun Blaster",
    "Flame Blower",
    "Electro Fangs",
]


# ==========================================================
# ALIASES
# ==========================================================

ALIASES = {
    "giantgauntlet": (
        "giant-gauntlet",
        "giant-gauntlet",
        "bq-giant-gauntlet",
    ),

    "monolitharrow": (
        "monolitharrow",
        "monolith-arrow",
    ),

    "actionfigure": (
        "actionfigure",
        "wweactionfigure",
        "action-figure",
    ),

    "snakebracelet": (
        "snakebracelet",
        "snake-bracelet",
    ),

    "electroboots": (
        "electroboots",
        "electro-boots",
    ),

    "lavaloondpuppet": (
        "lavaloondoll",
        "lavaloonpuppet",
        "lavaloon-puppet",
    ),

    "meteorstaff": (
        "meteoritesceptre",
        "meteor-staff",
        "meteorstaff",
    ),

    "stickhorse": (
        "stickfirehorse",
        "stick-horse",
        "stickhorse",
    ),

    "hogriderpuppet": (
        "hog-rider-doll",
        "hog-rider-puppet",
        "hogriderdoll",
    ),

    "nobleiron": (
    "noble-iron",
    "nobleiron",
    ),

    "henchmenpuppet": (
        "henchman",
        "henchmen-puppet",
    ),

    "darkorb": (
        "darkorb",
        "dark-orb",
    ),

    "metalpants": (
        "ironpants",
        "metal-pants",
    ),

    "heroictorch": (
        "olympic-torch",
        "heroic-torch",
    ),

    "rocketspear": (
        "rocketspear",
        "rocket-spear",
    ),

    "stunblaster": (
        "stunblast",
        "stun-blaster",
    ),

    "flameblower": (
        "flame-blower",
        "flameblower",
    ),

    "electrofangs": (
        "electro-fangs",
        "electrofangs",
    ),

    "rocketbackpack": (
        "rocket-backpack",
        "rocketbackpack",
    ),
}


# ==========================================================
# NORMALIZAÇÃO
# ==========================================================

def normalize(value: str) -> str:
    """
    Remove pontuação, espaços e diferenças de caixa para
    facilitar a comparação entre API e nomes de arquivos.
    """

    return re.sub(
        r"[^a-z0-9]",
        "",
        value.lower(),
    )


def filename_matches(
    equipment_name: str,
    filename: str,
) -> bool:
    """
    Verifica se o nome do equipamento corresponde ao nome do
    arquivo ou a algum alias conhecido.
    """

    normalized_equipment = normalize(
        equipment_name
    )

    normalized_filename = normalize(
        filename
    )

    if normalized_equipment in normalized_filename:
        return True

    aliases = ALIASES.get(
        normalized_equipment,
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
    Compara todos os equipamentos da API com os arquivos
    disponíveis localmente.
    """

    files = [
        path
        for path in EQUIPMENT_DIRECTORY.iterdir()
        if path.is_file()
    ]

    lines: list[str] = []

    found_count = 0
    missing_count = 0

    for equipment in API_EQUIPMENT:
        matches = [
            path.name
            for path in files
            if filename_matches(
                equipment,
                path.name,
            )
        ]

        if matches:
            found_count += 1

            lines.append(
                f"[OK] {equipment}"
            )

            for match in matches:
                lines.append(
                    f"     -> {match}"
                )
        else:
            missing_count += 1

            lines.append(
                f"[FALTA] {equipment}"
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