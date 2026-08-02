import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useUserActivity, type ActivityDay } from "@/lib/user-data";

export const Route = createFileRoute("/calendar")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("inkplan.auth.user")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "学习日历 · 墨策" },
      { name: "description", content: "GitHub 风格学习贡献图，直观查看每日学习情况。" },
    ],
  }),
  component: CalendarPage,
});

function level(mins: number) {
  if (mins === 0) return 0;
  if (mins < 30) return 1;
  if (mins < 60) return 2;
  if (mins < 120) return 3;
  return 4;
}

const LEVEL_BG = [
  "bg-surface-container",
  "bg-green-200 dark:bg-green-900/60",
  "bg-green-400 dark:bg-green-700",
  "bg-green-600 dark:bg-green-500",
  "bg-green-700 dark:bg-green-400",
];

function CalendarPage() {
  const activity = useUserActivity();
  const heatmap = activity?.heatmap ?? [];
  const [selected, setSelected] = useState<ActivityDay | null>(null);
  const current = selected ?? heatmap[heatmap.length - 1] ?? null;
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < heatmap.length; i += 7) weeks.push(heatmap.slice(i, i + 7));
  const totalMinutes = heatmap.reduce((s, d) => s + d.minutes, 0);
  const activeDays = heatmap.filter((d) => d.minutes > 0).length;

  return (
    <AppShell title="学习日历" breadcrumb="CALENDAR / HEATMAP">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:px-10 md:py-10">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric label="累计学习时长" value={`${(totalMinutes / 60).toFixed(1)}h`} />
          <Metric label="活跃学习天数" value={`${activeDays} 天`} />
          <Metric label="覆盖周期" value={`${weeks.length} 周`} />
          <Metric label="日均" value={`${heatmap.length ? Math.round(totalMinutes / heatmap.length) : 0} 分钟`} />
        </section>

        <section className="card-ink p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold">最近 {weeks.length} 周</h3>
            <div className="flex items-center gap-1.5 text-xs text-secondary">
              少
              {LEVEL_BG.map((c, i) => (
                <span key={i} className={`size-3 rounded-sm ${c}`} />
              ))}
              多
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-1.5">
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {w.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelected(d)}
                      title={`${d.date} · ${d.minutes} 分钟`}
                      className={`size-3.5 rounded-sm transition-transform hover:scale-125 ${LEVEL_BG[level(d.minutes)]} ${current?.date === d.date ? "ring-2 ring-ink" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          {current && (
            <div className="mt-6 rounded-2xl bg-surface/60 p-4">
              <p className="font-mono text-xs text-secondary">SELECTED</p>
              <p className="mt-1 text-lg font-bold">{current.date}</p>
              <p className="mt-1 text-sm text-secondary">
                {current.minutes > 0
                  ? `当日学习 ${current.minutes} 分钟（约 ${(current.minutes / 60).toFixed(1)} 小时）`
                  : "当日未打卡 — 明天补上一天吧 ✨"}
              </p>
            </div>
          )}
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