"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { insforge } from "@/lib/insforge/client";

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (cancelled) return;
        if (error || !data?.user) {
          setUser(null);
        } else {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.profile?.name ?? undefined,
          });
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
