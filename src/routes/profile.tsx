import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { user, stats, currentPlan } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "个人中心 · 墨策" },
      { name: "description", content: "查看你的学习档案、连续打卡与已生成的学习计划。" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell title="个人中心" breadcrumb="PROFILE">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-10 md:py-10">
        <section className="animate-ink flex flex-col items-start gap-6 rounded-3xl border border-border-subtle bg-surface p-6 sm:flex-row sm:items-center md:p-8">
          <div className="grid size-20 place-items-center rounded-full bg-ink text-2xl font-bold text-background">
            {user.name.at(-1)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-secondary">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              {user.role}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="连续学习" value={`${stats.streakDays} 天`} />
          <MetricCard label="本周进度" value={`${Math.round(stats.weekProgress * 100)}%`} />
          <MetricCard label="累计专注" value={`${stats.focusHours}h`} />
          <MetricCard label="进行中计划" value="1" />
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold">我的计划</h3>
          <div className="rounded-2xl border border-border-subtle bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="truncate font-bold">{currentPlan.title}</h4>
                <p className="mt-1 text-sm text-secondary">{currentPlan.goal}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-primary">进行中</span>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full bg-primary" style={{ width: `${currentPlan.progress * 100}%` }} />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <p className="font-mono text-xs uppercase text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}