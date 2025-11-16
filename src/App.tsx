import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NewTransaction from "./pages/NewTransaction";
import Transactions from "./pages/Transactions";
import EditTransaction from "./pages/EditTransaction";
import Categories from "./pages/Categories";
import Accounts from "./pages/Accounts";
import Goals from "./pages/Goals";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import ExportReports from "./pages/ExportReports";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/novo" element={<ProtectedRoute><NewTransaction /></ProtectedRoute>} />
            <Route path="/extrato" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/transacao/:id" element={<ProtectedRoute><EditTransaction /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/contas" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="/metas" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="/orcamentos" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/exportar" element={<ProtectedRoute><ExportReports /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
