import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { Phase, Plan } from "@/lib/mock-data";

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
  const plan = Route.useLoaderData() as Plan;

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
              <PhaseCard key={ph.id} phase={ph} defaultOpen={i === 0} />
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

function PhaseCard({ phase, defaultOpen }: { phase: Phase; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
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
        <ul className="space-y-2 border-t border-border-subtle bg-surface/40 px-6 py-5">
          {phase.tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 text-sm">
              <span
                className={
                  "size-4 shrink-0 rounded border-2 " +
                  (t.done ? "border-ink bg-ink" : "border-border-subtle")
                }
              />
              <span className={t.done ? "text-secondary line-through" : ""}>{t.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}