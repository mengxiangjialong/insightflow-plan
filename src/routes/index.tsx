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
      { name: "description", content: "墨策学习计划平台 — 定制学习路径、每日任务打卡、成长数据可视化。" },
      { property: "og:title", content: "墨策 · 今天开始，遇见更好的自己" },
      { property: "og:description", content: "定制学习路径、每日任务打卡、成长数据可视化。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <header className="sticky top-0 z-40 border-b border-border-subtle/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-ink font-bold text-background">墨</span>
          <span className="font-bold tracking-tight">墨策</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
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
      </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-3xl px-5 pb-14 pt-16 text-center md:pb-24 md:pt-28">
          <div className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-64 max-w-3xl rounded-full bg-primary/5 blur-3xl" />
          <div className="relative">
          <p className="animate-ink mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-secondary">
            <Flame className="size-3.5 text-primary" /> keep learning every day
          </p>
          <h1 className="animate-ink text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            今天开始，坚持学习，
            <br />
            <span className="text-primary">遇见更好的自己。</span>
          </h1>
          <p className="animate-ink mx-auto mt-5 max-w-xl text-secondary md:mt-6 md:text-lg" style={{ animationDelay: "120ms" }}>
            为你量身定制学习路径，让每一次坚持都留下痕迹。
          </p>
          <div className="animate-ink mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:mt-10" style={{ animationDelay: "200ms" }}>
            {user ? (
              <Link
                to="/dashboard"
                className="group flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-background transition-all hover:opacity-90"
              >
                <PlayCircle className="size-5" />
                开始学习
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                onClick={() => setAuthMode("register")}
                className="group flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-background transition-all hover:opacity-90"
              >
                <PlayCircle className="size-5" />
                开始学习
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <Link
              to="/plans/new"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-ink px-6 py-3 font-medium text-ink hover:bg-surface"
            >
              <Sparkles className="size-5" />
              生成学习计划
            </Link>
          </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-5 pb-20 sm:grid-cols-3 md:gap-6 md:px-6 md:pb-24">
          <Feature icon={Sparkles} title="学习路径" desc="围绕目标与可投入时间，梳理清晰的学习节奏。" />
          <Feature icon={Target} title="专注执行" desc="把目标拆成能落地的动作，坚持有反馈。" />
          <Feature icon={LineChart} title="持续积累" desc="记录学习轨迹，让进步有迹可循。" />
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
    <div className="rounded-3xl border border-border-subtle bg-card p-6 transition-colors hover:border-primary/40">
      <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-secondary">{desc}</p>
    </div>
  );
}