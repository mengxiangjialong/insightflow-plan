import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Flame, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { todayTasks as initialTasks, currentPlan, stats } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const doneCount = tasks.filter((t) => t.done).length;
  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <AppShell title="学习仪表盘" breadcrumb="DASHBOARD / ACTIVE_PLAN_01">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 p-4 md:gap-8 md:p-10">
        <div className="col-span-12 space-y-8 lg:col-span-8">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <StatCard label="连续学习" mono="DAYS" delay={0}>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tighter">{stats.streakDays}</span>
                <Flame className="size-5 text-primary" />
              </div>
            </StatCard>
            <StatCard label="周进度" mono={`${Math.round(stats.weekProgress * 100)}%`} delay={60}>
              <RingProgress value={stats.weekProgress} />
            </StatCard>
            <div
              className="animate-ink flex flex-col justify-between rounded-3xl bg-ink p-6 text-background shadow-xl"
              style={{ animationDelay: "120ms" }}
            >
              <div className="text-sm font-medium opacity-60">今日任务</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tighter">
                  {doneCount}/{tasks.length}
                </span>
                <span className="font-mono text-xs opacity-60">COMPLETED</span>
              </div>
            </div>
          </section>

          <section className="animate-ink" style={{ animationDelay: "180ms" }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">今日任务 · 10月24日</h2>
              <Link
                to="/plans/$planId"
                params={{ planId: "p1" }}
                className="text-sm font-medium text-primary hover:underline"
              >
                管理计划
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={
                    "group flex w-full items-center gap-4 rounded-2xl border border-border-subtle p-4 text-left transition-all md:p-5 " +
                    (t.done ? "bg-surface/40 opacity-60" : "bg-card hover:shadow-sm")
                  }
                >
                  <span
                    className={
                      "grid size-6 shrink-0 place-items-center rounded border-2 transition-colors " +
                      (t.done
                        ? "border-ink bg-ink text-background"
                        : "border-border-subtle group-hover:border-primary")
                    }
                  >
                    {t.done ? <CheckCircle2 className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className={"truncate font-medium " + (t.done ? "line-through" : "")}>
                      {t.title}
                    </h3>
                    <p className="truncate text-sm text-secondary">{t.detail}</p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-surface-container px-3 py-1 font-mono text-xs sm:inline">
                    {t.category}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="animate-ink" style={{ animationDelay: "240ms" }}>
            <h2 className="mb-6 text-lg font-bold">计划阶段：{currentPlan.title}</h2>
            <div className="ml-3 space-y-8 border-l-2 border-border-subtle pl-8">
              {currentPlan.phases.map((ph) => (
                <div key={ph.id} className={"relative " + (ph.status === "locked" ? "opacity-50" : "")}>
                  <div
                    className={
                      "absolute -left-[37px] top-1 size-4 rounded-full border-4 border-background " +
                      (ph.status === "active" ? "bg-primary" : "bg-surface-container")
                    }
                  />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold">
                        第{ph.index}阶段：{ph.title}
                      </h4>
                      <p className="mt-1 text-sm text-secondary">{ph.summary}</p>
                    </div>
                    <div className="shrink-0 font-mono text-xs text-primary">
                      {ph.status === "active" ? "进行中" : ph.status === "done" ? "已完成" : "未解锁"}
                    </div>
                  </div>
                  {ph.progress > 0 && (
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${ph.progress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="col-span-12 space-y-6 lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="animate-ink rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 font-bold text-primary">
                  AI
                </div>
                <h3 className="font-bold">个性化计划生成器</h3>
              </div>
              <p className="mb-6 text-sm text-secondary">
                告诉 AI 你要学什么，我们为你规划分阶段学习路径。
              </p>
              <Link
                to="/plans/new"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-bold text-background transition-all hover:opacity-90"
              >
                <span>开始生成学习路径</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="rounded-3xl bg-surface-container p-6">
              <p className="text-sm italic leading-relaxed text-secondary">
                「知识的积累不应是沉重的负担，而是如同墨水渗入纸张般的自然演进。」
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-background text-lg">
                  ✒
                </div>
                <span className="font-mono text-xs font-bold">STUDY MENTOR AI</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  mono,
  delay,
  children,
}: {
  label: string;
  mono: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="animate-ink rounded-3xl border border-border-subtle bg-surface p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-sm font-medium text-secondary">{label}</span>
        <span className="font-mono text-xs">{mono}</span>
      </div>
      {children}
    </div>
  );
}

function RingProgress({ value }: { value: number }) {
  const c = 2 * Math.PI * 20;
  return (
    <svg viewBox="0 0 48 48" className="size-12 -rotate-90">
      <circle cx="24" cy="24" r="20" stroke="var(--surface-container)" strokeWidth="4" fill="none" />
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
      />
    </svg>
  );
}