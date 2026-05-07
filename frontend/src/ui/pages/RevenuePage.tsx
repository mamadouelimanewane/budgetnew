import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type Revenue = {
  id: number;
  fiscal_year: number;
  org_unit: string;
  account: string;
  label: string;
  amount_xof: number;
  period: string;
};

export function RevenuePage() {
  const token = loadAuth()?.token ?? "";
  const [items, setItems] = useState<Revenue[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [org, setOrg] = useState("DAF");
  const [account, setAccount] = useState("701");
  const [label, setLabel] = useState("Recette");
  const [amount, setAmount] = useState(500000);
  const [period, setPeriod] = useState("monthly");

  async function refresh() {
    setErr(null);
    const r = await apiFetch<Revenue[]>(`/revenue/?fiscal_year=${year}`, { token });
    setItems(r);
  }

  useEffect(() => {
    if (!token) return;
    refresh().catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createRevenue() {
    await apiFetch("/revenue/", {
      method: "POST",
      token,
      body: JSON.stringify({ fiscal_year: year, org_unit: org, account, label, amount_xof: amount, period }),
    });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Recettes</div>
        <div className="text-sm text-slate-500">Saisie simple des recettes (baseline).</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="rounded-lg border p-3">
        <div className="text-sm font-semibold">Ajouter une recette</div>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <input className="rounded border px-3 py-2 text-sm" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value || "2026", 10))} />
          <input className="rounded border px-3 py-2 text-sm" value={org} onChange={(e) => setOrg(e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" value={account} onChange={(e) => setAccount(e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm md:col-span-2" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))} />
          <select className="rounded border px-3 py-2 text-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="monthly">Mensuel</option>
            <option value="quarterly">Trimestriel</option>
            <option value="annual">Annuel</option>
          </select>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createRevenue}>
            Ajouter
          </button>
          <button className="rounded border px-3 py-2 text-sm" onClick={refresh}>
            Rafraîchir
          </button>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-sm font-semibold">Dernières recettes</div>
        <div className="mt-2 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Org</th>
                <th className="py-2 pr-3">Compte</th>
                <th className="py-2 pr-3">Libellé</th>
                <th className="py-2 pr-3">Montant</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-3">#{r.id}</td>
                  <td className="py-2 pr-3">{r.org_unit}</td>
                  <td className="py-2 pr-3">{r.account}</td>
                  <td className="py-2 pr-3">{r.label}</td>
                  <td className="py-2 pr-3">{r.amount_xof.toLocaleString("fr-FR")} XOF</td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    Aucune recette
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

