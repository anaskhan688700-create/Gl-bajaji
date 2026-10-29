import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: 'farmer' | 'admin' | 'agronomist';
  login: (email: string) => Promise<boolean>;
  signup: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: 'farmer' | 'admin') => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'usr-farmer-01',
    name: 'Ramesh Kumar',
    email: 'ramesh@kisanrakshak.in',
    phone: '+91 98765 43210',
    role: 'farmer',
    preferredLanguage: 'hi',
    state: 'Haryana',
    district: 'Karnal',
    createdAt: '2024-01-15T08:00:00Z',
  });
  const [token, setToken] = useState<string | null>('demo-jwt-token-usr-farmer-01');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Attempt fetch user info
    fetch('/api/v1/auth/me', {
      headers: { 'x-user-id': user?.id || 'usr-farmer-01' },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    return false;
  };

  const signup = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    return false;
  };

  const switchDemoRole = async (targetRole: 'farmer' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'farmer',
        login,
        signup,
        logout,
        switchDemoRole,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

