"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-export-troops.py

Responsabilidade:
Exportar para o projeto somente os assets validados das
tropas da Vila Principal.

O script:
• utiliza um mapeamento explícito API -> asset;
• evita falsos positivos de nomes parecidos;
• copia um único asset por tropa;
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
    "public/game-assets/troops"
)


# ==========================================================
# MAPA DE EXPORTAÇÃO
# ==========================================================

TROOP_ASSETS = {
    "barbarian.png":
        Path("downloads/fankit/classified/troops/icon-hv-barbarian.png"),

    "archer.png":
        Path("downloads/fankit/classified/troops/icon-hv-archer.png"),

    "goblin.png":
        Path("downloads/fankit/classified/troops/icon-hv-goblin.png"),

    "giant.png":
        Path("downloads/fankit/classified/troops/icon-hv-giant.png"),

    "wall-breaker.png":
        Path("downloads/fankit/classified/troops/icon-hv-wall-breaker.png"),

    "balloon.png":
        Path("downloads/fankit/classified/troops/icon-hv-balloon.png"),

    "wizard.png":
        Path("downloads/fankit/classified/troops/icon-hv-wizard.png"),

    "healer.png":
        Path("downloads/fankit/classified/troops/icon-hv-healer.png"),

    "dragon.png":
        Path("downloads/fankit/classified/troops/icon-hv-dragon.png"),

    "pekka.png":
        Path("downloads/fankit/classified/troops/icon-hv-p-e-k-k-a.png"),

    "minion.png":
        Path("downloads/fankit/classified/troops/icon-hv-minion.png"),

    "hog-rider.png":
        Path("downloads/fankit/classified/troops/icon-hv-hog-rider.png"),

    "valkyrie.png":
        Path("downloads/fankit/classified/troops/icon-hv-valkyrie.png"),

    "golem.png":
        Path("downloads/fankit/classified/troops/icon-hv-golem.png"),

    "witch.png":
        Path("downloads/fankit/classified/troops/icon-hv-witch.png"),

    "lava-hound.png":
        Path("downloads/fankit/classified/troops/icon-hv-lava-hound.png"),

    "bowler.png":
        Path("downloads/fankit/classified/troops/icon-hv-bowler.png"),

    "baby-dragon.png":
        Path("downloads/fankit/classified/troops/icon-hv-baby-dragon.png"),

    "miner.png":
        Path("downloads/fankit/classified/troops/icon-hv-miner.png"),

    "yeti.png":
        Path("downloads/fankit/classified/troops/icon-hv-yeti.png"),

    "ice-golem.png":
        Path("downloads/fankit/classified/troops/icon-hv-ice-golem.png"),

    "electro-dragon.png":
        Path("downloads/fankit/classified/troops/icon-hv-electro-dragon.png"),

    "dragon-rider.png":
        Path("downloads/fankit/classified/troops/icon-hv-dragon-rider.png"),

    "headhunter.png":
        Path("downloads/fankit/classified/troops/icon-hv-headhunter.png"),

    "electro-titan.png":
        Path("downloads/fankit/classified/troops/icon-hv-electro-titan.png"),

    "apprentice-warden.png":
        Path("downloads/fankit/classified/troops/icon-hv-apprentice-warden.png"),

    "root-rider.png":
        Path("downloads/fankit/classified/troops/icon-hv-root-rider.png"),

    "druid.png":
        Path("downloads/fankit/druid/troop-hv-druid-lvl6.png"),

    "thrower.png":
        Path("downloads/fankit/thrower/thrower-lvl-4.png"),

    "furnace.png":
        Path("downloads/fankit/classified/troops/icon-hv-furnace.png"),

    "meteor-golem.png":
        Path(
            "downloads/fankit/meteor-golem/"
            "meteoritegolem-withgrassbase-f61-3k.png"
        ),

    "ruin-witch.png":
        Path(
            "downloads/fankit/ruin-witch/"
            "ruinwitch-infoscreen-4k.png"
        ),
}


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Exporta todos os assets validados de tropas.
    """

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    copied = 0
    missing = 0

    for destination_name, source in TROOP_ASSETS.items():
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
        f"{copied} tropas copiadas."
    )
    print(
        f"{missing} arquivos não encontrados."
    )
    print(
        f"Destino: {OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()