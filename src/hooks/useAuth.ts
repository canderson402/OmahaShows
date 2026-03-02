import { useState, useEffect } from "react";
import { supabase, getSession, signOut } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
    setSession(null);
  };

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    loading,
    logout,
  };
}
