/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { User } from "@supabase/supabase-js";
import { useState, useEffect, createContext, useContext } from "react";

let clientPromise: Promise<any> | null = null;

function getClient() {
  if (!clientPromise) {
    clientPromise = import("@/utils/supabase/client").then((m) => m.createClient());
  }
  return clientPromise;
}

export async function signUp(email: string, password: string) {
  const supabase = await getClient();
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const supabase = await getClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = await getClient();
  return supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await getClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient().then((supabase) => {
      supabase.auth.getUser().then(({ data }: any) => {
        setUser(data.user);
      }).finally(() => setLoading(false));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  return { user, loading };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function useSupabaseAuth() {
  return useContext(AuthContext);
}
