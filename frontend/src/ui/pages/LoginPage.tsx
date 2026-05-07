import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError, apiFetch, login, loginMfa } from "../../lib/api";
import { loadAuth, saveAuth } from "../../lib/storage";

export function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const existing = loadAuth();

  const [email, setEmail] = useState(existing?.email ?? "admin@budget.local");
  const [password, setPassword] = useState("Admin123!");
  const [code, setCode] = useState("");
  const [needsMfa, setNeedsMfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // seed admin in dev (idempotent)
    apiFetch("/auth/seed-admin", { method: "POST" }).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = needsMfa ? await loginMfa(email, password, code) : await login(email, password);
      saveAuth({ token: r.access_token, email });
      nav("/dashboard");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && e.bodyText.includes("MFA required")) {
        setNeedsMfa(true);
        setError("MFA requis: saisissez le code TOTP");
      } else {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid max-w-md gap-4 p-6">
        <h1 className="text-xl font-semibold">{t("login")}</h1>
        <form onSubmit={onSubmit} className="rounded-lg border bg-white p-4">
          <div className="space-y-3">
            <label className="block">
              <div className="mb-1 text-sm text-slate-600">{t("email")}</div>
              <input
                className="w-full rounded border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm text-slate-600">{t("password")}</div>
              <input
                className="w-full rounded border px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {needsMfa ? (
              <label className="block">
                <div className="mb-1 text-sm text-slate-600">Code MFA (TOTP)</div>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                />
              </label>
            ) : null}
            <button
              className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              type="submit"
              disabled={busy}
            >
              {t("signIn")}
            </button>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        </form>
        <div className="text-xs text-slate-500">
          Astuce: active MFA via <code>/auth/mfa/setup</code> et <code>/auth/mfa/enable</code> dans Swagger.
        </div>
      </div>
    </div>
  );
}

