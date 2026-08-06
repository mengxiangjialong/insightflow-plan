import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useUserActivity } from "@/lib/user-data";

export const Route = createFileRoute("/stats")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("inkplan.auth.user")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "学习统计 · 墨策" },
      { name: "description", content: "查看学习成长曲线、连续打卡与累计投入。" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { activity } = useUserActivity();
  const growthCurve = activity?.growth ?? [];
  const heatmap = activity?.heatmap ?? [];
  const max = Math.max(1, ...growthCurve.map((p) => p.hours));
  const totalHours = growthCurve.reduce((s, p) => s + p.hours, 0);
  const width = 640;
  const height = 220;
  const step = width / Math.max(1, growthCurve.length - 1);
  const points = growthCurve.map((p, i) => `${i * step},${height - (p.hours / max) * (height - 20) - 10}`).join(" ");

  return (
    <AppShell title="学习统计" breadcrumb="STATS / GROWTH">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-10 md:py-10">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric label="连续学习" value={`${activity?.streakDays ?? 0} 天`} />
          <Metric label="累计专注" value={`${totalHours.toFixed(1)}h`} />
          <Metric label="活跃天数" value={`${heatmap.filter((d) => d.minutes > 0).length}`} />
          <Metric label="周进度" value={`${Math.round((activity?.weekProgress ?? 0) * 100)}%`} />
        </section>

        <section className="card-ink p-6 md:p-8">
          <h3 className="font-bold">成长曲线</h3>
          <p className="mt-1 text-sm text-secondary">最近 12 周累计学习小时</p>
          <div className="mt-6 overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height + 30}`} className="min-w-[560px] w-full">
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="url(#g)"
                stroke="none"
                points={`0,${height} ${points} ${width},${height}`}
              />
              <polyline fill="none" stroke="var(--primary)" strokeWidth="2.5" points={points} />
              {growthCurve.map((p, i) => {
                const cx = i * step;
                const cy = height - (p.hours / max) * (height - 20) - 10;
                return (
                  <g key={p.week}>
                    <circle cx={cx} cy={cy} r="3.5" fill="var(--primary)" />
                    <text x={cx} y={height + 20} textAnchor="middle" className="fill-current text-[10px] text-secondary font-mono">
                      {p.week}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        <section className="card-ink p-6 md:p-8">
          <h3 className="mb-6 font-bold">周投入分布</h3>
          <div className="space-y-3">
            {growthCurve.map((p) => (
              <div key={p.week} className="flex items-center gap-3">
                <span className="w-10 font-mono text-xs text-secondary">{p.week}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full bg-primary" style={{ width: `${(p.hours / max) * 100}%` }} />
                </div>
                <span className="w-14 text-right font-mono text-xs">{p.hours}h</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-ink p-5">
      <p className="font-mono text-xs uppercase text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}