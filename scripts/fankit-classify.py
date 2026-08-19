"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-classify.py

Responsabilidade:
Classificar automaticamente os assets baixados do Fan Kit
da Supercell em categorias úteis para o projeto.

O script:
• lê o manifest.json gerado pelo downloader;
• identifica padrões conhecidos nos títulos dos assets;
• copia os arquivos para pastas de classificação;
• preserva os downloads originais;
• envia itens não reconhecidos para "other";
• gera um relatório resumido por categoria.

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

import json
import shutil
from collections import Counter
from pathlib import Path
from typing import Any


# ==========================================================
# CONFIGURAÇÃO
# ==========================================================

SOURCE_DIRECTORY = Path(
    "downloads/fankit/icons"
)

MANIFEST_FILE = (
    SOURCE_DIRECTORY / "manifest.json"
)

OUTPUT_DIRECTORY = Path(
    "downloads/fankit/classified"
)


# ==========================================================
# CLASSIFICAÇÃO
# ==========================================================

def classify_asset(
    title: str,
) -> str:
    """
    Classifica um asset utilizando os padrões internos
    observados na nomenclatura do Fan Kit da Supercell.

    A estratégia é propositalmente conservadora.

    Quando o título não fornecer informação suficiente para
    identificar a categoria com segurança, o asset permanece
    em "other" para evitar classificações incorretas.
    """

    normalized = title.lower().strip()

    # ======================================================
    # PETS
    # ======================================================

    # O Fan Kit utiliza:
    #
    # Icon_HV_Hero_Pets_Unicorn
    # Icon_HV_Hero_Pets_LASSI
    # Icon_HV_Hero_Pets_Phoenix
    #
    # Também existe um asset genérico chamado apenas
    # Icon_HV_Hero_Pets.
    if "icon_hv_hero_pets" in normalized:
        return "pets"

    # ======================================================
    # EQUIPAMENTOS DE HERÓI
    # ======================================================

    # Exemplos encontrados:
    #
    # Hero_Equipment_BK_Spiky_Ball
    # icon_gear_GW_LavaloonPuppet
    if "hero_equipment_" in normalized:
        return "equipment"

    if "icon_gear_" in normalized:
        return "equipment"

    # ======================================================
    # HERÓIS DA VILA PRINCIPAL
    # ======================================================

    # Utilizamos títulos exatos para evitar que elementos como
    # Bow, Fist e outros recursos associados aos heróis sejam
    # classificados incorretamente como o próprio herói.
    home_village_heroes = {
        "icon_hv_hero_barbarian_king",
        "icon_hv_hero_archer_queen",
        "icon_hv_hero_grand_warden",
        "icon_hv_hero_royal_champion",
        "icon_hv_hero_minion_prince",
        "icon_hv_hero_dragon_duke",
    }

    if normalized in home_village_heroes:
        return "heroes"

    # ======================================================
    # FEITIÇOS
    # ======================================================

    if "icon_hv_spell_" in normalized:
        return "spells"

    if "icon_hv_dark_spell_" in normalized:
        return "spells"

    # ======================================================
    # MÁQUINAS DE CERCO
    # ======================================================

    if "icon_hv_siege_machine_" in normalized:
        return "siege-machines"

    # ======================================================
    # SUPERTROPAS
    # ======================================================

    if "icon_hv_super_" in normalized:
        return "troops"

    # ======================================================
    # TROPAS DA VILA PRINCIPAL
    # ======================================================

    troop_keywords = (
        "barbarian",
        "archer",
        "goblin",
        "giant",
        "wall_breaker",
        "balloon",
        "wizard",
        "healer",
        "dragon",
        "p.e.k.k.a",
        "minion",
        "hog_rider",
        "valkyrie",
        "golem",
        "witch",
        "lava_hound",
        "bowler",
        "baby_dragon",
        "miner",
        "yeti",
        "ice_golem",
        "electro_dragon",
        "dragon_rider",
        "headhunter",
        "electro_titan",
        "apprentice_warden",
        "root_rider",
        "druid",
        "thrower",
        "furnace",
        "meteor_golem",
        "sky_wagon",
    )

    if normalized.startswith("icon_hv_"):
        if any(
            keyword in normalized
            for keyword in troop_keywords
        ):
            return "troops"

    # ======================================================
    # BUILDER BASE
    # ======================================================

    if normalized.startswith("icon_bb_"):
        return "builder-base"

    # ======================================================
    # CAPITAL DO CLÃ
    # ======================================================

    if normalized.startswith("icon_cc_"):
        return "clan-capital"

    # ======================================================
    # OUTROS
    # ======================================================

    return "other"

# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Lê o manifesto, classifica cada asset e copia o arquivo
    correspondente para a pasta de destino.
    """

    if not MANIFEST_FILE.exists():
        raise FileNotFoundError(
            f"Manifesto não encontrado: "
            f"{MANIFEST_FILE.resolve()}"
        )

    manifest = json.loads(
        MANIFEST_FILE.read_text(
            encoding="utf-8",
        )
    )

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    counters: Counter[str] = Counter()

    missing_files: list[str] = []

    for asset in manifest:
        title = (
            asset.get("title")
            or ""
        )

        filename = (
            asset.get("filename")
            or ""
        )

        if not filename:
            continue

        category = classify_asset(
            title
        )

        source = (
            SOURCE_DIRECTORY / filename
        )

        destination_directory = (
            OUTPUT_DIRECTORY / category
        )

        destination_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        destination = (
            destination_directory / filename
        )

        if not source.exists():
            missing_files.append(
                filename
            )

            continue

        shutil.copy2(
            source,
            destination,
        )

        counters[category] += 1

    print()
    print("Classificação concluída.")
    print()

    for category, total in sorted(
        counters.items()
    ):
        print(
            f"{category:<18} {total}"
        )

    print()

    if missing_files:
        print(
            f"{len(missing_files)} arquivos "
            "não foram encontrados."
        )

    print(
        f"Destino: "
        f"{OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()