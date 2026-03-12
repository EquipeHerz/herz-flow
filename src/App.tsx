/*
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeProvider as SCThemeProvider } from "styled-components";
import { theme } from "@/styles/global/theme";
import { GlobalStyle } from "@/styles/global/styles";
import Index from "./pages/Index";
import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RouteTransition from "./components/RouteTransition";
import PrivateRoute from "./components/PrivateRoute";
// import UserList from "./pages/UserList";
// import RegisterUser from "./pages/RegisterUser";
// import RegisterCompany from "./pages/RegisterCompany";
// import Companies from "./pages/Companies";
// import ContractEditor from "./pages/ContractEditor";
// import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
*/

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Lazy load potentially problematic components to isolate the crash
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Companies = lazy(() => import("./pages/Companies"));
const RegisterCompany = lazy(() => import("./pages/RegisterCompany"));
const UserList = lazy(() => import("./pages/UserList"));
const RegisterUser = lazy(() => import("./pages/RegisterUser"));
const ContractEditor = lazy(() => import("./pages/ContractEditor"));

const queryClient = new QueryClient();

const LoadingFallback = () => null;

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Protected Routes (Authenticated Users) */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meu-perfil" element={<Profile />} />
        </Route>

        {/* System Admin Only */}
        <Route element={<PrivateRoute roles={['ADMIN_SISTEMA']} />}>
          <Route path="/listagem-empresas" element={<Companies />} />
          <Route path="/registro-empresa" element={<RegisterCompany />} />
        </Route>

        {/* User Management (Admin Sistema, Admin Empresa, Admin Setor) */}
        <Route element={<PrivateRoute roles={['ADMIN_SISTEMA', 'ADMIN_EMPRESA', 'ADMIN_SETOR']} />}>
          <Route path="/listagem-usuarios" element={<UserList />} />
          <Route path="/registro-usuario" element={<RegisterUser />} />
        </Route>

        {/* Contract Management (Admin Sistema, Admin Empresa) */}
        <Route element={<PrivateRoute roles={['ADMIN_SISTEMA', 'ADMIN_EMPRESA']} />}>
          <Route path="/editor-contrato" element={<ContractEditor />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
