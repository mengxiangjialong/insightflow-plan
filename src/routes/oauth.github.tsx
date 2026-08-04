import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/oauth/github")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "GitHub 登录回调 · 墨策" },
      { name: "description", content: "正在完成 GitHub 账号登录授权。" },
    ],
  }),
  component: GithubCallbackPage,
});

function GithubCallbackPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const token = params.get("token");
    if (error || !token) {
      setErr(error ? decodeURIComponent(error) : "缺少登录凭证");
      return;
    }
    loginWithToken(token)
      .then((u) => navigate({ to: u.role === "admin" ? "/admin" : "/dashboard" }))
      .catch((e) => setErr(e instanceof Error ? e.message : "GitHub 登录失败"));
  }, [loginWithToken, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <div className="card-ink w-full max-w-md p-8 text-center">
        <h1 className="text-xl font-bold">GitHub 登录</h1>
        {err ? (
          <>
            <p className="mt-3 text-sm text-red-500">{err}</p>
            <Link to="/login" className="mt-6 inline-block text-sm text-primary hover:underline">
              返回登录页
            </Link>
          </>
        ) : (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-secondary">
            <Loader2 className="size-4 animate-spin" /> 正在完成授权…
          </p>
        )}
      </div>
    </main>
  );
}
