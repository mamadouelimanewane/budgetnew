import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BudgetPage } from "./pages/BudgetPage";
import { BudgetFormPage } from "./pages/BudgetFormPage";
import { ProcurementPage } from "./pages/ProcurementPage";
import { RevenuePage } from "./pages/RevenuePage";
import { AuditPage } from "./pages/AuditPage";
import { ExportsPage } from "./pages/ExportsPage";
import { AiPage } from "./pages/AiPage";
import { AdminPage } from "./pages/AdminPage";
import { UsersPage } from "./pages/UsersPage";
import { DcmpPage } from "./pages/DcmpPage";
import { SimulationPage } from "./pages/SimulationPage";
import { AlertsPage } from "./pages/AlertsPage";
import { LicensePage } from "./pages/LicensePage";
import { ComparePage } from "./pages/ComparePage";
import { ChatbotPage } from "./pages/ChatbotPage";
import { ExecutivePage } from "./pages/ExecutivePage";
import { PortailPage } from "./pages/PortailPage";
import { TofePage } from "./pages/TofePage";
import { FraudePage } from "./pages/FraudePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { WorkflowPage } from "./pages/WorkflowPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { CopilotePage } from "./pages/CopilotePage";
import { CartePage } from "./pages/CartePage";
import { CitoyenPage } from "./pages/CitoyenPage";
import { MultiExercicePage } from "./pages/MultiExercicePage";
import { OcrPage } from "./pages/OcrPage";
import { OngPage } from "./pages/OngPage";
import { SuiviEvalPage } from "./pages/SuiviEvalPage";
import { DatabasePage } from "./pages/DatabasePage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/saisie" element={<BudgetFormPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/exports" element={<ExportsPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/dcmp" element={<DcmpPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/license" element={<LicensePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/executive" element={<ExecutivePage />} />
          <Route path="/portail" element={<PortailPage />} />
          <Route path="/tofe" element={<TofePage />} />
          <Route path="/fraude" element={<FraudePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/copilote" element={<CopilotePage />} />
          <Route path="/carte" element={<CartePage />} />
          <Route path="/citoyen" element={<CitoyenPage />} />
          <Route path="/multi-exercices" element={<MultiExercicePage />} />
          <Route path="/ocr" element={<OcrPage />} />
          <Route path="/ong" element={<OngPage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/suivi-eval" element={<SuiviEvalPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
