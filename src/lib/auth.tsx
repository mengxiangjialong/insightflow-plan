import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string;
  provider?: "local" | "github";
};

type Ctx = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  /** 第三方（GitHub）登录：用后端返回的 JWT 换取用户信息 */
  loginWithToken: (token: string) => Promise<AuthUser>;
  logout: () => void;
  update: (patch: Partial<AuthUser>) => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  login: async () => ({ id: "", name: "", email: "", role: "user" }),
  register: async () => ({ id: "", name: "", email: "", role: "user" }),
  loginWithToken: async () => ({ id: "", name: "", email: "", role: "user" }),
  logout: () => {},
  update: () => {},
});

const KEY = "inkplan.auth.user";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const ADMIN_EMAIL = "admin@163.com";
const ADMIN_PASSWORD = "admin";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const loginWithTokenRef = useRef<((token: string) => Promise<AuthUser>) | null>(null);

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
    if (!email || !password) throw new Error("请输入邮箱与密码");
    const mail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(mail)) throw new Error("邮箱格式不正确");
    const isAdmin = mail === ADMIN_EMAIL;
    if (isAdmin && password !== ADMIN_PASSWORD) throw new Error("管理员密码错误");
    if (!isAdmin && password.length < 6) throw new Error("密码至少 6 位");
    // 登录一律走 task-backend 接口
    const { api, apiErrorText } = await import("./api");
    try {
      const { token } = await api.login(mail, password);
      return await loginWithTokenRef.current!(token);
    } catch (e) {
      throw new Error(apiErrorText(e));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error("请填写完整信息");
    const mail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(mail)) throw new Error("邮箱格式不正确");
    if (mail === ADMIN_EMAIL) throw new Error("该邮箱为系统保留账号，无法注册");
    if (password.length < 6) throw new Error("密码至少 6 位");
    const { api, apiErrorText } = await import("./api");
    try {
      const { token } = await api.register(name.trim(), mail, password);
      return await loginWithTokenRef.current!(token);
    } catch (e) {
      throw new Error(apiErrorText(e));
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem("inkplan.token");
    persist(null);
  }, []);

  const loginWithToken = useCallback(async (token: string) => {
    if (!token) throw new Error("登录凭证无效");
    window.localStorage.setItem("inkplan.token", token);
    const { api } = await import("./api");
    const me = (await api.me()) as {
      id: string | number;
      name?: string;
      email?: string;
      role?: string;
      avatarUrl?: string;
    };
    const mail = (me.email ?? "").toLowerCase();
    const u: AuthUser = {
      id: String(me.id),
      name: me.name || mail.split("@")[0] || "学习者",
      email: mail,
      role: me.role === "admin" || mail === ADMIN_EMAIL ? "admin" : "user",
      avatarUrl: me.avatarUrl,
      provider: "github",
    };
    persist(u);
    return u;
  }, []);

  useEffect(() => {
    loginWithTokenRef.current = loginWithToken;
  }, [loginWithToken]);

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
    <AuthCtx.Provider value={{ user, login, register, loginWithToken, logout, update }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);