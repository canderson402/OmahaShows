'use client'

import { useState, useEffect, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const intentionalLogout = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (mounted) {
        setSession(s);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to get session:', err);
      if (mounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || intentionalLogout.current) {
        setSession(null);
        intentionalLogout.current = false;
      } else if (newSession) {
        setSession(newSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    intentionalLogout.current = true;
    await supabase.auth.signOut();
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
