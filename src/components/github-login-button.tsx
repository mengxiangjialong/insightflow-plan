import { useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { api, apiMeta } from "@/lib/api";

/** GitHub 账号登录入口：向后端取授权地址并整页跳转。 */
export function GithubLoginButton({ onError }: { onError?: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);

  const start = async () => {
    onError?.("");
    if (!apiMeta.configured) {
      onError?.("GitHub 登录需连接后端（配置 VITE_API_BASE_URL 与 GitHub OAuth App）");
      return;
    }
    setLoading(true);
    try {
      const { url } = await api.githubAuthUrl();
      window.location.href = url;
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "无法启动 GitHub 登录");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border-subtle" />
        <span className="font-mono text-xs uppercase tracking-widest text-secondary">或</span>
        <span className="h-px flex-1 bg-border-subtle" />
      </div>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-border-subtle bg-surface py-3 font-bold hover:bg-card disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
        使用 GitHub 账号登录
      </button>
    </div>
  );
}
