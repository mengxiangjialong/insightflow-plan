import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "登录 · 墨策" },
      { name: "description", content: "登录墨策学习计划平台，继续你的学习旅程。" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate({ to: u.role === "admin" ? "/admin" : "/dashboard" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="欢迎回来" subtitle="登录继续你的学习计划">
      <form onSubmit={submit} className="space-y-4">
        <Input label="邮箱" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="密码" type="password" value={password} onChange={setPassword} placeholder="至少 6 位" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 font-bold text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          登录
        </button>
        <p className="text-center text-sm text-secondary">
          还没有账号？<Link to="/register" className="text-primary hover:underline">立即注册</Link>
        </p>
        <p className="text-center font-mono text-xs text-secondary">
          提示：邮箱以 admin 开头登录为管理员
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-ink font-bold text-background">墨</span>
          <span className="font-bold">墨策</span>
        </Link>
        <div className="animate-ink rounded-3xl border-2 border-border-subtle bg-card p-6 shadow-lg md:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-secondary">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Input({
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