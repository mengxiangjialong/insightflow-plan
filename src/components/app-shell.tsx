import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Sparkles, ListChecks, User, Moon, Sun, Plus,
  CalendarDays, LineChart, Shield, LogOut,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const baseNav = [
  { to: "/dashboard", label: "仪表盘", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  { to: "/plans/new", label: "AI 生成", icon: Sparkles, match: (p: string) => p === "/plans/new" },
  { to: "/plans/$planId", params: { planId: "p1" }, label: "我的计划", icon: ListChecks, match: (p: string) => p.startsWith("/plans/") && p !== "/plans/new" },
  { to: "/calendar", label: "学习日历", icon: CalendarDays, match: (p: string) => p === "/calendar" },
  { to: "/stats", label: "学习统计", icon: LineChart, match: (p: string) => p === "/stats" },
  { to: "/profile", label: "个人中心", icon: User, match: (p: string) => p === "/profile" },
] as const;

export function AppShell({
  title,
  breadcrumb,
  children,
  actions,
}: {
  title: string;
  breadcrumb?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === "admin"
    ? [...baseNav, { to: "/admin", label: "管理后台", icon: Shield, match: (p: string) => p.startsWith("/admin") } as (typeof baseNav)[number]]
    : baseNav;
  const doLogout = () => { logout(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <nav className="fixed left-0 top-0 bottom-0 z-50 hidden w-20 flex-col items-center gap-6 border-r border-border-subtle bg-background py-8 md:flex">
        <Link to="/dashboard" className="grid size-12 place-items-center rounded-2xl bg-ink text-background font-bold text-xl" aria-label="首页">
          墨
        </Link>
        <div className="mt-4 flex flex-col gap-3">
          {navItems.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                {...("params" in item ? { params: item.params } : {})}
                className={
                  "grid size-11 place-items-center rounded-xl transition-colors " +
                  (active ? "bg-surface-container text-primary" : "text-secondary hover:bg-surface")
                }
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="size-5" strokeWidth={1.8} />
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col items-center gap-4">
          <button
            onClick={toggle}
            className="grid size-10 place-items-center rounded-full border border-border-subtle transition-colors hover:bg-surface"
            aria-label="切换主题"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            onClick={doLogout}
            className="grid size-10 place-items-center rounded-full border border-border-subtle text-secondary hover:bg-surface hover:text-red-500"
            aria-label="退出登录"
            title="退出登录"
          >
            <LogOut className="size-4" />
          </button>
          <div className="grid size-10 place-items-center rounded-full bg-surface-container text-xs font-bold" title={user?.name}>
            {user?.name?.at(-1) ?? "客"}
          </div>
        </div>
      </nav>

      <main className="md:pl-20">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border-subtle bg-background/80 px-4 backdrop-blur-md md:h-20 md:px-10">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight md:text-xl">{title}</h1>
            {breadcrumb ? (
              <p className="truncate font-mono text-xs text-secondary md:text-sm">{breadcrumb}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {actions ?? (
              <div className="hidden items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5 md:flex">
                <span className="size-2 animate-pulse rounded-full bg-green-600" />
                <span className="text-xs font-medium">AI 助教已就绪</span>
              </div>
            )}
            <button
              onClick={toggle}
              className="grid size-9 place-items-center rounded-full border border-border-subtle md:hidden"
              aria-label="切换主题"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>

        <div className="pb-24 md:pb-10">{children}</div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-background px-6 md:hidden">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} {...("params" in item ? { params: item.params } : {})} className="grid size-11 place-items-center rounded-xl text-secondary" aria-label={item.label}>
              <Icon className="size-5" strokeWidth={1.8} />
            </Link>
          );
        })}
        <Link to="/plans/new" className="-translate-y-4 grid size-14 place-items-center rounded-full bg-ink text-background shadow-lg" aria-label="新建计划">
          <Plus className="size-6" />
        </Link>
        {navItems.slice(2, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} {...("params" in item ? { params: item.params } : {})} className="grid size-11 place-items-center rounded-xl text-secondary" aria-label={item.label}>
              <Icon className="size-5" strokeWidth={1.8} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}