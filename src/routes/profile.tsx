import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Save, Pencil } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useUserActivity, useUserPlans } from "@/lib/user-data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("inkplan.auth.user")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "个人中心 · 墨策" },
      { name: "description", content: "查看你的学习档案、连续打卡与已生成的学习计划。" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, update, logout } = useAuth();
  const activity = useUserActivity();
  const [plans] = useUserPlans();
  const myPlans = plans ?? [];
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  if (!user) return null;
  return (
    <AppShell title="个人中心" breadcrumb="PROFILE">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 md:px-10 md:py-10">
        <section className="animate-ink flex flex-col items-start gap-6 rounded-3xl border border-border-subtle bg-surface p-6 sm:flex-row sm:items-center md:p-8">
          <div className="grid size-20 place-items-center rounded-full bg-ink text-2xl font-bold text-background">
            {user.name.at(-1)}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="space-y-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-lg font-bold outline-none focus:border-primary" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-secondary">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                  {user.role === "admin" ? "管理员" : "学习者"}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {editing ? (
              <button
                onClick={async () => { try { const me = await api.updateMe({ name, email }); update({ name: me.name, email: me.email }); } catch { update({ name, email }); } setEditing(false); }}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background"
              >
                <Save className="size-4" /> 保存
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-full border border-border-subtle px-4 py-2 text-sm hover:bg-surface-container"
              >
                <Pencil className="size-4" /> 编辑
              </button>
            )}
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="flex items-center gap-1.5 rounded-full border border-border-subtle px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="size-4" /> 退出
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="连续学习" value={`${activity?.streakDays ?? 0} 天`} />
          <MetricCard label="本周进度" value={`${Math.round((activity?.weekProgress ?? 0) * 100)}%`} />
          <MetricCard label="累计专注" value={`${activity?.focusHours ?? 0}h`} />
          <MetricCard label="进行中计划" value={`${myPlans.length}`} />
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold">我的计划</h3>
          <div className="space-y-3">
            {myPlans.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border-subtle p-6 text-sm text-secondary">
                还没有计划，去「AI 生成」创建你的第一份学习路径。
              </p>
            )}
            {myPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-border-subtle bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate font-bold">{plan.title}</h4>
                    <p className="mt-1 text-sm text-secondary">{plan.goal}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-primary">进行中</span>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full bg-primary" style={{ width: `${plan.progress * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-ink p-5">
      <p className="font-mono text-xs uppercase text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}