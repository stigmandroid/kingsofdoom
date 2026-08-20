"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-export-spells.py

Responsabilidade:
Exportar para o projeto somente os assets validados dos
feitiços da Vila Principal.

O script:
• utiliza um mapeamento explícito API -> asset;
• evita versões antigas quando existir asset mais recente;
• copia um único asset por feitiço;
• renomeia os arquivos para nomes consistentes;
• preserva os downloads originais.

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

import shutil
from pathlib import Path


# ==========================================================
# DESTINO
# ==========================================================

OUTPUT_DIRECTORY = Path(
    "public/game-assets/spells"
)


# ==========================================================
# MAPA DE EXPORTAÇÃO
# ==========================================================

SPELL_ASSETS = {
    "lightning-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-lightning-new.png"
        ),

    "healing-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-heal.png"
        ),

    "rage-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-rage.png"
        ),

    "jump-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-jump.png"
        ),

    "freeze-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-freeze-new.png"
        ),

    "poison-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-poison.png"
        ),

    "earthquake-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-earthquake.png"
        ),

    "haste-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-haste.png"
        ),

    "clone-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-clone.png"
        ),

    "skeleton-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-skeleton.png"
        ),

    "bat-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-bat.png"
        ),

    "invisibility-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-invisibility.png"
        ),

    "recall-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-recall.png"
        ),

    "overgrowth-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-overgrowth.png"
        ),

    "revive-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-revive.png"
        ),

    "ice-block-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-dark-spell-ice-block.png"
        ),

    "totem-spell.png":
        Path(
            "downloads/fankit/classified/spells/"
            "icon-hv-spell-totem.png"
        ),

    "angry-spell.png":
        Path(
            "downloads/fankit/angry-spell/"
            "icon-angry-spell.png"
        ),
}


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Exporta todos os assets validados de feitiços.
    """

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    copied = 0
    missing = 0

    for destination_name, source in SPELL_ASSETS.items():
        destination = (
            OUTPUT_DIRECTORY /
            destination_name
        )

        if not source.exists():
            print(
                f"[FALTA] {source}"
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
        f"{copied} feitiços copiados."
    )
    print(
        f"{missing} arquivos não encontrados."
    )
    print(
        f"Destino: {OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()