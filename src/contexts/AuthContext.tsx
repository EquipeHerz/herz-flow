import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { createSistemaLoginBackClient } from "@/services/sistemaLoginBack";
import { mapApiUsuarioToUiUser } from "@/services/sistemaLoginBack/mapToUiUser";
import { getAuthTokenFromCookies } from "@/services/http/authCookie";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const apiClient = React.useMemo(() => createSistemaLoginBackClient(), []);

  const persistSession = (user: User, token?: string | null) => {
    if (token && token.trim()) localStorage.setItem("herz_auth_token", token.trim());
    else localStorage.removeItem("herz_auth_token");
    localStorage.setItem("herz_user_data", JSON.stringify(user));
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, "");

  const enrichUserWithCompany = async (current: User): Promise<User> => {
    if (current.role !== "ADMIN_EMPRESA") return current;

    const cpfDigits = onlyDigits(current.cpf ?? "");
    if (cpfDigits.length !== 11) return current;

    try {
      const empresa = await apiClient.api.searchEmpresaByCpf(cpfDigits);
      if (!empresa) return current;

      const companyName =
        (empresa.nomeFantasia?.trim() ? empresa.nomeFantasia : null) ??
        (empresa.nomeOficial?.trim() ? empresa.nomeOficial : null) ??
        current.companyName;

      const companyId = empresa.id ?? current.companyId;
      const cnpj = empresa.cnpj ?? current.cnpj;

      if (companyId === current.companyId && companyName === current.companyName && cnpj === current.cnpj) return current;

      return {
        ...current,
        companyId,
        companyName,
        cnpj,
      };
    } catch {
      return current;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        const storedToken = localStorage.getItem('herz_auth_token');
        const cookieToken = getAuthTokenFromCookies();

        const isValidStoredUser = (u: User | null): u is User => !!u?.id && !!u?.role;

        if (isValidStoredUser(storedUser) && (storedToken || cookieToken)) {
          if (!storedToken && cookieToken) {
            localStorage.setItem("herz_auth_token", cookieToken);
          }
          setUser(storedUser);
          setIsAuthenticated(true);

          const enriched = await enrichUserWithCompany(storedUser);
          if (enriched !== storedUser) {
            setUser(enriched);
            localStorage.setItem('herz_user_data', JSON.stringify(enriched));
          }
        } else if (isValidStoredUser(storedUser)) {
          try {
            const ok = await apiClient.api.isAuthenticated();
            if (ok) {
              setUser(storedUser);
              setIsAuthenticated(true);
              return;
            }
          } catch {}
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        } else {
          if (storedUser || storedToken) {
             authService.logout();
          }
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await apiClient.api.login({
        login: credentials.login,
        password: credentials.password,
      });

      const mapped = mapApiUsuarioToUiUser(result.user);
      const token = result.jwt?.trim() || getAuthTokenFromCookies();
      const msg = (result.user.mensagem ?? "").trim();
      const looksSuccess = msg.toLowerCase().includes("sucesso");

      if (!token) {
        if (result.user.senhaExpirada) {
          throw new Error(msg || "Senha expirada. Solicite redefinição de senha.");
        }
        if (result.user.sessaoRegistrada === false) {
          throw new Error(msg || "Sessão não registrada. Tente novamente ou solicite desbloqueio.");
        }
        if (result.user.autenticado === false) {
          throw new Error(msg || "Usuário não autenticado. Verifique suas credenciais.");
        }
        if (!looksSuccess && msg) throw new Error(msg);

        persistSession(mapped, null);
        setUser(mapped);
        setIsAuthenticated(true);

        const ok = await apiClient.api.isAuthenticated().catch(() => false);
        if (!ok) {
          throw new Error("Sessão não validada após o login. Verifique se o cookie `token` está sendo aceito pelo navegador.");
        }

        navigate("/dashboard");
        return;
      }

      apiClient.tokenStore.setTokens({
        accessToken: token,
        refreshToken: result.refreshToken ?? null,
      });

      persistSession(mapped, token);

      const enriched = await enrichUserWithCompany(mapped);
      if (enriched !== mapped) {
        localStorage.setItem('herz_user_data', JSON.stringify(enriched));
      }

      setUser(enriched);
      setIsAuthenticated(true);

      const ok = await apiClient.api.isAuthenticated().catch(() => false);
      if (!ok) throw new Error("Sessão não validada após o login. Verifique token/cookie e CORS do backend.");

      navigate('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('herz_user_data', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, updateUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
