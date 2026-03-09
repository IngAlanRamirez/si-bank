"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User, Account, Movement } from "@/lib/types";
import {
  getCurrentUserId,
  setCurrentUserId,
  findUserById,
  findAccountByUserId,
  getMovementsByAccountId,
  getOnboardingComplete,
  createUser as storeCreateUser,
  loginUser as storeLoginUser,
  logoutUser as storeLogoutUser,
} from "@/lib/store";

type AuthState = {
  user: User | null;
  account: Account | null;
  movements: Movement[];
  isHydrated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (data: { name: string; email: string; password: string }) => {
    ok: boolean;
    error?: string;
  };
  logout: () => void;
  refreshMovements: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    account: null,
    movements: [],
    isHydrated: false,
  });

  const hydrate = useCallback(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setState({
        user: null,
        account: null,
        movements: [],
        isHydrated: true,
      });
      return;
    }
    const user = findUserById(userId);
    const account = user ? findAccountByUserId(user.id) : null;
    const movements = account ? getMovementsByAccountId(account.id) : [];
    setState({
      user: user ?? null,
      account: account ?? null,
      movements,
      isHydrated: true,
    });
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(
    (email: string, password: string) => {
      const user = storeLoginUser(email, password);
      if (!user) {
        return { ok: false, error: "Correo o contraseña incorrectos." };
      }
      hydrate();
      return { ok: true };
    },
    [hydrate]
  );

  const register = useCallback(
    (data: { name: string; email: string; password: string }) => {
      try {
        storeCreateUser({ name: data.name, email: data.email });
        const user = storeLoginUser(data.email, data.password);
        if (user) setCurrentUserId(user.id);
        hydrate();
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Error al crear la cuenta.",
        };
      }
    },
    [hydrate]
  );

  const logout = useCallback(() => {
    storeLogoutUser();
    setState({
      user: null,
      account: null,
      movements: [],
      isHydrated: true,
    });
  }, []);

  const refreshMovements = useCallback(() => {
    if (!state.account) return;
    const movements = getMovementsByAccountId(state.account.id);
    setState((s) => ({ ...s, movements }));
  }, [state.account?.id]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshMovements,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
