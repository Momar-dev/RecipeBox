import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthState } from '../types';
import { authService, authStorage } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérification de validité du jeton au montage
  const refreshUser = useCallback(async () => {
    const savedToken = authStorage.getToken();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authService.getMe(savedToken);
      if (me) {
        setUser(me);
        setToken(savedToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setToken(result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authService.register(email, password, name);
      setUser(result.user);
      setToken(result.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
