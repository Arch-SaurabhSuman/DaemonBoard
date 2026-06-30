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
          // Attempt to verify token with backend
          // If we succeed, keep the session
          // For now, since Phase 5 auth isn't fully implemented in the Go backend,
          // if the backend request fails, we fall back to mock mode or keep the local session.
          setUser(JSON.parse(savedUser));
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
      // We wrap it in a try-catch to automatically fall back to Mock mode if the Go server is offline.
      const response = await apiClient.post('/auth/login', { username, password })
        .catch((err) => {
          // Server offline or endpoint not ready yet
          if (!err.response) {
            throw new Error('SERVER_OFFLINE');
          }
          throw err;
        });

      const { token, user: backendUser } = response.data;
      localStorage.setItem('db_token', token);
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

      const { token, user: backendUser } = response.data;
      localStorage.setItem('db_token', token);
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
    localStorage.removeItem('db_user');
    localStorage.removeItem('db_mock_mode');
    setUser(null);
    setIsMockMode(false);
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
