/**
 * 前后端分离 API 客户端。
 *
 * 前端通过 HTTP 调用独立部署的 Java + Spring Boot 后端（见项目根目录 `task-backend/`）。
 * 通过环境变量 `VITE_API_BASE_URL` 指定后端地址，例如：
 *   VITE_API_BASE_URL=http://localhost:8080
 *
 * 接口契约（全部需要 Bearer JWT，除 /api/auth/**）：
 *   POST   /api/auth/login | /api/auth/register       -> { token }
 *   GET    /api/auth/github/url                       -> { url }
 *   GET    /api/me         | PUT /api/me              -> User
 *   GET    /api/goals      | POST /api/goals          -> Goal
 *   GET    /api/plans      | GET /api/plans/{id} | POST /api/plans/generate
 *   GET    /api/tasks/today | POST /api/tasks | PUT /api/tasks/{id}
 *          DELETE /api/tasks/{id} | POST /api/tasks/{id}/toggle
 *   GET/POST /api/checkin                             -> { streakDays, checkedIn }
 *   GET    /api/stats/today | /summary | /heatmap | /growth | /day/{date}
 *   GET    /api/admin/{stats,users,announcements,categories,prompts,configs,logs} …
 *
 * 未配置 `VITE_API_BASE_URL` 或后端不可达时，自动回退到本地 mock 数据，便于纯前端预览。
 */

import { currentPlan, plansList, todayTasks, user, type Plan, type Task } from "./mock-data";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const USE_MOCK = !BASE_URL;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("inkplan.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit, mock?: () => Promise<T>): Promise<T> {
  if (USE_MOCK) {
    if (!mock) throw new Error(`No mock defined for ${path}`);
    return mock();
  }
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (err) {
    if (mock) {
      console.warn(`[api] ${path} 请求失败，回退 mock：`, err);
      return mock();
    }
    throw err;
  }
}

/* ---------- 类型 ---------- */
export type MeResp = {
  id: number | string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  provider?: string;
};
export type TodayStats = {
  date: string;
  minutes: number;
  goalMinutes: number;
  completionRate: number;
  streakDays: number;
  doneTasks: number;
  totalTasks: number;
};
export type HeatDay = { date: string; minutes: number };
export type GrowthPoint = { week: string; hours: number };
export type StatsSummary = { streakDays: number; focusHours: number; weekProgress: number; activeDays: number };
export type DayDetail = {
  date: string;
  minutes: number;
  checkedIn: boolean;
  records: { id: string; title: string; minutes: number; category: string; createdAt: string }[];
};
export type Goal = {
  id: string;
  title: string;
  description?: string;
  dailyMinutes: number;
  weeks: number;
  level: string;
  status: string;
  createdAt: string;
};
export type AdminUser = { id: number; name: string; email: string; role: string; status: string; joinedAt: string };
export type Announcement = { id: string; title: string; content: string; pinned: boolean; createdAt: string };
export type CategoryItem = { id: string; name: string; count: number };
export type Prompt = { id: string; name: string; scene: string; content: string; enabled: boolean; updatedAt: string };
export type ConfigItem = { id: string; key: string; value: string; description?: string };
export type LogItem = { id: string; userId: number | null; level: string; action: string; message: string; createdAt: string };
export type AdminStats = { users: number; plans: number; tasks: number; checkinsToday: number; activeUsers7d: number };

/* ---------- mock 辅助（无后端时的本地数据） ---------- */
const today = () => new Date().toISOString().slice(0, 10);
let mockTasks: Task[] = todayTasks.map((t) => ({ ...t, done: false }));

function mockHeatmap(weeks: number): HeatDay[] {
  const out: HeatDay[] = [];
  const now = new Date();
  let s = 12345;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const r = rand();
    out.push({ date: d.toISOString().slice(0, 10), minutes: r < 0.3 ? 0 : Math.floor(r * 180) });
  }
  return out;
}

function mockGrowth(weeks: number): GrowthPoint[] {
  const heat = mockHeatmap(weeks);
  return Array.from({ length: weeks }, (_, i) => {
    const mins = heat.slice(i * 7, i * 7 + 7).reduce((a, d) => a + d.minutes, 0);
    return { week: `W${i + 1}`, hours: Math.round((mins / 60) * 10) / 10 };
  });
}

function mockTodayStats(): TodayStats {
  const done = mockTasks.filter((t) => t.done).length;
  const minutes = mockTasks.filter((t) => t.done).reduce((s, t) => s + t.minutes, 0);
  return {
    date: today(),
    minutes,
    goalMinutes: 90,
    completionRate: mockTasks.length ? Math.round((done / mockTasks.length) * 100) / 100 : 0,
    streakDays: 12,
    doneTasks: done,
    totalTasks: mockTasks.length,
  };
}

/* ---------- API ---------- */
export const api = {
  /* 认证 */
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, async () => ({
      token: "mock-token",
    })),
  register: (name: string, email: string, password: string) =>
    request<{ token: string }>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }, async () => ({
      token: "mock-token",
    })),
  githubAuthUrl: () => request<{ url: string }>("/api/auth/github/url", { method: "GET" }),

  /* 个人信息 */
  me: () => request<MeResp>("/api/me", { method: "GET" }, async () => (await delay(60), user as unknown as MeResp)),
  updateMe: (patch: { name?: string; email?: string; avatarUrl?: string }) =>
    request<MeResp>("/api/me", { method: "PUT", body: JSON.stringify(patch) }, async () => ({
      ...(user as unknown as MeResp),
      ...patch,
    })),

  /* 学习目标 */
  listGoals: () => request<Goal[]>("/api/goals", { method: "GET" }, async () => []),
  createGoal: (input: { title: string; description?: string; dailyMinutes: number; weeks: number; level: string }) =>
    request<Goal>("/api/goals", { method: "POST", body: JSON.stringify(input) }, async () => ({
      id: `g${Date.now()}`,
      status: "active",
      createdAt: new Date().toISOString(),
      description: input.description ?? "",
      ...input,
    })),

  /* 计划 */
  listPlans: () => request<Plan[]>("/api/plans", { method: "GET" }, async () => (await delay(120), plansList)),
  getPlan: (id: string) =>
    request<Plan>(`/api/plans/${id}`, { method: "GET" }, async () => (await delay(120), plansList.find((p) => p.id === id) ?? currentPlan)),
  generatePlan: (input: { goal: string; dailyMinutes: number; weeks: number; level: string }) =>
    request<Plan>("/api/plans/generate", { method: "POST", body: JSON.stringify(input) }, async () => {
      await delay(1200);
      return { ...currentPlan, title: input.goal || currentPlan.title, weeks: input.weeks };
    }),

  /* 今日待办 */
  listTodayTasks: () => request<Task[]>("/api/tasks/today", { method: "GET" }, async () => (await delay(80), mockTasks)),
  createTask: (input: { title: string; detail?: string; minutes?: number; category?: string }) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }, async () => {
      const t: Task = {
        id: `t${Date.now()}`,
        title: input.title,
        detail: input.detail ?? `预计 ${input.minutes ?? 30} 分钟`,
        minutes: input.minutes ?? 30,
        category: (input.category ?? "PRACTICE") as Task["category"],
        done: false,
      };
      mockTasks = [...mockTasks, t];
      return t;
    }),
  updateTask: (id: string, input: { title?: string; detail?: string; minutes?: number; category?: string }) =>
    request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) }, async () => {
      mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, ...input } as Task : t));
      return mockTasks.find((t) => t.id === id)!;
    }),
  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: "DELETE" }, async () => {
      mockTasks = mockTasks.filter((t) => t.id !== id);
    }),
  toggleTask: (id: string) =>
    request<Task>(`/api/tasks/${id}/toggle`, { method: "POST" }, async () => {
      mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      return mockTasks.find((t) => t.id === id)!;
    }),

  /* 打卡 */
  checkin: () =>
    request<{ streakDays: number; checkedInAt: string; checkedIn: boolean }>("/api/checkin", { method: "POST" }, async () => ({
      streakDays: 13,
      checkedInAt: new Date().toISOString(),
      checkedIn: true,
    })),
  checkinStatus: () =>
    request<{ streakDays: number; checkedInAt: string; checkedIn: boolean }>("/api/checkin", { method: "GET" }, async () => ({
      streakDays: 12,
      checkedInAt: new Date().toISOString(),
      checkedIn: false,
    })),

  /* 统计 */
  todayStats: () => request<TodayStats>("/api/stats/today", { method: "GET" }, async () => mockTodayStats()),
  statsSummary: (weeks = 20) =>
    request<StatsSummary>(`/api/stats/summary?weeks=${weeks}`, { method: "GET" }, async () => {
      const heat = mockHeatmap(weeks);
      const total = heat.reduce((s, d) => s + d.minutes, 0);
      return {
        streakDays: 12,
        focusHours: Math.round((total / 60) * 10) / 10,
        weekProgress: Math.min(1, heat.slice(-7).filter((d) => d.minutes > 0).length / 7),
        activeDays: heat.filter((d) => d.minutes > 0).length,
      };
    }),
  heatmap: (weeks = 20) => request<HeatDay[]>(`/api/stats/heatmap?weeks=${weeks}`, { method: "GET" }, async () => mockHeatmap(weeks)),
  growth: (weeks = 12) => request<GrowthPoint[]>(`/api/stats/growth?weeks=${weeks}`, { method: "GET" }, async () => mockGrowth(weeks)),
  dayDetail: (date: string) =>
    request<DayDetail>(`/api/stats/day/${date}`, { method: "GET" }, async () => ({
      date,
      minutes: mockHeatmap(20).find((d) => d.date === date)?.minutes ?? 0,
      checkedIn: false,
      records: [],
    })),

  /* 管理后台 */
  admin: {
    stats: () => request<AdminStats>("/api/admin/stats", { method: "GET" }),
    users: () => request<AdminUser[]>("/api/admin/users", { method: "GET" }),
    updateUser: (id: number, patch: { role?: string; status?: string }) =>
      request<AdminUser>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    deleteUser: (id: number) => request<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
    announcements: () => request<Announcement[]>("/api/admin/announcements", { method: "GET" }),
    createAnnouncement: (input: { title: string; content: string; pinned?: boolean }) =>
      request<Announcement>("/api/admin/announcements", { method: "POST", body: JSON.stringify(input) }),
    deleteAnnouncement: (id: string) => request<void>(`/api/admin/announcements/${id}`, { method: "DELETE" }),
    categories: () => request<CategoryItem[]>("/api/admin/categories", { method: "GET" }),
    createCategory: (name: string) =>
      request<CategoryItem>("/api/admin/categories", { method: "POST", body: JSON.stringify({ name }) }),
    deleteCategory: (id: string) => request<void>(`/api/admin/categories/${id}`, { method: "DELETE" }),
    prompts: () => request<Prompt[]>("/api/admin/prompts", { method: "GET" }),
    createPrompt: (input: { name: string; scene: string; content: string; enabled?: boolean }) =>
      request<Prompt>("/api/admin/prompts", { method: "POST", body: JSON.stringify(input) }),
    updatePrompt: (id: string, patch: Partial<{ name: string; scene: string; content: string; enabled: boolean }>) =>
      request<Prompt>(`/api/admin/prompts/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    deletePrompt: (id: string) => request<void>(`/api/admin/prompts/${id}`, { method: "DELETE" }),
    configs: () => request<ConfigItem[]>("/api/admin/configs", { method: "GET" }),
    upsertConfig: (input: { key: string; value: string; description?: string }) =>
      request<ConfigItem>("/api/admin/configs", { method: "POST", body: JSON.stringify(input) }),
    logs: () => request<LogItem[]>("/api/admin/logs", { method: "GET" }),
  },
};

export const apiMeta = { baseUrl: BASE_URL, useMock: USE_MOCK };
