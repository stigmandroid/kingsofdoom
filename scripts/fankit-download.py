"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-download.py

Responsabilidade:
Consultar a busca pública de assets do Fan Kit da Supercell
e baixar automaticamente os arquivos retornados.

O termo de busca é informado pelo terminal.

Exemplos:

python scripts/fankit-download.py icon
python scripts/fankit-download.py equipment
python scripts/fankit-download.py gear

Fluxo:
• recebe o termo de busca;
• consulta todas as páginas disponíveis;
• respeita o campo `hasMore`;
• considera somente assets disponíveis;
• utiliza os metadados retornados pelo Fan Kit;
• evita downloads duplicados;
• normaliza os nomes dos arquivos;
• gera um manifesto por pesquisa.

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
import re
import sys
import time
from pathlib import Path
from typing import Any

import requests


# ==========================================================
# CONFIGURAÇÃO
# ==========================================================

BASE_URL = (
    "https://fankit.supercell.com/"
    "api/assets/search/338"
)

PAGE_LIMIT = 25

REQUEST_TIMEOUT = 60

REQUEST_DELAY_SECONDS = 0.25


# ==========================================================
# UTILITÁRIOS
# ==========================================================

def normalize_search_term(
    value: str,
) -> str:
    """
    Normaliza o termo utilizado no nome da pasta local.

    Exemplo:

    Hero Equipment
    ↓
    hero-equipment
    """

    normalized = value.strip().lower()

    normalized = re.sub(
        r"[^a-z0-9]+",
        "-",
        normalized,
    )

    return normalized.strip("-")


def normalize_filename(
    title: str,
    extension: str,
) -> str:
    """
    Converte o título retornado pelo Fan Kit em um nome
    de arquivo previsível e seguro.

    Exemplo:

    Hero_Equipment_BK_Spiky_Ball
    ↓
    hero-equipment-bk-spiky-ball.png
    """

    normalized = title.strip().lower()

    normalized = re.sub(
        r"[^a-z0-9]+",
        "-",
        normalized,
    )

    normalized = normalized.strip("-")

    return f"{normalized}.{extension.lower()}"


def build_asset_url(
    asset: dict[str, Any],
) -> str | None:
    """
    Constrói a URL utilizada para baixar o asset.

    O Fan Kit retorna `generic_url` com:

    ?width={width}

    O placeholder é substituído pela largura nativa
    informada no próprio metadata.
    """

    generic_url = asset.get(
        "generic_url"
    )

    if not generic_url:
        return None

    width = asset.get(
        "width"
    )

    if width:
        return generic_url.replace(
            "{width}",
            str(width),
        )

    return generic_url.replace(
        "?width={width}",
        "",
    )


def fetch_search_page(
    search_term: str,
    page: int,
) -> dict[str, Any]:
    """
    Consulta uma página da busca pública do Fan Kit.
    """

    params = {
        "limit": PAGE_LIMIT,
        "page": page,
        "order": "RELEVANCE",
        "q": search_term,
    }

    response = requests.get(
        BASE_URL,
        params=params,
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()


def download_asset(
    url: str,
    destination: Path,
) -> bool:
    """
    Baixa um único asset.

    Arquivos já existentes são preservados para evitar
    downloads repetidos.
    """

    if destination.exists():
        print(
            f"[SKIP] {destination.name}"
        )

        return False

    response = requests.get(
        url,
        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    destination.write_bytes(
        response.content
    )

    print(
        f"[OK]   {destination.name}"
    )

    return True


# ==========================================================
# EXECUÇÃO
# ==========================================================

def main() -> None:
    """
    Executa a busca informada pelo usuário e baixa todos
    os assets públicos encontrados.
    """

    if len(sys.argv) < 2:
        print(
            "Informe um termo de busca."
        )

        print()
        print(
            "Exemplos:"
        )

        print(
            "python scripts/fankit-download.py icon"
        )

        print(
            "python scripts/fankit-download.py equipment"
        )

        print(
            "python scripts/fankit-download.py gear"
        )

        sys.exit(1)

    search_term = " ".join(
        sys.argv[1:]
    ).strip()

    normalized_search_term = (
        normalize_search_term(
            search_term
        )
    )

    output_directory = Path(
        "downloads"
    ) / "fankit" / normalized_search_term

    manifest_file = (
        output_directory /
        "manifest.json"
    )

    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    manifest: list[
        dict[str, Any]
    ] = []

    page = 1

    total_downloaded = 0

    total_processed = 0

    print()
    print(
        f'Buscando assets por: "{search_term}"'
    )
    print()

    while True:
        print(
            f"Consultando página {page}..."
        )

        result = fetch_search_page(
            search_term,
            page,
        )

        if page == 1:
            print(
                f"Resultados informados pelo Fan Kit: "
                f"{result.get('total', 0)}"
            )

            print()

        assets = result.get(
            "data",
            [],
        )

        if not assets:
            break

        for asset in assets:
            # --------------------------------------------------
            # Somente assets marcados como disponíveis.
            # --------------------------------------------------

            if (
                asset.get(
                    "download_status"
                )
                != "Available"
            ):
                continue

            # --------------------------------------------------
            # Nesta ferramenta estamos interessados apenas
            # em imagens.
            # --------------------------------------------------

            if not asset.get(
                "is_image"
            ):
                continue

            title = (
                asset.get("title")
                or asset.get(
                    "computed_alternative_text"
                )
                or f"asset-{asset.get('id')}"
            )

            extension = (
                asset.get("ext")
                or "png"
            )

            filename = (
                normalize_filename(
                    title,
                    extension,
                )
            )

            asset_url = (
                build_asset_url(
                    asset
                )
            )

            if not asset_url:
                continue

            destination = (
                output_directory /
                filename
            )

            total_processed += 1

            try:
                downloaded = (
                    download_asset(
                        asset_url,
                        destination,
                    )
                )

                if downloaded:
                    total_downloaded += 1

            except requests.RequestException as error:
                print(
                    f"[ERRO] "
                    f"{filename}: "
                    f"{error}"
                )

                continue

            manifest.append(
                {
                    "id": asset.get(
                        "id"
                    ),
                    "title": title,
                    "filename": filename,
                    "extension": extension,
                    "width": asset.get(
                        "width"
                    ),
                    "height": asset.get(
                        "height"
                    ),
                    "source_url": asset_url,
                }
            )

            time.sleep(
                REQUEST_DELAY_SECONDS
            )

        if not result.get(
            "hasMore"
        ):
            break

        page += 1

    manifest_file.write_text(
        json.dumps(
            manifest,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print()
    print(
        f"{total_processed} assets processados."
    )

    print(
        f"{total_downloaded} novos arquivos baixados."
    )

    print(
        f"Destino: "
        f"{output_directory.resolve()}"
    )

    print(
        f"Manifesto: "
        f"{manifest_file.resolve()}"
    )


if __name__ == "__main__":
    main()