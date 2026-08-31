import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  googleLogin: (name: string, email: string, avatar?: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('scan_stay_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('scan_stay_token');
      if (storedToken) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (err) {
          console.error('Session expired, logging out', err);
          localStorage.removeItem('scan_stay_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('scan_stay_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.signup(data);
      localStorage.setItem('scan_stay_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (name: string, email: string, avatar?: string) => {
    setIsLoading(true);
    try {
      const res = await api.googleLogin(name, email, avatar);
      localStorage.setItem('scan_stay_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    if (role === 'admin') {
      await login('admin@scanstay.com', 'admin123');
    } else if (role === 'receptionist') {
      await login('reception@scanstay.com', 'reception123');
    } else {
      await login('guest@scanstay.com', 'guest123');
    }
  };

  const logout = () => {
    localStorage.removeItem('scan_stay_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        googleLogin,
        loginAsDemo,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
