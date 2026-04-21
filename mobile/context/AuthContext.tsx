import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getToken, saveTokens, clearTokens } from '../utils/auth';

interface UserProfile {
  username: string;
  name: string;
  surname: string;
  city?: string;
  description: string;
  joinedAt: string;
  isApproved: boolean;
  karmaScore: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user", error);
      // Attempt to clear if token is invalid
      setUser(null);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (token) {
        // Token exists in local storage, fetch user details
        await fetchCurrentUser();
      } else {
        setUser(null);
      }
    } catch (e) {
      console.warn('Auth check failed:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (token: string, refreshToken: string) => {
    setIsLoading(true);
    await saveTokens(token, refreshToken);
    // After saving token, Axios interceptor will use it. Now fetch user
    await fetchCurrentUser();
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await clearTokens();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
