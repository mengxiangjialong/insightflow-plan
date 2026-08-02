import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { useUserPlans } from "@/lib/user-data";

export const Route = createFileRoute("/plans/new")({
  head: () => ({
    meta: [
      { title: "AI 生成学习计划 · 墨策" },
      { name: "description", content: "输入学习目标、每日投入与周期，AI 为你定制分阶段学习路径。" },
      { property: "og:title", content: "AI 生成学习计划 · 墨策" },
      { property: "og:description", content: "让 AI 为你量身定制结构化学习路径。" },
    ],
  }),
  component: NewPlanPage,
});

const levels = [
  { value: "beginner", label: "零基础" },
  { value: "intermediate", label: "略有了解" },
  { value: "advanced", label: "进阶提升" },
] as const;

function NewPlanPage() {
  const navigate = useNavigate();
  const [, setPlans] = useUserPlans();
  const [goal, setGoal] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [weeks, setWeeks] = useState(4);
  const [level, setLevel] = useState<(typeof levels)[number]["value"]>("intermediate");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    const generated = await api.generatePlan({ goal, dailyMinutes, weeks, level });
    const plan = { ...generated, id: `p-${Date.now()}` };
    setPlans((prev) => [plan, ...prev]);
    navigate({ to: "/plans/$planId", params: { planId: plan.id } });
  };

  return (
    <AppShell title="生成学习计划" breadcrumb="PLANS / NEW">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-10 md:py-12">
        <div className="animate-ink mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5 font-mono text-xs">
            <Sparkles className="size-3.5 text-primary" />
            AI 智能引擎
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">告诉 AI 你想学什么</h2>
          <p className="mt-3 max-w-xl text-secondary">
            我们会基于你的目标、可投入时间与当前水平，生成分阶段学习路径，包含每日任务与检查点。
          </p>
        </div>

        <form
          onSubmit={submit}
          className="animate-ink space-y-6 rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-lg md:p-8"
          style={{ animationDelay: "80ms" }}
        >
          <Field label="我想要学习">
            <input
              type="text"
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例如：零基础学 Python 数据分析"
              className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="每日投入">
              <select
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value={30}>30 分钟</option>
                <option value={60}>1 小时</option>
                <option value={120}>2 小时+</option>
              </select>
            </Field>
            <Field label="目标周期">
              <select
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value={2}>2 周</option>
                <option value={4}>4 周</option>
                <option value={12}>3 个月</option>
                <option value={24}>6 个月</option>
              </select>
            </Field>
          </div>

          <Field label="当前水平">
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className={
                    "rounded-xl border px-3 py-3 text-sm font-medium transition-all " +
                    (level === l.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-subtle bg-surface text-secondary hover:border-primary/40")
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Field>

          <button
            type="submit"
            disabled={loading || !goal.trim()}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-bold text-background transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                AI 正在起草你的学习路径…
              </>
            ) : (
              <>
                生成学习路径
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-xs uppercase tracking-widest text-secondary">{label}</span>
      {children}
    </label>
  );
}