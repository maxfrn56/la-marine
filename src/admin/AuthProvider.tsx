import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "../api/client";
import type { Admin } from "../api/types";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checking, setChecking] = useState(true);

  // Au chargement, on vérifie si le cookie de session est encore valide.
  useEffect(() => {
    api
      .me()
      .then(({ admin }) => setAdmin(admin))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { admin } = await api.login(email, password);
    setAdmin(admin);
  }, []);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => null);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, checking, signIn, signOut }),
    [admin, checking, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
