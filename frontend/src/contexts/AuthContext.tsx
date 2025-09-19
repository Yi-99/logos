import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import supabase from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  getSessionDuration: () => number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loginTime: null,
    sessionDuration: 0
  });

  // Calculate session duration every minute
  useEffect(() => {
    if (authState.loginTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - authState.loginTime!.getTime()) / (1000 * 60));
        setAuthState(prev => ({ ...prev, sessionDuration: duration }));
      }, 60000); // Update every minute

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
    
    // Store in localStorage for persistence
    localStorage.setItem('authState', JSON.stringify({
      user: { ...user, lastLoginAt: loginTime.toISOString() },
      loginTime: loginTime.toISOString()
    }));
  };

  const logout = () => {
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
      
      // Update localStorage
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

  // Supabase authentication methods
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || data.user.email || '',
        lastLoginAt: new Date().toISOString(),
      };
      login(user);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: fullName,
        lastLoginAt: new Date().toISOString(),
      };
      login(user);
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/philosophers`,
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    logout();
  };

  // Restore auth state from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Listen for auth state changes (including OAuth callbacks)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || '',
            lastLoginAt: new Date().toISOString(),
          };
          login(user);
        } else if (event === 'SIGNED_OUT') {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUser,
      getSessionDuration,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
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
