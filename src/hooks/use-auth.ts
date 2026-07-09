import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [session, setSession] = useState<{ user: User } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setSession(u ? { user: u } : null);
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { session, user, loading };
}
