import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithEntra: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  acceptTerms: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    
    setError('Benutzer nicht gefunden');
    setIsLoading(false);
    return false;
  }, []);

  const loginWithEntra = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate Microsoft Entra ID login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, randomly pick a user or simulate success
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    if (randomUser) {
      setUser({ ...randomUser, isFirstLogin: false });
      setIsLoading(false);
      return true;
    }
    
    setError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    setIsLoading(false);
    return false;
  }, []);

  const acceptTerms = useCallback(() => {
    if (user) {
      setUser({ ...user, isFirstLogin: false });
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithEntra,
      logout, 
      isAuthenticated: !!user,
      isLoading,
      error,
      acceptTerms,
    }}>
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
