import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BudgetPage } from "./pages/BudgetPage";
import { ProcurementPage } from "./pages/ProcurementPage";
import { RevenuePage } from "./pages/RevenuePage";
import { AuditPage } from "./pages/AuditPage";
import { ExportsPage } from "./pages/ExportsPage";
import { AiPage } from "./pages/AiPage";
import { AdminPage } from "./pages/AdminPage";
// Premium pages
import { DcmpPage } from "./pages/DcmpPage";
import { SimulationPage } from "./pages/SimulationPage";
import { AlertsPage } from "./pages/AlertsPage";
import { LicensePage } from "./pages/LicensePage";
import { loadAuth } from "../lib/storage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = loadAuth();
  if (!auth?.token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function P({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<P><DashboardPage /></P>} />
          <Route path="/budget" element={<P><BudgetPage /></P>} />
          <Route path="/procurement" element={<P><ProcurementPage /></P>} />
          <Route path="/revenue" element={<P><RevenuePage /></P>} />
          <Route path="/exports" element={<P><ExportsPage /></P>} />
          <Route path="/audit" element={<P><AuditPage /></P>} />
          <Route path="/ai" element={<P><AiPage /></P>} />
          <Route path="/admin" element={<P><AdminPage /></P>} />
          {/* Premium */}
          <Route path="/dcmp" element={<P><DcmpPage /></P>} />
          <Route path="/simulation" element={<P><SimulationPage /></P>} />
          <Route path="/alerts" element={<P><AlertsPage /></P>} />
          <Route path="/license" element={<P><LicensePage /></P>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
