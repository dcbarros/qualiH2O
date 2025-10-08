import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/axios";

type AuthState = {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: (token: string, username: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.interceptors.request.use(cfg => {
        cfg.headers = cfg.headers ?? {};
        cfg.headers.Authorization = `Bearer ${token}`;
        return cfg;
      });
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (username) localStorage.setItem("username", username);
    else localStorage.removeItem("username");
  }, [username]);

  const value = useMemo<AuthContextType>(() => ({
    token, username, isAuthenticated: !!token,
    login: (tk, user) => { setToken(tk); setUsername(user); },
    logout: () => { setToken(null); setUsername(null); }
  }), [token, username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
