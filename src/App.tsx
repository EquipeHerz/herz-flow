import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeProvider as SCThemeProvider } from "styled-components";
import { theme } from "@/styles/global/theme";
import { GlobalStyle } from "@/styles/global/styles";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";

import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Companies = lazy(() => import("./pages/Companies"));
const RegisterCompany = lazy(() => import("./pages/PublicCompanyRegistration"));
const UserList = lazy(() => import("./pages/UserList"));
const RegisterUser = lazy(() => import("./pages/PublicUserRegistration"));
const FeatureDisabled = lazy(() => import("./pages/FeatureDisabled"));
const MyCompany = lazy(() => import("./pages/MyCompany"));

const queryClient = new QueryClient();

const LoadingFallback = () => null;

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Navigate to="/login" replace />} />
        <Route path="/registro/*" element={<Navigate to="/login" replace />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meu-perfil" element={<Profile />} />
        </Route>

        <Route element={<PrivateRoute roles={['ADMIN_EMPRESA']} />}>
          <Route path="/minha-empresa" element={<MyCompany />} />
        </Route>

        <Route element={<PrivateRoute roles={['ADMIN_SISTEMA']} />}>
          <Route path="/listagem-empresas" element={<Companies />} />
          <Route path="/registro-empresa" element={<RegisterCompany />} />
        </Route>

        <Route element={<PrivateRoute roles={['ADMIN_SISTEMA']} />}>
          <Route path="/listagem-usuarios" element={<UserList />} />
          <Route path="/registro-usuario" element={<RegisterUser />} />
        </Route>

        <Route element={<PrivateRoute roles={['ADMIN_SISTEMA']} />}>
          <Route path="/editor-contrato" element={<FeatureDisabled />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SCThemeProvider theme={theme}>
        <GlobalStyle />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SCThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
