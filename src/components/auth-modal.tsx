import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, UserPlus, X } from "lucide-react";
import { EMAIL_RE, useAuth } from "@/lib/auth";
import { GithubLoginButton } from "@/components/github-login-button";

export type AuthMode = "login" | "register";

export function AuthModal({
  mode,
  onClose,
  onModeChange,
}: {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (m: AuthMode) => void;
}) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => setErr(null), [mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!EMAIL_RE.test(email.trim())) {
      setErr("请输入有效的邮箱地址");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const u = await login(email, password);
        onClose();
        navigate({ to: u.role === "admin" ? "/admin" : "/dashboard" });
      } else {
        await register(name, email, password);
        onClose();
        navigate({ to: "/dashboard" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "登录" : "注册"}
        className="animate-ink relative w-full max-w-md rounded-3xl border-2 border-border-subtle bg-card p-6 shadow-xl md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-border-subtle hover:bg-surface"
        >
          <X className="size-4" />
        </button>
        <h2 className="text-2xl font-bold">{mode === "login" ? "欢迎回来" : "创建账号"}</h2>
        <p className="mb-6 mt-1 text-sm text-secondary">
          {mode === "login" ? "登录继续你的学习计划" : "30 秒开启你的学习旅程"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <Field label="昵称" value={name} onChange={setName} placeholder="你的名字" />
          )}
          <Field
            label="邮箱"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <Field
            label="密码"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="至少 6 位"
          />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 font-bold text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="size-4" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {mode === "login" ? "登录" : "注册"}
          </button>
          <p className="text-center text-sm text-secondary">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              type="button"
              onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              className="text-primary hover:underline"
            >
              {mode === "login" ? "立即注册" : "直接登录"}
            </button>
          </p>
          {mode === "login" && (
            <p className="text-center font-mono text-xs text-secondary">
              管理员账号：admin@163.com / admin
            </p>
          )}
        </form>
        <div className="mt-4">
          <GithubLoginButton onError={(m) => setErr(m || null)} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-xs uppercase tracking-widest text-secondary">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}