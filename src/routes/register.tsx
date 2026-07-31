import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { EMAIL_RE, useAuth } from "@/lib/auth";
import { AuthShell, Input } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "注册 · 墨策" },
      { name: "description", content: "注册墨策账号，开启 AI 驱动的个性化学习旅程。" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!EMAIL_RE.test(email.trim())) {
      setErr("请输入有效的邮箱地址");
      return;
    }
    if (password.length < 6) {
      setErr("密码至少 6 位");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate({ to: "/dashboard" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="创建账号" subtitle="30 秒开启你的学习旅程">
      <form onSubmit={submit} className="space-y-4">
        <Input label="昵称" value={name} onChange={setName} placeholder="你的名字" />
        <Input label="邮箱" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="密码" type="password" value={password} onChange={setPassword} placeholder="至少 6 位" />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 font-bold text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          注册
        </button>
        <p className="text-center text-sm text-secondary">
          已有账号？<Link to="/login" className="text-primary hover:underline">直接登录</Link>
        </p>
      </form>
    </AuthShell>
  );
}