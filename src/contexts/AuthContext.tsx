
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, Session } from '@/integrations/supabase/client';
import { ErrorService } from '@/services/errorService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Configuration sécurisée du client Supabase
    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            // Jamais d'email ni de PII dans les logs — uniquement l'événement.
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
              setSession(session);
              setUser(session?.user ?? null);
            }
            
            if (mounted) {
              setLoading(false);
            }
          }
        );

        // THEN check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          ErrorService.logError(error, { context: 'Auth initialization' });
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        ErrorService.logError(error as Error, { context: 'Auth initialization' });
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      mounted = false;
      cleanup.then(fn => fn && fn());
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      if (error) {
        ErrorService.logError(error, { context: 'Sign in attempt' });
      }

      return { error };
    } catch (error) {
      const authError = error as Error;
      ErrorService.logError(authError, { context: 'Sign in exception' });
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        ErrorService.logError(error, { context: 'Sign up attempt' });
      }

      return { error };
    } catch (error) {
      const authError = error as Error;
      ErrorService.logError(authError, { context: 'Sign up exception' });
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        ErrorService.logError(error, { context: 'Sign out' });
        throw error;
      }
      
      // Clear local state immediately
      setSession(null);
      setUser(null);
    } catch (error) {
      ErrorService.logError(error as Error, { context: 'Sign out exception' });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        ErrorService.logError(error, { context: 'Session refresh' });
        throw error;
      }
    } catch (error) {
      ErrorService.logError(error as Error, { context: 'Session refresh exception' });
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
