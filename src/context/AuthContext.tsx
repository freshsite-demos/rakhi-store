import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeAdmin } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  adminEmail: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsAuthenticated(false);
      setAdminEmail(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getMeAdmin();
      if (response.success && response.admin) {
        setIsAuthenticated(true);
        setAdminEmail(response.admin.email);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to verify token', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string, email: string) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
    setAdminEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setAdminEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, adminEmail, login, logout }}>
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
