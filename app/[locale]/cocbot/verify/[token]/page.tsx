/**
 * ==========================================================
 * Kings of Doom Command Center
 * ----------------------------------------------------------
 * Arquivo:
 * app/[locale]/cocbot/verify/[token]/page.tsx
 *
 * Responsabilidade:
 * Exibir a interface segura utilizada pelo COC Bot para
 * confirmação de propriedade de contas do Clash of Clans.
 *
 * Segurança:
 * O API Token informado pelo jogador é utilizado apenas
 * durante a verificação e nunca é armazenado.
 *
 * Autor:
 * stigmandroid
 *
 * Última atualização:
 * 06/09/2026
 *
 * Versão:
 * 0.3.0
 *
 * Status:
 * Desenvolvimento
 * ==========================================================
 */

"use client";

import { type FormEvent, useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * ==========================================================
 * TIPOS
 * ==========================================================
 */

type VerificationSessionResponse = {
  success?: boolean;

  player?: {
    tag: string;
    name: string | null;
  };

  expiresAt?: string;

  status?: string;
  error?: string;
};

type PageState = "loading" | "ready" | "invalid" | "expired" | "success";

/**
 * ==========================================================
 * PÁGINA
 * ==========================================================
 */

export default function CocBotVerifyPage() {
  const params = useParams();

  const token = typeof params.token === "string" ? params.token : "";

  const t = useTranslations("CocBotVerification");

  const [pageState, setPageState] = useState<PageState>("loading");

  const [playerName, setPlayerName] = useState<string | null>(null);

  const [playerTag, setPlayerTag] = useState("");

  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [apiToken, setApiToken] = useState("");

  const [message, setMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * ========================================================
   * CARREGAMENTO DA SESSÃO
   * ========================================================
   */

  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }

    async function loadSession() {
      try {
        const response = await fetch(
          `/api/cocbot/verification/${encodeURIComponent(token)}`,
          {
            cache: "no-store",
          },
        );

        const data = (await response.json()) as VerificationSessionResponse;

        if (!response.ok || !data.success) {
          if (data.status === "expired" || response.status === 410) {
            setPageState("expired");

            return;
          }

          setPageState("invalid");

          return;
        }

        setPlayerName(data.player?.name ?? null);

        setPlayerTag(data.player?.tag ?? "");

        setExpiresAt(data.expiresAt ?? null);

        setPageState("ready");
      } catch {
        setMessage(t("serviceUnavailable"));

        setPageState("invalid");
      }
    }

    void loadSession();
  }, [token, t]);

  /**
   * ========================================================
   * ENVIO DO API TOKEN
   * ========================================================
   */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedApiToken = apiToken.trim();

    if (!normalizedApiToken) {
      setMessage(t("tokenRequired"));

      return;
    }

    setIsSubmitting(true);

    setMessage(null);

    try {
      const response = await fetch("/api/cocbot/verify", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          sessionToken: token,

          playerApiToken: normalizedApiToken,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setMessage(data.error ?? t("verificationFailed"));

        return;
      }

      /**
       * Remove o token da memória do formulário
       * imediatamente após a verificação.
       */
      setApiToken("");

      setPageState("success");
    } catch {
      setMessage(t("serviceUnavailable"));
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * ========================================================
   * LOADING
   * ========================================================
   */

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-start justify-center bg-slate-950 px-4 py-16 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-4xl">🤖</div>

          <p className="mt-4 text-sm text-slate-400">{t("loading")}</p>
        </div>
      </main>
    );
  }

  /**
   * ========================================================
   * SESSÃO INVÁLIDA / EXPIRADA
   * ========================================================
   */

  if (pageState === "invalid" || pageState === "expired") {
    return (
      <main className="flex min-h-screen items-start justify-center bg-slate-950 px-4 py-16 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-4xl">⏱️</div>

          <h1 className="mt-4 text-2xl font-bold">
            {pageState === "expired" ? t("expiredTitle") : t("invalidTitle")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {pageState === "expired"
              ? t("expiredDescription")
              : t("invalidDescription")}
          </p>

          {message && <p className="mt-4 text-sm text-amber-300">{message}</p>}

          <p className="mt-6 text-xs text-slate-500">{t("requestNewLink")}</p>
        </div>
      </main>
    );
  }

  /**
   * ========================================================
   * SUCESSO
   * ========================================================
   */

  if (pageState === "success") {
    return (
      <main className="flex min-h-screen items-start justify-center bg-slate-950 px-4 py-16 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-5xl">✅</div>

          <h1 className="mt-5 text-2xl font-bold">{t("successTitle")}</h1>

          <p className="mt-3 text-slate-300">{playerName ?? playerTag}</p>

          <p className="mt-1 text-sm text-slate-500">{playerTag}</p>

          <p className="mt-6 text-sm leading-6 text-slate-400">
            {t("successDescription")}
          </p>

          <p className="mt-6 text-xs text-slate-500">{t("successClose")}</p>
        </div>
      </main>
    );
  }

  /**
   * ========================================================
   * FORMULÁRIO DE VERIFICAÇÃO
   * ========================================================
   */

  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-950 px-4 py-12 text-white sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="text-center">
          <div className="text-4xl">🤖</div>

          <h1 className="mt-3 text-2xl font-bold">{t("title")}</h1>

          <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>
        </div>

        <div className="mt-7 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t("accountBeingVerified")}
          </p>

          <p className="mt-2 text-lg font-semibold">
            🎮 {playerName ?? t("unknownPlayer")}
          </p>

          <p className="mt-1 font-mono text-sm text-slate-400">{playerTag}</p>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-300">
          {t("instructions")}
        </p>

        <div className="mt-4 rounded-lg bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
          {t("tokenLocation")}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="apiToken"
              className="mb-2 block text-sm font-medium"
            >
              {t("tokenLabel")}
            </label>

            <input
              id="apiToken"
              type="password"
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder={t("tokenPlaceholder")}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("verifyingButton") : t("verifyButton")}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-amber-300">{message}</p>
        )}

        {expiresAt && (
          <p className="mt-5 text-center text-xs text-slate-500">
            ⏱️ {t("temporaryLink")}
          </p>
        )}

        <div className="mt-6 border-t border-slate-800 pt-5">
          <p className="text-center text-xs leading-5 text-slate-500">
            🔒 {t("privacy")}
          </p>
        </div>
      </div>
    </main>
  );
}
