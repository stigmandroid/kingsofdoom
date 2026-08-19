"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-export-equipment.py

Responsabilidade:
Exportar para o projeto apenas os assets de equipamentos de
herói já validados na biblioteca consolidada do Fan Kit.

O script:
• utiliza um mapeamento explícito API -> arquivo do Fan Kit;
• copia somente um asset por equipamento;
• renomeia os arquivos para nomes consistentes;
• preserva os downloads originais;
• ignora equipamentos ainda sem asset confirmado.

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

import shutil
from pathlib import Path


# ==========================================================
# CONFIGURAÇÃO
# ==========================================================

SOURCE_DIRECTORY = Path(
    "downloads/fankit/equipment-merged"
)

OUTPUT_DIRECTORY = Path(
    "public/game-assets/equipment"
)

# ==========================================================
# MAPA DE EXPORTAÇÃO
# ==========================================================

EQUIPMENT_ASSETS = {
    "giant-gauntlet.png": "hero-equipment-bq-giant-gauntlet.png",
    "rocket-spear-v2.png": "herogear-royalchampion-rocketspear-equipment-03.png",
    "spiky-ball.png": "hero-equipment-bk-spiky-ball.png",
    "frozen-arrow.png": "hero-equipment-aq-frozen-arrow.png",
    "monolith-arrow.png": "hero-equipment-aq-monolitharrow.png",
    "heroic-torch.png": "herogear-gw-olympic-torch-hh0000.png",
    "fireball.png": "hero-equipment-gw-fireball.png",
    "snake-bracelet.png": "hero-equipment-bk-snakebracelet.png",
    "dark-crown.png": "herogear-mp-darkcrown-2k.png",
    "magic-mirror.png": "hero-equipment-aq-magic-mirror.png",
    "electro-boots.png": "hero-equipment-rc-electroboots.png",
    "lavaloon-puppet.png": "icon-gear-gw-lavaloonpuppet.png",
    "action-figure.png": "hero-equipment-aq-wweactionfigure.png",
    "meteor-staff.png": "herogear-mp-meteoritesceptre.png",
    "frost-flake.png": "hero-equipment-rc-frost-flake.png",
    "stick-horse.png": "herogear-bk-stickfirehorse.png",
    "rocket-backpack.png": "hg-dd-rocket-backpack.png",
    "barbarian-puppet.png": "hero-equipment-bk-barbarian-puppet.png",
    "rage-vial.png": "hero-equipment-bk-rage-vial.png",
    "archer-puppet.png": "hero-equipment-aq-archer-puppet.png",
    "invisibility-vial.png": "hero-equipment-aq-invisibility-vial.png",
    "eternal-tome.png": "hero-equipment-gw-eternal-tome.png",
    "life-gem.png": "hero-equipment-gw-life-gem.png",
    "seeking-shield.png": "hero-equipment-rc-seeking-shield.png",
    "royal-gem.png": "hero-equipment-rc-royal-gem.png",
    "earthquake-boots.png": "hero-equipment-bk-earthquake-boots.png",
    "hog-rider-puppet.png": "hero-equipment-rc-hog-rider-doll.png",
    "vampstache.png": "hero-equipment-bk-vampstache.png",
    "haste-vial.png": "hero-equipment-rc-haste-vial.png",
    "giant-arrow.png": "hero-equipment-aq-giant-arrow.png",
    "healer-puppet.png": "hero-equipment-aq-healer-puppet.png",
    "rage-gem.png": "hero-equipment-gw-rage-gem.png",
    "healing-tome.png": "hero-equipment-gw-healing-tome.png",
    "henchmen-puppet.png": "hero-equipment-mp-henchman.png",
    "dark-orb.png": "hero-equipment-mp-darkorb.png",
    "metal-pants.png": "heroequipment-mp-ironpants.png",
    "fire-heart.png": "hg-dd-fire-heart.png",
    "stun-blaster.png": "hg-dd-stunblast.png",
    "flame-blower.png": "hg-dd-flame-blower.png",
    "electro-fangs.png": "hg-dd-electro-fangs.png",
    "revenge-deck.png": "hg-dd-reverse-card.png",
}


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Exporta os assets já validados para a pasta pública do
    projeto.
    """

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    copied = 0
    missing = 0

    for destination_name, source_name in EQUIPMENT_ASSETS.items():
        source = SOURCE_DIRECTORY / source_name
        destination = OUTPUT_DIRECTORY / destination_name

        if not source.exists():
            print(
                f"[FALTA] {source_name}"
            )

            missing += 1
            continue

        shutil.copy2(
            source,
            destination,
        )

        print(
            f"[OK] {destination_name}"
        )

        copied += 1

    print()
    print("Exportação concluída.")
    print()
    print(
        f"{copied} equipamentos copiados."
    )
    print(
        f"{missing} arquivos não encontrados."
    )
    print(
        f"Destino: {OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()