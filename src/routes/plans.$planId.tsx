import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { Phase, PhaseTask, Plan } from "@/lib/mock-data";

export const Route = createFileRoute("/plans/$planId")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["plan", params.planId],
      queryFn: () => api.getPlan(params.planId),
    }),
  head: ({ params }) => ({
    meta: [
      { title: `学习计划 · 墨策` },
      { name: "description", content: `查看学习计划 ${params.planId} 的阶段与任务进度。` },
    ],
  }),
  component: PlanDetailPage,
});

function PlanDetailPage() {
  const { planId } = Route.useParams();
  const initialPlan = Route.useLoaderData() as Plan;
  const [plan, setPlan] = useState<Plan>(initialPlan);

  const updatePhase = (phaseId: string, updater: (tasks: PhaseTask[]) => PhaseTask[]) => {
    setPlan((prev) => ({
      ...prev,
      phases: prev.phases.map((ph) =>
        ph.id === phaseId ? { ...ph, tasks: updater(ph.tasks) } : ph,
      ),
    }));
  };

  return (
    <AppShell title={plan.title} breadcrumb={`PLANS / ${planId.toUpperCase()}`}>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-10 md:py-10">
        <section className="animate-ink rounded-3xl border border-border-subtle bg-surface p-6 md:p-8">
          <p className="mb-4 font-mono text-xs text-secondary">GOAL</p>
          <h2 className="text-2xl font-bold leading-tight md:text-3xl">{plan.goal}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="总进度" value={`${Math.round(plan.progress * 100)}%`} />
            <Stat label="每日投入" value={`${plan.dailyMinutes} 分钟`} />
            <Stat label="周期" value={`${plan.weeks} 周`} />
            <Stat
              label="难度"
              value={
                plan.level === "beginner" ? "入门" : plan.level === "advanced" ? "进阶" : "中级"
              }
            />
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div className="h-full bg-primary transition-all" style={{ width: `${plan.progress * 100}%` }} />
          </div>
        </section>

        <section>
          <h3 className="mb-6 text-lg font-bold">阶段与任务</h3>
          <div className="space-y-4">
            {plan.phases.map((ph, i) => (
              <PhaseCard
                key={ph.id}
                phase={ph}
                defaultOpen={i === 0}
                onAdd={(title) =>
                  updatePhase(ph.id, (tasks) => [
                    ...tasks,
                    { id: `${ph.id}-t${Date.now()}`, title, done: false },
                  ])
                }
                onUpdate={(taskId, title) =>
                  updatePhase(ph.id, (tasks) =>
                    tasks.map((t) => (t.id === taskId ? { ...t, title } : t)),
                  )
                }
                onDelete={(taskId) =>
                  updatePhase(ph.id, (tasks) => tasks.filter((t) => t.id !== taskId))
                }
                onToggle={(taskId) =>
                  updatePhase(ph.id, (tasks) =>
                    tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-secondary">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function PhaseCard({
  phase,
  defaultOpen,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
}: {
  phase: Phase;
  defaultOpen: boolean;
  onAdd: (title: string) => void;
  onUpdate: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
  onToggle: (taskId: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const locked = phase.status === "locked";
  return (
    <div className={"overflow-hidden rounded-2xl border border-border-subtle bg-card " + (locked ? "opacity-60" : "")}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={
              "grid size-10 shrink-0 place-items-center rounded-lg font-bold " +
              (phase.status === "active" ? "bg-primary text-primary-foreground" : "bg-surface-container")
            }
          >
            {String(phase.index).padStart(2, "0")}
          </div>
          <div className="min-w-0">
            <h4 className="truncate font-bold">{phase.title}</h4>
            <p className="truncate text-sm text-secondary">{phase.summary}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {phase.progress > 0 && (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container">
                <div className="h-full bg-primary" style={{ width: `${phase.progress * 100}%` }} />
              </div>
              <span className="font-mono text-xs">{Math.round(phase.progress * 100)}%</span>
            </div>
          )}
          <ChevronDown
            className={"size-4 text-secondary transition-transform " + (open ? "rotate-180" : "")}
          />
        </div>
      </button>
      {open && !locked && (
        <div className="border-t border-border-subtle bg-surface/40 px-6 py-5">
          <ul className="space-y-2">
            {phase.tasks.map((t) => {
              const isEditing = editingId === t.id;
              return (
                <li key={t.id} className="group flex items-center gap-3 text-sm">
                  <button
                    onClick={() => onToggle(t.id)}
                    aria-label="切换完成"
                    className={
                      "size-4 shrink-0 rounded border-2 " +
                      (t.done ? "border-ink bg-ink" : "border-border-subtle hover:border-primary")
                    }
                  />
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onUpdate(t.id, draft.trim() || t.title);
                          setEditingId(null);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                      className="flex-1 rounded-lg border border-border-subtle bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                    />
                  ) : (
                    <span className={"flex-1 " + (t.done ? "text-secondary line-through" : "")}>
                      {t.title}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center gap-1">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            onUpdate(t.id, draft.trim() || t.title);
                            setEditingId(null);
                          }}
                          className="grid size-7 place-items-center rounded text-primary hover:bg-surface-container"
                          aria-label="保存"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="grid size-7 place-items-center rounded text-secondary hover:bg-surface-container"
                          aria-label="取消"
                        >
                          <X className="size-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(t.id);
                            setDraft(t.title);
                          }}
                          className="grid size-7 place-items-center rounded text-secondary opacity-0 transition-opacity hover:bg-surface-container hover:text-ink group-hover:opacity-100"
                          aria-label="编辑"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="grid size-7 place-items-center rounded text-secondary opacity-0 transition-opacity hover:bg-surface-container hover:text-red-500 group-hover:opacity-100"
                          aria-label="删除"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {adding ? (
            <div className="mt-3 flex items-center gap-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTitle.trim()) {
                    onAdd(newTitle.trim());
                    setNewTitle("");
                    setAdding(false);
                  } else if (e.key === "Escape") {
                    setAdding(false);
                    setNewTitle("");
                  }
                }}
                placeholder="新任务标题…"
                className="flex-1 rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  if (!newTitle.trim()) return;
                  onAdd(newTitle.trim());
                  setNewTitle("");
                  setAdding(false);
                }}
                className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                }}
                className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-surface-container"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="size-4" /> 添加任务
            </button>
          )}
        </div>
      )}
    </div>
  );
}