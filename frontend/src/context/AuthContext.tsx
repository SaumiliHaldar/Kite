import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios, { type AxiosInstance } from 'axios';

interface AuthContextType {
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  api: AxiosInstance;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  isSignedIn: false,
  getToken: async () => null,
  api,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // Attach token interceptor
  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error("Error fetching Clerk token:", e);
        }
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [isSignedIn, getToken]);

  // Sync user with backend on sign in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const syncBackend = async () => {
        try {
          const token = await getToken();
          await axios.post(`${API_BASE_URL}/auth`, {
            clerk_id: user.id,
            username: user.username || user.firstName || `user_${user.id.slice(0, 8)}`,
            email: user.primaryEmailAddress?.emailAddress || `${user.id.slice(0, 8)}@kite.app`,
            avatar_url: user.imageUrl || '',
          }, {
            headers: {
              Authorization: `Bearer ${token || user.id}`
            }
          });
          console.log("Synced profile with Kite backend.");
        } catch (err) {
          console.error("Failed to sync profile with backend:", err);
        }
      };
      syncBackend();
    }
  }, [isLoaded, isSignedIn, user, getToken]);

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!isSignedIn, getToken, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useKiteAuth = () => useContext(AuthContext);
export { api };
