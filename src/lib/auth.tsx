import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type Ctx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  update: (patch: Partial<AuthUser>) => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  login: async () => ({ id: "", name: "", email: "", role: "user" }),
  register: async () => ({ id: "", name: "", email: "", role: "user" }),
  logout: () => {},
  update: () => {},
});

const KEY = "inkplan.auth.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) window.localStorage.setItem(KEY, JSON.stringify(u));
    else window.localStorage.removeItem(KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 300));
    if (!email || !password) throw new Error("请输入邮箱与密码");
    const isAdmin = email.startsWith("admin");
    const u: AuthUser = {
      id: isAdmin ? "admin-1" : `u-${email}`,
      name: isAdmin ? "管理员" : email.split("@")[0] || "学习者",
      email,
      role: isAdmin ? "admin" : "user",
    };
    window.localStorage.setItem("inkplan.token", "mock-token");
    persist(u);
    return u;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!name || !email || !password) throw new Error("请填写完整信息");
    const u: AuthUser = { id: `u-${Date.now()}`, name, email, role: "user" };
    window.localStorage.setItem("inkplan.token", "mock-token");
    persist(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("inkplan.token");
    persist(null);
  }, []);

  const update = useCallback(
    (patch: Partial<AuthUser>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        window.localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return (
    <AuthCtx.Provider value={{ user, login, register, logout, update }}>{children}</AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);