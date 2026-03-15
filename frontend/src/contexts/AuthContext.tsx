import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import * as cognito from '@/lib/cognito';

interface AuthContextType extends AuthState {
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  getSessionDuration: () => number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loginTime: null,
    sessionDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Calculate session duration every minute
  useEffect(() => {
    if (authState.loginTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - authState.loginTime!.getTime()) / (1000 * 60));
        setAuthState(prev => ({ ...prev, sessionDuration: duration }));
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [authState.loginTime]);

  const login = (user: User) => {
    const loginTime = new Date();
    setAuthState({
      user: { ...user, lastLoginAt: loginTime.toISOString() },
      isAuthenticated: true,
      loginTime,
      sessionDuration: 0
    });

    localStorage.setItem('authState', JSON.stringify({
      user: { ...user, lastLoginAt: loginTime.toISOString() },
      loginTime: loginTime.toISOString()
    }));
  };

  const logout = () => {
    cognito.signOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loginTime: null,
      sessionDuration: 0
    });
    localStorage.removeItem('authState');
  };

  const updateUser = (userUpdates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userUpdates };
      setAuthState(prev => ({ ...prev, user: updatedUser }));

      const stored = localStorage.getItem('authState');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('authState', JSON.stringify({
          ...parsed,
          user: updatedUser
        }));
      }
    }
  };

  const getSessionDuration = () => {
    if (!authState.loginTime) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - authState.loginTime.getTime()) / (1000 * 60));
  };

  const signIn = async (email: string, password: string) => {
    const cognitoUser = await cognito.signIn(email, password);
    login({
      id: cognitoUser.id,
      email: cognitoUser.email,
      name: cognitoUser.name,
      lastLoginAt: new Date().toISOString(),
    });
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    await cognito.signUp(email, password, fullName);
    // User needs to confirm their email before signing in
    // The UI should prompt for the confirmation code
  };

  const signInWithGoogle = () => {
    cognito.signInWithGoogle();
  };

  const signOut = () => {
    logout();
  };

  const resetPassword = async (email: string) => {
    await cognito.forgotPassword(email);
  };

  // Restore auth state on mount
  useEffect(() => {
    const init = async () => {
      // First try to get a valid Cognito session
      const cognitoUser = await cognito.getCurrentUser();
      if (cognitoUser) {
        login({
          id: cognitoUser.id,
          email: cognitoUser.email,
          name: cognitoUser.name,
          lastLoginAt: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }

      // Fall back to localStorage for fast hydration
      const stored = localStorage.getItem('authState');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const loginTime = new Date(parsed.loginTime);
          const now = new Date();
          const sessionDuration = Math.floor((now.getTime() - loginTime.getTime()) / (1000 * 60));

          setAuthState({
            user: parsed.user,
            isAuthenticated: true,
            loginTime,
            sessionDuration
          });
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          localStorage.removeItem('authState');
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      isLoading,
      login,
      logout,
      updateUser,
      getSessionDuration,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword
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
