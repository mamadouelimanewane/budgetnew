import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "block rounded px-3 py-2 text-sm",
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

function NavSection({ title }: { title: string }) {
  return (
    <div className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {title}
    </div>
  );
}

export function Layout() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">Budget</span>
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">NEW</span>
            <span className="ml-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">PREMIUM</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              MODE DÉMO
            </span>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="wo">Wolof</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 p-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border bg-white p-2 h-fit sticky top-16">
          <nav className="space-y-0.5">
            <NavSection title="Standard" />
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            <NavLink to="/budget" className={navClass}>Budget</NavLink>
            <NavLink to="/procurement" className={navClass}>Achats & Paiements</NavLink>
            <NavLink to="/revenue" className={navClass}>Recettes</NavLink>
            <NavLink to="/exports" className={navClass}>Exports & Rapports</NavLink>
            <NavLink to="/audit" className={navClass}>Audit</NavLink>
            <NavLink to="/ai" className={navClass}>IA Forecasting</NavLink>
            <NavLink to="/admin" className={navClass}>Admin (RBAC)</NavLink>
            <NavSection title="Premium ✦" />
            <NavLink to="/dcmp" className={(p) => navClass(p) + " border-l-2 border-emerald-500 ml-1"}>
              Marchés Publics DCMP
            </NavLink>
            <NavLink to="/simulation" className={(p) => navClass(p) + " border-l-2 border-emerald-500 ml-1"}>
              Simulation What-If
            </NavLink>
            <NavLink to="/alerts" className={(p) => navClass(p) + " border-l-2 border-emerald-500 ml-1"}>
              Alertes Intelligentes
            </NavLink>
            <NavLink to="/license" className={(p) => navClass(p) + " border-l-2 border-amber-400 ml-1"}>
              Plans & Licence
            </NavLink>
          </nav>
          <div className="mt-3 text-xs text-slate-400 px-3">
            API: <code className="text-xs">{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}</code>
          </div>
        </aside>
        <main className="rounded-lg border bg-white p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
