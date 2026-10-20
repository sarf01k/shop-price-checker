import { createContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/services";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    authApi
      .getSession()
      .then((session) => {
        if (alive) {
          setUser(session);
        }
      })
      .catch((error) => {
        console.error("Failed to retrieve auth session:", error);
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    const off = authApi.onChange?.((session) => {
      setUser(session);
    });

    return () => {
      alive = false;
      off?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,

      signIn: async (email, password) => {
        const session = await authApi.signIn(email, password);
        setUser(session);
        return session;
      },

      signOut: async () => {
        await authApi.signOut();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
