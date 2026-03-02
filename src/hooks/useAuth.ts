import { useState, useEffect, useRef } from "react";
import { supabase, getSession, signOut } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const intentionalLogout = useRef(false);

  useEffect(() => {
    // Get initial session
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // Listen for auth changes - only update if it's a real auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Only clear session on explicit sign out, not on token refresh events
      if (event === 'SIGNED_OUT' || intentionalLogout.current) {
        setSession(null);
        intentionalLogout.current = false;
      } else if (newSession) {
        setSession(newSession);
      }
      // Ignore temporary null sessions during token refresh
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    intentionalLogout.current = true;
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
