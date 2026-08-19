"""
==========================================================
Kings of Doom Command Center
----------------------------------------------------------
Arquivo:
scripts/fankit-scan.py

Responsabilidade:
Inspecionar as requisições de rede realizadas pela página
pública do Fan Kit da Supercell para identificar os recursos
utilizados pela biblioteca de assets.

O script não realiza downloads nesta etapa.

Ele apenas:
• abre a página pública do Fan Kit;
• observa as requisições de rede;
• rola a página para carregar conteúdo dinâmico;
• registra URLs potencialmente relacionadas a assets;
• salva o resultado em um arquivo local para análise.

Autor:
stigmandroid

Última atualização:
18/08/2026

Versão:
0.8.8

Status:
🔎 Ferramenta de diagnóstico
==========================================================
"""

from pathlib import Path

from playwright.sync_api import sync_playwright


# ==========================================================
# CONFIGURAÇÃO
# ==========================================================

FANKIT_URL = (
    "https://fankit.supercell.com/"
    "d/vkEdmkUCngKw/game-assets?q=icon"
)

OUTPUT_FILE = Path("fankit-network.txt")


# Extensões e palavras que podem indicar uma requisição
# relacionada aos assets da biblioteca.
INTERESTING_TERMS = (
    "asset",
    "image",
    "media",
    "download",
    "frontify",
    "graphql",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".svg",
)


def is_interesting_url(url: str) -> bool:
    """
    Verifica se uma URL parece estar relacionada a assets.

    O filtro é propositalmente amplo nesta etapa porque ainda
    estamos descobrindo como o Fan Kit entrega os arquivos.
    """

    normalized_url = url.lower()

    return any(
        term in normalized_url
        for term in INTERESTING_TERMS
    )


def main() -> None:
    """
    Executa a inspeção da página do Fan Kit.

    Nenhum arquivo de imagem é baixado.
    """

    captured_urls: set[str] = set()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
        )

        page = browser.new_page(
            viewport={
                "width": 1440,
                "height": 1000,
            },
        )

        # ==================================================
        # MONITORAMENTO DE REDE
        # ==================================================

        def handle_request(request) -> None:
            """
            Captura cada requisição realizada pela página.

            URLs potencialmente relacionadas a assets são
            armazenadas para análise posterior.
            """

            url = request.url

            if is_interesting_url(url):
                captured_urls.add(url)

        page.on(
            "request",
            handle_request,
        )

        print("Abrindo Fan Kit...")

        page.goto(
            FANKIT_URL,
            wait_until="domcontentloaded",
            timeout=120_000,
        )

        # Dá tempo para as primeiras chamadas assíncronas.
        page.wait_for_timeout(5000)

        # ==================================================
        # CARREGAMENTO DINÂMICO
        # ==================================================

        print("Carregando biblioteca...")

        previous_height = 0

        for _ in range(40):
            current_height = page.evaluate(
                "document.body.scrollHeight"
            )

            page.evaluate(
                """
                window.scrollTo(
                    0,
                    document.body.scrollHeight
                )
                """
            )

            page.wait_for_timeout(1000)

            if current_height == previous_height:
                # Mesmo quando a altura deixa de mudar,
                # aguardamos mais um pouco porque algumas
                # bibliotecas utilizam carregamento assíncrono.
                page.wait_for_timeout(2500)
                break

            previous_height = current_height

        # ==================================================
        # RESULTADO
        # ==================================================

        sorted_urls = sorted(captured_urls)

        OUTPUT_FILE.write_text(
            "\n".join(sorted_urls),
            encoding="utf-8",
        )

        print()
        print(
            f"{len(sorted_urls)} requisições "
            "potencialmente relevantes encontradas."
        )

        print(
            f"Arquivo salvo em: "
            f"{OUTPUT_FILE.resolve()}"
        )

        browser.close()


if __name__ == "__main__":
    main()