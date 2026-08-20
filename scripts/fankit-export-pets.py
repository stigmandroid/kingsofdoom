"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-export-pets.py

Responsabilidade:
Exportar para o projeto somente os assets validados dos
Pets retornados pela Player API.

O script:
• utiliza um mapeamento explícito API -> asset;
• copia um único asset por Pet;
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
    "public/game-assets/pets"
)


# ==========================================================
# MAPA DE EXPORTAÇÃO
# ==========================================================

PET_ASSETS = {
    "lassi.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-lassi.png"
        ),

    "mighty-yak.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-mighty-yak.png"
        ),

    "electro-owl.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-electro-owl.png"
        ),

    "unicorn.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-unicorn.png"
        ),

    "phoenix.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-phoenix.png"
        ),

    "poison-lizard.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-poison-lizard.png"
        ),

    "diggy.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-diggy.png"
        ),

    "frosty.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-frosty.png"
        ),

    "spirit-fox.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-spirit-fox.png"
        ),

    "sneezy.png":
        Path(
            "downloads/fankit/classified/pets/"
            "icon-hv-hero-pets-sneezy.png"
        ),

    "angry-jelly.png":
        Path(
            "downloads/fankit/angry-jelly/"
            "hero-pet-hv-angry-jelly-01.png"
        ),

    "greedy-raven.png":
        Path(
            "downloads/fankit/greedy-raven/"
            "pet-greedy-raven-1-grasspng.png"
        ),
}


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Exporta todos os assets selecionados dos Pets.
    """

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    copied = 0
    missing = 0

    for destination_name, source in PET_ASSETS.items():
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
        f"{copied} Pets copiados."
    )
    print(
        f"{missing} arquivos não encontrados."
    )
    print(
        f"Destino: {OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()