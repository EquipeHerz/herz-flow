import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  createUser: (data: RegisterData) => Promise<void>;
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        const storedToken = localStorage.getItem('herz_auth_token');

        // Validate if user has required basic fields
        const isValidUser = storedUser && 
                            storedUser.id &&
                            storedUser.role;

        if (isValidUser && storedToken) {
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          // Do NOT automatically logout/clear here if it's just a missing token on public pages
          // But if we are initializing, we should ensure clean state
          if (storedUser || storedToken) {
             authService.logout();
          }
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
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
      const { user, token } = await authService.login(credentials);
      setUser(user);
      setIsAuthenticated(true);
      // Redirect based on role
      navigate('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { user, token } = await authService.register(data);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await authService.createUser(data);
      // Do not log in or navigate automatically here, let component handle success
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      // In a real app, call API to update user
      // For now, update local state and storage
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, createUser, updateUser, logout, isLoading }}>
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