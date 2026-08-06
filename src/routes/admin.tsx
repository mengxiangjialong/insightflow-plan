import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Users, Megaphone, Tag, Bot, BarChart3, Settings, ScrollText, Trash2, Loader2, AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  api, apiErrorText,
  type AdminStats, type AdminUser, type Announcement, type CategoryItem,
  type ConfigItem, type LogItem, type Prompt,
} from "@/lib/api";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("inkplan.auth.user");
      if (!raw) throw redirect({ to: "/login" });
      try {
        const u = JSON.parse(raw);
        if (u.role !== "admin") throw redirect({ to: "/dashboard" });
      } catch {
        throw redirect({ to: "/login" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "管理后台 · 墨策" },
      { name: "description", content: "用户、公告、分类、Prompt 模板、系统日志与统计。" },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  { id: "users", label: "用户管理", icon: Users },
  { id: "announcements", label: "公告管理", icon: Megaphone },
  { id: "categories", label: "分类管理", icon: Tag },
  { id: "prompts", label: "Prompt 模板", icon: Bot },
  { id: "stats", label: "数据统计", icon: BarChart3 },
  { id: "config", label: "系统配置", icon: Settings },
  { id: "logs", label: "日志查看", icon: ScrollText },
] as const;

type TabId = (typeof tabs)[number]["id"];

/** 通用远程数据 Hook：所有面板数据均来自 task-backend。 */
function useRemote<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await load());
      setError(null);
    } catch (e) {
      setData(null);
      setError(apiErrorText(e));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh, setData };
}

function Panel({
  loading, error, empty, children,
}: {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-secondary">
        <Loader2 className="size-4 animate-spin" /> 正在从后端加载…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface/50 p-6 text-sm text-secondary">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
        <span>{error}</span>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-border-subtle bg-surface/50 p-8 text-center text-sm text-secondary">
        暂无数据
      </div>
    );
  }
  return <>{children}</>;
}

function AdminPage() {
  const [tab, setTab] = useState<TabId>("users");
  return (
    <AppShell title="管理后台" breadcrumb="ADMIN / CONSOLE">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-10 md:py-10">
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border-subtle pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  "flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-card text-ink border border-b-transparent border-border-subtle -mb-px"
                    : "text-secondary hover:text-ink")
                }
              >
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-border-subtle bg-card p-6 md:p-8">
          {tab === "users" && <UsersPanel />}
          {tab === "announcements" && <AnnouncementsPanel />}
          {tab === "categories" && <CategoriesPanel />}
          {tab === "prompts" && <PromptsPanel />}
          {tab === "stats" && <StatsPanel />}
          {tab === "config" && <ConfigPanel />}
          {tab === "logs" && <LogsPanel />}
        </div>
      </div>
    </AppShell>
  );
}

function UsersPanel() {
  const { data, loading, error, refresh } = useRemote<AdminUser[]>(() => api.admin.users());
  const rows = data ?? [];
  const del = async (id: number) => {
    try {
      await api.admin.deleteUser(id);
      await refresh();
    } catch {
      /* 错误在下一次加载时呈现 */
    }
  };
  return (
    <Panel loading={loading} error={error} empty={rows.length === 0}>
      <Table
        title="用户列表"
        cols={["昵称", "邮箱", "角色", "状态", "加入时间", ""]}
        rows={rows.map((u) => [
          u.name,
          <span key="e" className="font-mono text-xs">{u.email}</span>,
          <Badge key="r" tone={u.role === "admin" ? "primary" : "muted"}>{u.role}</Badge>,
          <Badge key="s" tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>,
          u.joinedAt,
          <button
            key="d"
            onClick={() => void del(u.id)}
            className="grid size-8 place-items-center rounded-lg text-secondary hover:bg-surface-container hover:text-red-500"
            aria-label="删除"
          >
            <Trash2 className="size-4" />
          </button>,
        ])}
      />
    </Panel>
  );
}

function AnnouncementsPanel() {
  const { data, loading, error } = useRemote<Announcement[]>(() => api.admin.announcements());
  const rows = data ?? [];
  return (
    <Panel loading={loading} error={error} empty={rows.length === 0}>
      <Table
        title="公告"
        cols={["标题", "发布时间", "置顶"]}
        rows={rows.map((a) => [
          a.title,
          <span key="d" className="font-mono text-xs">{a.createdAt}</span>,
          <Badge key="p" tone={a.pinned ? "primary" : "muted"}>{a.pinned ? "已置顶" : "普通"}</Badge>,
        ])}
      />
    </Panel>
  );
}

function CategoriesPanel() {
  const { data, loading, error } = useRemote<CategoryItem[]>(() => api.admin.categories());
  const rows = data ?? [];
  return (
    <Panel loading={loading} error={error} empty={rows.length === 0}>
      <Table
        title="分类"
        cols={["名称", "关联计划数"]}
        rows={rows.map((c) => [c.name, <span key="n" className="font-mono">{c.count}</span>])}
      />
    </Panel>
  );
}

function PromptsPanel() {
  const { data, loading, error } = useRemote<Prompt[]>(() => api.admin.prompts());
  const rows = data ?? [];
  return (
    <Panel loading={loading} error={error} empty={rows.length === 0}>
      <Table
        title="Prompt 模板"
        cols={["名称", "场景", "状态", "更新时间"]}
        rows={rows.map((p) => [
          p.name,
          <span key="s" className="font-mono text-xs">{p.scene}</span>,
          <Badge key="e" tone={p.enabled ? "success" : "muted"}>{p.enabled ? "启用" : "停用"}</Badge>,
          <span key="u" className="font-mono text-xs">{p.updatedAt}</span>,
        ])}
      />
    </Panel>
  );
}

function StatsPanel() {
  const { data, loading, error } = useRemote<AdminStats>(() => api.admin.stats());
  const cards = data
    ? [
        { label: "总用户", value: data.users },
        { label: "计划总数", value: data.plans },
        { label: "任务总数", value: data.tasks },
        { label: "今日打卡", value: data.checkinsToday },
        { label: "7 日活跃", value: data.activeUsers7d },
      ]
    : [];
  return (
    <Panel loading={loading} error={error} empty={cards.length === 0}>
      <div>
        <h3 className="mb-6 text-lg font-bold">平台数据</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border-subtle bg-surface p-5">
              <p className="font-mono text-xs uppercase text-secondary">{c.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight">{c.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ConfigPanel() {
  const { data, loading, error } = useRemote<ConfigItem[]>(() => api.admin.configs());
  const rows = data ?? [];
  return (
    <Panel loading={loading} error={error} empty={rows.length === 0}>
      <div>
        <h3 className="mb-6 text-lg font-bold">系统配置</h3>
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 border-b border-border-subtle py-3">
              <div className="min-w-0">
                <span className="font-medium">{r.key}</span>
                {r.description ? <p className="truncate text-xs text-secondary">{r.description}</p> : null}
              </div>
              <span className="shrink-0 font-mono text-sm text-secondary">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function LogsPanel() {
  const { data, loading, error } = useRemote<LogItem[]>(() => api.admin.logs());
  const rows = data ?? [];
  return (
    <Panel loading={loading} error={error} empty={rows.length === 0}>
      <div>
        <h3 className="mb-6 text-lg font-bold">系统日志</h3>
        <div className="space-y-2 font-mono text-xs">
          {rows.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-lg bg-surface/60 px-3 py-2">
              <Badge tone={l.level === "ERROR" ? "danger" : l.level === "WARN" ? "primary" : "muted"}>{l.level}</Badge>
              <span className="text-secondary">{l.createdAt}</span>
              <span className="truncate text-ink">{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "primary" | "muted" | "success" | "danger" }) {
  const cls = {
    primary: "bg-primary/10 text-primary",
    muted: "bg-surface-container text-secondary",
    success: "bg-green-500/15 text-green-700 dark:text-green-400",
    danger: "bg-red-500/15 text-red-700 dark:text-red-400",
  }[tone];
  return <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${cls}`}>{children}</span>;
}

function Table({ title, cols, rows }: { title: string; cols: string[]; rows: React.ReactNode[][] }) {
  return (
    <div>
      <h3 className="mb-6 text-lg font-bold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {cols.map((c) => (
                <th key={c} className="pb-3 font-mono text-xs uppercase text-secondary">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border-subtle/60 last:border-0">
                {r.map((c, j) => (
                  <td key={j} className="py-3 pr-4">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
