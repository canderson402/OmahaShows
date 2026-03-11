import { useState, useEffect, useRef } from "react";
import { supabase, getSession, signOut } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const intentionalLogout = useRef(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    // Get initial session
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to get session:', err);
      setLoading(false);
    });

    // Listen for auth changes - delay to avoid SSR issues
    const setupSubscription = () => {
      try {
        const result = supabase.auth.onAuthStateChange((event, newSession) => {
          if (event === 'SIGNED_OUT' || intentionalLogout.current) {
            setSession(null);
            intentionalLogout.current = false;
          } else if (newSession) {
            setSession(newSession);
          }
        });
        subscription = result.data.subscription;
      } catch (err) {
        console.error('Failed to setup auth subscription:', err);
      }
    };

    // Small delay to ensure client-side hydration is complete
    const timeout = setTimeout(setupSubscription, 0);

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
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
