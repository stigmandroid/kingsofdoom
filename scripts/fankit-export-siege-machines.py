"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-export-siege-machines.py

Responsabilidade:
Exportar para o projeto somente os assets validados das
Máquinas de Cerco retornadas pela Player API.

O script:
• utiliza um mapeamento explícito API -> asset;
• copia um único asset por máquina;
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
    "public/game-assets/siege-machines"
)


# ==========================================================
# MAPA DE EXPORTAÇÃO
# ==========================================================

SIEGE_MACHINE_ASSETS = {
    "wall-wrecker.png":
        Path(
            "downloads/fankit/classified/siege-machines/"
            "icon-hv-siege-machine-wall-wrecker.png"
        ),

    "battle-blimp.png":
        Path(
            "downloads/fankit/classified/siege-machines/"
            "icon-hv-siege-machine-battle-blimp.png"
        ),

    "stone-slammer.png":
        Path(
            "downloads/fankit/stone-slammer/"
            "stoneslammer-lvl6.png"
        ),

    "siege-barracks.png":
        Path(
            "downloads/fankit/classified/siege-machines/"
            "icon-hv-siege-machine-siege-barracks.png"
        ),

    "log-launcher.png":
        Path(
            "downloads/fankit/classified/siege-machines/"
            "icon-hv-siege-machine-log-launcher.png"
        ),

    "flame-flinger.png":
        Path(
            "downloads/fankit/classified/siege-machines/"
            "icon-hv-siege-machine-flame-flinger.png"
        ),

    "battle-drill.png":
        Path(
            "downloads/fankit/classified/siege-machines/"
            "icon-hv-siege-machine-battle-drill.png"
        ),

    "troop-launcher.png":
        Path(
            "downloads/fankit/troop-launcher/"
            "icon-troop-launcher.png"
        ),

    "sky-wagon.png":
        Path(
            "downloads/fankit/sky-wagon/"
            "siege-machine-sky-wagon-01.png"
        ),
}


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Exporta todos os assets validados das Máquinas de Cerco.
    """

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    copied = 0
    missing = 0

    for destination_name, source in SIEGE_MACHINE_ASSETS.items():
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
        f"{copied} máquinas copiadas."
    )
    print(
        f"{missing} arquivos não encontrados."
    )
    print(
        f"Destino: {OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()