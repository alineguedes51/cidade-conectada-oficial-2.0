import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ id: string; fullName: string; whatsapp: string; role: string }>;
  signUp: (fullName: string, email: string, whatsapp: string, password: string) => Promise<{ id: string; fullName: string; whatsapp: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  updateProfileData: (fullName: string, whatsapp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    uid: data.id as string,
    fullName: data.fullName as string,
    email: data.email as string,
    whatsapp: data.whatsapp as string,
    role: data.role as UserProfile['role'],
    createdAt: data.createdAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profile = await fetchProfile(data.user.id);
    if (profile) setUserProfile(profile);
    return {
      id: data.user.id,
      fullName: profile?.fullName ?? email,
      whatsapp: profile?.whatsapp ?? '',
      role: profile?.role ?? 'comum',
    };
  };

  const signUp = async (fullName: string, email: string, whatsapp: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, whatsapp } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Falha ao criar usuário.');

    // Upsert profile (trigger may have already created it)
    await supabase.from('profiles').upsert({
      id: data.user.id,
      fullName,
      email,
      whatsapp,
      role: 'comum',
    });

    const profile: UserProfile = {
      uid: data.user.id,
      fullName,
      email,
      whatsapp,
      role: 'comum',
      createdAt: new Date().toISOString(),
    };
    setUserProfile(profile);

    return { id: data.user.id, fullName, whatsapp };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  };

  const loginAsDemoAdmin = async () => {
    await signIn('admin@igarassu.pe.gov.br', 'admin123');
  };

  const updateProfileData = async (fullName: string, whatsapp: string) => {
    if (!currentUser || !userProfile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ fullName, whatsapp })
      .eq('id', currentUser.id);
    if (error) throw new Error(error.message);
    setUserProfile({ ...userProfile, fullName, whatsapp });
  };

  useEffect(() => {
    // Fallback: se o Supabase não responder em 5s, libera a tela
    const timeout = setTimeout(() => setLoading(false), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        fetchProfile(user.id).then((profile) => {
          setUserProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        const profile = await fetchProfile(user.id);
        if (profile) {
          setUserProfile(profile);
        } else if (event === 'SIGNED_IN') {
          // Google OAuth or first sign-in where trigger may be delayed
          await supabase.from('profiles').upsert({
            id: user.id,
            fullName: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Cidadão',
            email: user.email ?? '',
            whatsapp: user.user_metadata?.whatsapp ?? '',
            role: 'comum',
          });
          const newProfile = await fetchProfile(user.id);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        loginAsDemoAdmin,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}
