import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

export function AdminPage() {
  const token = loadAuth()?.token ?? "";
  const [err, setErr] = useState<string | null>(null);
  const [roles, setRoles] = useState<any>(null);
  const [roleName, setRoleName] = useState("analyst");
  const [roleDesc, setRoleDesc] = useState("Analyste");

  const [delegationFrom, setDelegationFrom] = useState(1);
  const [delegationTo, setDelegationTo] = useState(1);
  const [limitXof, setLimitXof] = useState(500000);

  async function listRoles() {
    setErr(null);
    const r = await apiFetch("/admin/roles", { token });
    setRoles(r);
  }

  async function createRole() {
    setErr(null);
    await apiFetch("/admin/roles", { method: "POST", token, body: JSON.stringify({ name: roleName, description: roleDesc }) });
    await listRoles();
  }

  async function createDelegation() {
    setErr(null);
    const now = new Date();
    const starts = now.toISOString();
    const ends = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
    await apiFetch("/admin/delegations", {
      method: "POST",
      token,
      body: JSON.stringify({ user_from_id: delegationFrom, user_to_id: delegationTo, limit_xof: limitXof, starts_at: starts, ends_at: ends }),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Admin (RBAC)</div>
        <div className="text-sm text-slate-500">Création rôles et délégations (admin requis).</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Rôles</div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <input className="rounded border px-3 py-2 text-sm" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
            <input className="rounded border px-3 py-2 text-sm md:col-span-2" value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createRole}>
              Créer
            </button>
            <button className="rounded border px-3 py-2 text-sm" onClick={listRoles}>
              Lister
            </button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(roles ?? { hint: "Lister les rôles" }, null, 2)}
          </pre>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Délégation</div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <input className="rounded border px-3 py-2 text-sm" type="number" value={delegationFrom} onChange={(e) => setDelegationFrom(parseInt(e.target.value || "1", 10))} />
            <input className="rounded border px-3 py-2 text-sm" type="number" value={delegationTo} onChange={(e) => setDelegationTo(parseInt(e.target.value || "1", 10))} />
            <input className="rounded border px-3 py-2 text-sm" type="number" value={limitXof} onChange={(e) => setLimitXof(parseInt(e.target.value || "0", 10))} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createDelegation}>
              Créer délégation (7 jours)
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Note: dans cette v1, la délégation est surtout utilisée pour le contrôle du plafond lors de l’approbation d’engagement.
          </div>
        </div>
      </div>
    </div>
  );
}

