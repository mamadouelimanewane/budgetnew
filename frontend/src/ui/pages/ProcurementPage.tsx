import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type Vendor = { id: number; name: string; tax_id: string; phone: string; email: string };
type Commitment = {
  id: number;
  fiscal_year: number;
  budget_plan_id: number;
  budget_line_id: number;
  org_unit: string;
  vendor_id: number | null;
  description: string;
  amount_xof: number;
  status: string;
};
type Payment = { id: number; commitment_id: number; amount_xof: number; method: string; status: string };

export function ProcurementPage() {
  const token = loadAuth()?.token ?? "";
  const [err, setErr] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [vendorName, setVendorName] = useState("Fournisseur");

  const [commitYear, setCommitYear] = useState(new Date().getFullYear());
  const [planId, setPlanId] = useState<number>(1);
  const [lineId, setLineId] = useState<number>(1);
  const [orgUnit, setOrgUnit] = useState("DAF");
  const [amount, setAmount] = useState(100000);
  const [desc, setDesc] = useState("Achat");
  const [vendorId, setVendorId] = useState<number | "">("");

  const [payCommitId, setPayCommitId] = useState<number | "">("");
  const [payAmount, setPayAmount] = useState(10000);
  const [payMethod, setPayMethod] = useState("bank");

  async function refresh() {
    setErr(null);
    const [v, c, p] = await Promise.all([
      apiFetch<Vendor[]>("/procurement/vendors", { token }),
      apiFetch<Commitment[]>("/procurement/commitments", { token }),
      apiFetch<Payment[]>("/procurement/payments", { token }),
    ]);
    setVendors(v);
    setCommitments(c);
    setPayments(p);
  }

  useEffect(() => {
    if (!token) return;
    refresh().catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createVendor() {
    await apiFetch("/procurement/vendors", { method: "POST", token, body: JSON.stringify({ name: vendorName, tax_id: "", phone: "", email: "" }) });
    await refresh();
  }

  async function createCommitment() {
    await apiFetch("/procurement/commitments", {
      method: "POST",
      token,
      body: JSON.stringify({
        fiscal_year: commitYear,
        budget_plan_id: planId,
        budget_line_id: lineId,
        org_unit: orgUnit,
        vendor_id: vendorId === "" ? null : vendorId,
        description: desc,
        amount_xof: amount,
      }),
    });
    await refresh();
  }

  async function submit(id: number) {
    await apiFetch(`/procurement/commitments/${id}/submit`, { method: "POST", token });
    await refresh();
  }

  async function approve(id: number) {
    await apiFetch(`/procurement/commitments/${id}/approve`, { method: "POST", token });
    await refresh();
  }

  async function createPayment() {
    if (payCommitId === "") return;
    await apiFetch("/procurement/payments", {
      method: "POST",
      token,
      body: JSON.stringify({ commitment_id: payCommitId, amount_xof: payAmount, method: payMethod }),
    });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Achats & Paiements</div>
        <div className="text-sm text-slate-500">Fournisseurs, engagements, paiements + workflow submit/approve.</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Fournisseur</div>
          <div className="mt-2 space-y-2">
            <input className="w-full rounded border px-3 py-2 text-sm" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
            <button className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createVendor}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Engagement</div>
          <div className="mt-2 grid gap-2">
            <input className="rounded border px-3 py-2 text-sm" type="number" value={commitYear} onChange={(e) => setCommitYear(parseInt(e.target.value || "2026", 10))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded border px-3 py-2 text-sm" type="number" value={planId} onChange={(e) => setPlanId(parseInt(e.target.value || "1", 10))} placeholder="budget_plan_id" />
              <input className="rounded border px-3 py-2 text-sm" type="number" value={lineId} onChange={(e) => setLineId(parseInt(e.target.value || "1", 10))} placeholder="budget_line_id" />
            </div>
            <input className="rounded border px-3 py-2 text-sm" value={orgUnit} onChange={(e) => setOrgUnit(e.target.value)} />
            <select className="rounded border px-3 py-2 text-sm" value={vendorId} onChange={(e) => setVendorId(e.target.value ? parseInt(e.target.value, 10) : "")}>
              <option value="">(sans fournisseur)</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <input className="rounded border px-3 py-2 text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <input className="rounded border px-3 py-2 text-sm" type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createCommitment}>
              Créer
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Paiement</div>
          <div className="mt-2 grid gap-2">
            <select className="rounded border px-3 py-2 text-sm" value={payCommitId} onChange={(e) => setPayCommitId(e.target.value ? parseInt(e.target.value, 10) : "")}>
              <option value="">Choisir engagement</option>
              {commitments.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.status} — {c.amount_xof.toLocaleString("fr-FR")} XOF
                </option>
              ))}
            </select>
            <input className="rounded border px-3 py-2 text-sm" type="number" value={payAmount} onChange={(e) => setPayAmount(parseInt(e.target.value || "0", 10))} />
            <select className="rounded border px-3 py-2 text-sm" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="bank">Banque</option>
              <option value="mobile">Mobile</option>
            </select>
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createPayment}>
              Payer
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-sm font-semibold">Engagements</div>
        <div className="mt-2 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Org</th>
                <th className="py-2 pr-3">Montant</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commitments.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-2 pr-3">#{c.id}</td>
                  <td className="py-2 pr-3">{c.org_unit}</td>
                  <td className="py-2 pr-3">{c.amount_xof.toLocaleString("fr-FR")} XOF</td>
                  <td className="py-2 pr-3">{c.status}</td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2">
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => submit(c.id)}>
                        Submit
                      </button>
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => approve(c.id)}>
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!commitments.length ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    Aucun engagement
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

