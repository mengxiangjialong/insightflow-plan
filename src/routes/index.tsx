import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, PlayCircle, Flame, Target, LineChart } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Moon, Sun } from "lucide-react";
import { AuthModal, type AuthMode } from "@/components/auth-modal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "墨策 · 今天开始，遇见更好的自己" },
      { name: "description", content: "AI 驱动的学习计划平台 — 生成计划、每日打卡、成长可视化。" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-ink font-bold text-background">墨</span>
          <span className="font-bold tracking-tight">墨策</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="切换主题"
            className="grid size-9 place-items-center rounded-full border border-border-subtle hover:bg-surface"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {user ? (
            <Link to="/dashboard" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background">
              进入仪表盘
            </Link>
          ) : (
            <>
              <button onClick={() => setAuthMode("login")} className="text-sm text-secondary hover:text-ink">
                登录
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background"
              >
                注册
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-28">
          <div className="animate-ink mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-1.5 font-mono text-xs">
            <Sparkles className="size-3.5 text-primary" /> AI × 结构化学习
          </div>
          <h1 className="animate-ink text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            今天开始，坚持学习，
            <br />
            <span className="text-primary">遇见更好的自己。</span>
          </h1>
          <p className="animate-ink mx-auto mt-6 max-w-2xl text-secondary md:text-lg" style={{ animationDelay: "120ms" }}>
            让 AI 为你量身定制学习路径，每日任务清晰可执行，进度成长看得见。
          </p>
          <div className="animate-ink mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "200ms" }}>
            {user ? (
              <Link
                to="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-background transition-all hover:opacity-90"
              >
                <PlayCircle className="size-5" />
                开始学习
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                onClick={() => setAuthMode("register")}
                className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-background transition-all hover:opacity-90"
              >
                <PlayCircle className="size-5" />
                开始学习
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <Link
              to="/plans/new"
              className="flex items-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-medium text-ink hover:bg-surface"
            >
              <Sparkles className="size-5" />
              AI 生成计划
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
          <Feature icon={Sparkles} title="AI 个性化路径" desc="根据目标、水平与可投入时间生成分阶段计划。" />
          <Feature icon={Target} title="每日任务打卡" desc="清单化今日任务，一键完成，坚持有反馈。" />
          <Feature icon={LineChart} title="成长看得见" desc="日历热力图 + 成长曲线，学习进步可视化。" />
        </section>
      </main>

      <footer className="border-t border-border-subtle py-8 text-center font-mono text-xs text-secondary">
        <Flame className="mx-auto mb-2 size-4 text-primary" />
        MOCE · KEEP LEARNING · {new Date().getFullYear()}
      </footer>

      {authMode && (
        <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} />
      )}
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Sparkles; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-card p-6">
      <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-secondary">{desc}</p>
    </div>
  );
}