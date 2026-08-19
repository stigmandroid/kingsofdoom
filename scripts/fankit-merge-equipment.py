"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-merge-equipment.py

Responsabilidade:
Unificar os assets encontrados nas buscas "equipment" e
"gear" do Fan Kit da Supercell em uma biblioteca única de
equipamentos de herói.

O script:
• lê as duas pastas de download;
• ignora os manifestos;
• copia os assets para uma pasta consolidada;
• evita duplicados por nome;
• preserva os arquivos originais;
• gera um resumo da consolidação.

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

SOURCE_DIRECTORIES = (
    Path("downloads/fankit/equipment"),
    Path("downloads/fankit/gear"),
)

OUTPUT_DIRECTORY = Path(
    "downloads/fankit/equipment-merged"
)

IGNORED_FILENAMES = {
    "manifest.json",
}


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Consolida os assets encontrados nas duas pesquisas.
    """

    OUTPUT_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True,
    )

    copied = 0
    skipped = 0

    for source_directory in SOURCE_DIRECTORIES:
        if not source_directory.exists():
            print(
                f"[AVISO] Pasta não encontrada: "
                f"{source_directory}"
            )

            continue

        for source in source_directory.iterdir():
            if not source.is_file():
                continue

            if source.name in IGNORED_FILENAMES:
                continue

            destination = (
                OUTPUT_DIRECTORY /
                source.name
            )

            if destination.exists():
                skipped += 1

                print(
                    f"[SKIP] {source.name}"
                )

                continue

            shutil.copy2(
                source,
                destination,
            )

            copied += 1

            print(
                f"[OK]   {source.name}"
            )

    print()
    print("Consolidação concluída.")
    print()
    print(
        f"{copied} arquivos copiados."
    )
    print(
        f"{skipped} duplicados ignorados."
    )
    print(
        f"Destino: "
        f"{OUTPUT_DIRECTORY.resolve()}"
    )


if __name__ == "__main__":
    main()