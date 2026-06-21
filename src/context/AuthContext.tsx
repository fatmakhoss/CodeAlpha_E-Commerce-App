import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppSession, AppUser, authApi, tokenStore } from '../lib/api';
import { Profile } from '../types';

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuthUser = (authUser: AppUser | null, token = tokenStore.get()) => {
    setUser(authUser);
    setSession(authUser && token ? { token } : null);
    setProfile(authUser ? {
      id: authUser.id,
      full_name: authUser.name,
      role: authUser.role,
      created_at: '',
    } : null);
  };

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then(authUser => setAuthUser(authUser, token))
      .catch(() => {
        tokenStore.clear();
        setAuthUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { token, user: authUser } = await authApi.register(fullName, email, password);
      setAuthUser(authUser, token);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create account.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, user: authUser } = await authApi.login(email, password);
      setAuthUser(authUser, token);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to sign in.' };
    }
  };

  const signOut = async () => {
    tokenStore.clear();
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin: profile?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
