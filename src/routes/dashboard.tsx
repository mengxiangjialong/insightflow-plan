import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Flame, Pencil, Trash2, Plus, Check, X, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TASK_STATUS_OPTIONS, type Task, type TaskCategory, type TaskStatus } from "@/lib/mock-data";
import { useTodayStats, useTodayTasks, useUserPlans } from "@/lib/user-data";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("inkplan.auth.user")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "学习仪表盘 · 墨策" },
      { name: "description", content: "今日学习时长、目标完成率、连续学习天数与今日待办一览。" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    tasks: storedTasks,
    loading: tasksLoading,
    error: tasksError,
    add,
    update,
    remove: removeTask,
    setStatus,
  } = useTodayTasks();
  const { stats, refresh: refreshStats } = useTodayStats();
  const { plans } = useUserPlans();
  const activePlan = plans?.[0] ?? null;
  const tasks = storedTasks ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDetail, setDraftDetail] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("READING");
  const [newMinutes, setNewMinutes] = useState(30);
  const doneCount = tasks.filter((t) => t.done).length;
  const changeStatus = async (id: string, status: TaskStatus) => {
    await setStatus(id, status);
    void refreshStats();
  };
  const remove = (id: string) => void removeTask(id);
  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setDraftTitle(t.title);
    setDraftDetail(t.detail);
  };
  const saveEdit = () => {
    if (!editingId) return;
    void update(editingId, { title: draftTitle.trim() || undefined, detail: draftDetail });
    setEditingId(null);
  };
  const addTask = () => {
    if (!newTitle.trim()) return;
    void add({
      title: newTitle.trim(),
      detail: newDetail.trim() || `预计 ${newMinutes} 分钟`,
      minutes: newMinutes,
      category: newCategory,
    });
    setNewTitle("");
    setNewDetail("");
    setNewMinutes(30);
    setNewCategory("READING");
    setAdding(false);
  };

  return (
    <AppShell title="学习仪表盘" breadcrumb="DASHBOARD / ACTIVE_PLAN_01">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 p-4 md:gap-8 md:p-10">
        <div className="col-span-12 space-y-8 lg:col-span-8">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <StatCard label="今日已学" mono={`/ ${stats?.goalMinutes ?? 90} MIN`} delay={0}>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tighter">{stats?.minutes ?? 0}</span>
                <span className="font-mono text-xs text-secondary">分钟</span>
              </div>
            </StatCard>
            <StatCard label="完成率" mono={`${Math.round((stats?.completionRate ?? 0) * 100)}%`} delay={60}>
              <div className="flex items-center gap-3">
                <RingProgress value={stats?.completionRate ?? 0} />
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tighter">{stats?.streakDays ?? 0}</span>
                  <Flame className="size-4 text-primary" />
                  <span className="font-mono text-[10px] text-secondary">天连续</span>
                </div>
              </div>
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
              <h2 className="text-lg font-bold">
                今日待办 ·{" "}
                {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAdding((v) => !v)}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <Plus className="size-4" /> 新建任务
                </button>
                <Link
                  to="/plans/$planId"
                  params={{ planId: activePlan?.id ?? "p1" }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  管理计划
                </Link>
              </div>
            </div>
            {adding && (
              <div className="mb-4 space-y-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card p-4 md:p-5">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="任务标题"
                  className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  placeholder="任务描述（可选）"
                  className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {(["READING", "LISTENING", "PRACTICE", "REVIEW", "WRITING"] as TaskCategory[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value) || 30)}
                    className="w-24 rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <span className="text-xs text-secondary">分钟</span>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setAdding(false)}
                      className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-surface-container"
                    >
                      取消
                    </button>
                    <button
                      onClick={addTask}
                      className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {tasks.map((t) => {
                const isEditing = editingId === t.id;
                return (
                  <div
                    key={t.id}
                    className={
                      "group flex w-full items-center gap-3 rounded-2xl border border-border-subtle p-4 text-left transition-all md:p-5 " +
                      (t.done ? "bg-surface/40 opacity-60" : "bg-card hover:shadow-sm")
                    }
                  >
                    <StatusSelect
                      status={t.status ?? (t.done ? "DONE" : "TODO")}
                      onChange={(s) => void changeStatus(t.id, s)}
                    />
                    {isEditing ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          className="w-full rounded-lg border border-border-subtle bg-background px-2 py-1 text-sm font-medium outline-none focus:border-primary"
                        />
                        <input
                          value={draftDetail}
                          onChange={(e) => setDraftDetail(e.target.value)}
                          className="w-full rounded-lg border border-border-subtle bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <h3 className={"truncate font-medium " + (t.done ? "line-through" : "")}>
                          {t.title}
                        </h3>
                        <p className="truncate text-sm text-secondary">{t.detail}</p>
                      </div>
                    )}
                    <span className="hidden shrink-0 rounded-full bg-surface-container px-3 py-1 font-mono text-xs sm:inline">
                      {t.category}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            aria-label="保存"
                            className="grid size-8 place-items-center rounded-lg text-primary hover:bg-surface-container"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            aria-label="取消"
                            className="grid size-8 place-items-center rounded-lg text-secondary hover:bg-surface-container"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(t)}
                            aria-label="编辑"
                            className="grid size-8 place-items-center rounded-lg text-secondary opacity-0 transition-opacity hover:bg-surface-container hover:text-ink group-hover:opacity-100"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => remove(t.id)}
                            aria-label="删除"
                            className="grid size-8 place-items-center rounded-lg text-secondary opacity-0 transition-opacity hover:bg-surface-container hover:text-red-500 group-hover:opacity-100"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {tasksLoading && (
                <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border-subtle bg-surface/40 p-6 text-sm text-secondary">
                  <Loader2 className="size-4 animate-spin" /> 正在从后端加载今日待办…
                </div>
              )}
              {!tasksLoading && tasksError && (
                <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface/40 p-6 text-sm text-secondary">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                  <span>{tasksError}</span>
                </div>
              )}
              {!tasksLoading && !tasksError && tasks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border-subtle bg-surface/40 p-8 text-center text-sm text-secondary">
                  暂无任务，点击右上角「新建任务」开始规划今日学习。
                </div>
              )}
            </div>
          </section>

          <section className="animate-ink" style={{ animationDelay: "240ms" }}>
            <h2 className="mb-6 text-lg font-bold">计划阶段：{activePlan?.title ?? "暂无计划"}</h2>
            <div className="ml-3 space-y-8 border-l-2 border-border-subtle pl-8">
              {(activePlan?.phases ?? []).map((ph) => (
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
                  ✒
                </div>
                <h3 className="font-bold">个性化计划生成器</h3>
              </div>
              <p className="mb-6 text-sm text-secondary">
                告诉我们你要学什么，系统为你规划分阶段学习路径。
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
                <span className="font-mono text-xs font-bold">墨策 · 学习心法</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function StatusSelect({ status, onChange }: { status: TaskStatus; onChange: (s: TaskStatus) => void }) {
  const current = TASK_STATUS_OPTIONS.find((o) => o.value === status) ?? TASK_STATUS_OPTIONS[0];
  return (
    <div className="relative shrink-0">
      <span
        className={`pointer-events-none absolute left-3 top-1/2 size-2 -translate-y-1/2 rounded-full ${current.dot}`}
      />
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as TaskStatus)}
        aria-label="任务状态"
        className="appearance-none rounded-full border border-border-subtle bg-surface py-1.5 pl-7 pr-7 text-xs font-medium outline-none transition-colors hover:border-primary focus:border-primary"
      >
        {TASK_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-secondary" />
    </div>
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