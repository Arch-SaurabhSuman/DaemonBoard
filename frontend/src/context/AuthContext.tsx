import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import apiClient from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  getAuditLogs: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('db_token');
      const savedUser = localStorage.getItem('db_user');
      const savedMockMode = localStorage.getItem('db_mock_mode') === 'true';

      if (savedMockMode) {
        setIsMockMode(true);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
        return;
      }

      if (token && savedUser) {
        try {
          // Attempt to verify token with backend using a me request
          const response = await apiClient.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('db_user', JSON.stringify(response.data));
          setIsMockMode(false);
        } catch (err) {
          console.warn("Backend token validation failed. Retaining local session.", err);
          setUser(JSON.parse(savedUser));
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // Default mock accounts
    const mockUsers: Record<string, User> = {
      admin: { id: 'u-1', username: 'admin', email: 'admin@daemonboard.io', role: 'Administrator', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' },
      alex: { id: 'u-2', username: 'alex', email: 'alex@daemonboard.io', role: 'Junior Frontend Developer', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
      sarah: { id: 'u-3', username: 'sarah', email: 'sarah@daemonboard.io', role: 'Senior DevOps Engineer', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
    };

    try {
      // 1. Attempt backend authentication
      const response = await apiClient.post('/auth/login', { username, password })
        .catch((err) => {
          if (!err.response) {
            throw new Error('SERVER_OFFLINE');
          }
          throw err;
        });

      const { token, refreshToken, user: backendUser } = response.data;
      localStorage.setItem('db_token', token);
      localStorage.setItem('db_refresh_token', refreshToken);
      localStorage.setItem('db_user', JSON.stringify(backendUser));
      localStorage.setItem('db_mock_mode', 'false');
      
      setUser(backendUser);
      setIsMockMode(false);
    } catch (err: any) {
      console.log("Auth attempt details:", err);
      
      // Fallback to Mock Mode if server is offline or if mock login is requested
      if (err.message === 'SERVER_OFFLINE' || err.response?.status === 404 || username in mockUsers) {
        console.warn("Using mock auth fallback mode");
        const matchedUser = mockUsers[username.toLowerCase()] || {
          id: 'u-temp',
          username: username,
          email: `${username}@daemonboard.io`,
          role: 'Developer',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
        };

        // Simulate successful login
        localStorage.setItem('db_token', 'mock-jwt-token-xyz-123');
        localStorage.setItem('db_refresh_token', 'mock-refresh-token-xyz-123');
        localStorage.setItem('db_user', JSON.stringify(matchedUser));
        localStorage.setItem('db_mock_mode', 'true');

        setUser(matchedUser);
        setIsMockMode(true);
      } else {
        setError(err.response?.data?.message || err.message || 'Authentication failed');
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/register', { username, email, password })
        .catch((err) => {
          if (!err.response) {
            throw new Error('SERVER_OFFLINE');
          }
          throw err;
        });

      const { token, refreshToken, user: backendUser } = response.data;
      localStorage.setItem('db_token', token);
      localStorage.setItem('db_refresh_token', refreshToken);
      localStorage.setItem('db_user', JSON.stringify(backendUser));
      localStorage.setItem('db_mock_mode', 'false');

      setUser(backendUser);
      setIsMockMode(false);
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE' || err.response?.status === 404) {
        // Fallback mock registration
        console.warn("Registering mock user");
        const mockUser: User = {
          id: `u-${Math.random().toString(36).substr(2, 9)}`,
          username,
          email,
          role: 'Developer',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
        };

        localStorage.setItem('db_token', 'mock-jwt-token-xyz-123');
        localStorage.setItem('db_refresh_token', 'mock-refresh-token-xyz-123');
        localStorage.setItem('db_user', JSON.stringify(mockUser));
        localStorage.setItem('db_mock_mode', 'true');

        setUser(mockUser);
        setIsMockMode(true);
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed');
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('db_token');
    localStorage.removeItem('db_refresh_token');
    localStorage.removeItem('db_user');
    localStorage.removeItem('db_mock_mode');
    setUser(null);
    setIsMockMode(false);
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    if (isMockMode) {
      // Mock flow
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`[MOCK] Forgot password email instructions sent to ${email}`);
      return;
    }

    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send password reset request');
      throw err;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setError(null);
    if (isMockMode) {
      // Mock flow
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`[MOCK] Reset password successfully using token ${token}`);
      return;
    }

    try {
      await apiClient.post('/auth/reset-password', { token, password: newPassword });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    }
  };

  const verifyEmail = async (token: string) => {
    setError(null);
    if (isMockMode) {
      // Mock flow
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`[MOCK] Verified email successfully using token ${token}`);
      if (user) {
        setUser({ ...user, isVerified: true });
        localStorage.setItem('db_user', JSON.stringify({ ...user, isVerified: true }));
      }
      return;
    }

    try {
      await apiClient.get(`/auth/verify-email?token=${token}`);
      // Refresh current user state
      if (user) {
        setUser({ ...user, isVerified: true });
        localStorage.setItem('db_user', JSON.stringify({ ...user, isVerified: true }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email verification failed');
      throw err;
    }
  };

  const getAuditLogs = async (): Promise<any[]> => {
    if (isMockMode) {
      // Return mock logs
      const mockAuditLogs = [
        { id: '1', userId: 'u-1', action: 'login_success', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', details: 'Successful login session initialized for user: admin', createdAt: new Date().toISOString() },
        { id: '2', userId: 'u-2', action: 'token_refresh', ipAddress: '192.168.1.15', userAgent: 'Chrome/114.0.0.0', details: 'Rotated refresh token context session for user: alex', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', userId: 'u-3', action: 'register', ipAddress: '10.0.0.4', userAgent: 'Firefox/115.0.0.0', details: 'User registered with email: sarah@daemonboard.io. Assigned role: Senior DevOps Engineer', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: '4', userId: 'u-1', action: 'email_verified', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', details: 'User: admin successfully verified email address.', createdAt: new Date(Date.now() - 14400000).toISOString() }
      ];
      return mockAuditLogs;
    }

    try {
      const response = await apiClient.get('/admin/audit-logs');
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit logs');
      throw err;
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isMockMode,
        error,
        login,
        register,
        logout,
        clearError,
        forgotPassword,
        resetPassword,
        verifyEmail,
        getAuditLogs,
      }}
    >
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
