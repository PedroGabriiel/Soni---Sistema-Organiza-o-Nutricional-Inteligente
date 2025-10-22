
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import NutritionistDashboard from "./pages/NutritionistDashboard";
import PatientProfile from "./pages/PatientProfile";
import SubstitutionRules from "./pages/SubstitutionRules";
import PatientPortal from "./pages/PatientPortal";
import PatientActivation from "./pages/PatientActivation";
import PatientPassword from "./pages/PatientPassword";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import NutritionistSignup from "@/pages/NutritionistSignup";
import NutritionistLoginConfirm from "@/pages/NutritionistLoginConfirm";
import NutritionistProfile from "@/pages/NutritionistProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LoginPage />} />
            <Route path="nutricionista" element={<NutritionistDashboard />} />
            <Route path="nutricionista/cadastro" element={<NutritionistSignup />} />
            <Route path="nutricionista/confirmacao" element={<NutritionistLoginConfirm />} />
            <Route path="nutricionista/paciente/:id" element={<PatientProfile />} />
            <Route path="nutricionista/perfil" element={<NutritionistProfile />} />
            <Route path="nutricionista/regras" element={<SubstitutionRules />} />
            <Route path="paciente-portal" element={<PatientPortal />} />
            <Route path="paciente-ativacao" element={<PatientActivation />} />
            <Route path="paciente-senha" element={<PatientPassword />} />
            <Route path="paciente-login" element={<PatientLogin />} />
            <Route path="paciente-dashboard" element={<PatientDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
