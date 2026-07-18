import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, Megaphone, Tag, Bot, BarChart3, Settings, ScrollText, Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { adminUsers, announcements, categories, aiPrompts, systemLogs } from "@/lib/mock-data";

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
      { name: "description", content: "用户、公告、分类、AI Prompt、系统日志与统计。" },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  { id: "users", label: "用户管理", icon: Users },
  { id: "announcements", label: "公告管理", icon: Megaphone },
  { id: "categories", label: "分类管理", icon: Tag },
  { id: "prompts", label: "AI Prompt", icon: Bot },
  { id: "stats", label: "数据统计", icon: BarChart3 },
  { id: "config", label: "系统配置", icon: Settings },
  { id: "logs", label: "日志查看", icon: ScrollText },
] as const;

type TabId = (typeof tabs)[number]["id"];

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
  const [rows, setRows] = useState(adminUsers);
  return (
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
          onClick={() => setRows((r) => r.filter((x) => x.id !== u.id))}
          className="grid size-8 place-items-center rounded-lg text-secondary hover:bg-surface-container hover:text-red-500"
          aria-label="删除"
        >
          <Trash2 className="size-4" />
        </button>,
      ])}
    />
  );
}

function AnnouncementsPanel() {
  return (
    <Table
      title="公告"
      cols={["标题", "发布时间", "置顶"]}
      rows={announcements.map((a) => [
        a.title,
        <span key="d" className="font-mono text-xs">{a.createdAt}</span>,
        <Badge key="p" tone={a.pinned ? "primary" : "muted"}>{a.pinned ? "已置顶" : "普通"}</Badge>,
      ])}
    />
  );
}

function CategoriesPanel() {
  return (
    <Table
      title="分类"
      cols={["名称", "关联计划数"]}
      rows={categories.map((c) => [c.name, <span key="n" className="font-mono">{c.count}</span>])}
    />
  );
}

function PromptsPanel() {
  return (
    <Table
      title="AI Prompt"
      cols={["名称", "模型", "更新时间"]}
      rows={aiPrompts.map((p) => [p.name, <Badge key="m" tone="primary">{p.model}</Badge>, <span key="u" className="font-mono text-xs">{p.updatedAt}</span>])}
    />
  );
}

function StatsPanel() {
  const cards = [
    { label: "总用户", value: "2,341" },
    { label: "今日活跃", value: "482" },
    { label: "AI 生成计划", value: "1,205" },
    { label: "本月新增", value: "312" },
  ];
  return (
    <div>
      <h3 className="mb-6 text-lg font-bold">平台数据</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border-subtle bg-surface p-5">
            <p className="font-mono text-xs uppercase text-secondary">{c.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfigPanel() {
  return (
    <div>
      <h3 className="mb-6 text-lg font-bold">系统配置</h3>
      <div className="space-y-4">
        {[
          { k: "站点名称", v: "墨策 · AI 学习计划平台" },
          { k: "开放注册", v: "开启" },
          { k: "AI 网关", v: "Lovable AI Gateway" },
          { k: "缓存策略", v: "Redis 30 分钟" },
        ].map((r) => (
          <div key={r.k} className="flex items-center justify-between border-b border-border-subtle py-3">
            <span className="font-medium">{r.k}</span>
            <span className="font-mono text-sm text-secondary">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsPanel() {
  return (
    <div>
      <h3 className="mb-6 text-lg font-bold">系统日志</h3>
      <div className="space-y-2 font-mono text-xs">
        {systemLogs.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-lg bg-surface/60 px-3 py-2">
            <Badge tone={l.level === "ERROR" ? "danger" : l.level === "WARN" ? "primary" : "muted"}>{l.level}</Badge>
            <span className="text-secondary">{l.at}</span>
            <span className="text-ink">{l.message}</span>
          </div>
        ))}
      </div>
    </div>
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