/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthContext } from "@/lib/auth";

let clientPromise: Promise<any> | null = null;
function getClient() {
  if (!clientPromise) {
    clientPromise = import("@/utils/supabase/client").then((m) => m.createClient());
  }
  return clientPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const signIn = async (email: string, password: string) => {
    const supabase = await getClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const supabase = await getClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const supabase = await getClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
