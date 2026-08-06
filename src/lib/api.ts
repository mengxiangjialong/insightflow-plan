/**
 * 前后端分离 API 客户端（task-frontend -> task-backend）。
 *
 * 所有数据均来自独立部署的 Java + Spring Boot 后端（见 `task-backend/`）。
 * 通过环境变量 `VITE_API_BASE_URL` 指定后端地址，例如：
 *   VITE_API_BASE_URL=http://localhost:8080
 *
 * 未配置该变量时，接口会抛出 ApiError（code = "NO_BACKEND"），
 * 页面据此展示「后端未连接」空态，绝不使用任何本地示例数据。
 */

import type { Plan, Task, TaskStatus } from "./mock-data";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export class ApiError extends Error {
  code: "NO_BACKEND" | "HTTP" | "NETWORK";
  status?: number;
  constructor(code: ApiError["code"], message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const isNoBackend = (e: unknown) => e instanceof ApiError && e.code === "NO_BACKEND";

export function apiErrorText(e: unknown) {
  if (isNoBackend(e)) return "后端服务未连接：请配置 VITE_API_BASE_URL 并启动 task-backend。";
  if (e instanceof Error && e.message) return e.message;
  return "数据加载失败，请稍后重试。";
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("inkplan.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError("NO_BACKEND", "未配置后端地址 VITE_API_BASE_URL");
  }
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiError("NETWORK", `无法连接后端服务：${(err as Error).message}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError("HTTP", text || `请求失败（HTTP ${res.status}）`, res.status);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
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

/* ---------- API ---------- */
export const api = {
  /* 认证 */
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string }>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  githubAuthUrl: () => request<{ url: string }>("/api/auth/github/url", { method: "GET" }),

  /* 个人信息 */
  me: () => request<MeResp>("/api/me", { method: "GET" }),
  updateMe: (patch: { name?: string; email?: string; avatarUrl?: string }) =>
    request<MeResp>("/api/me", { method: "PUT", body: JSON.stringify(patch) }),

  /* 学习目标 */
  listGoals: () => request<Goal[]>("/api/goals", { method: "GET" }),
  createGoal: (input: { title: string; description?: string; dailyMinutes: number; weeks: number; level: string }) =>
    request<Goal>("/api/goals", { method: "POST", body: JSON.stringify(input) }),

  /* 计划 */
  listPlans: () => request<Plan[]>("/api/plans", { method: "GET" }),
  getPlan: (id: string) => request<Plan>(`/api/plans/${id}`, { method: "GET" }),
  generatePlan: (input: { goal: string; dailyMinutes: number; weeks: number; level: string }) =>
    request<Plan>("/api/plans/generate", { method: "POST", body: JSON.stringify(input) }),

  /* 今日待办 */
  listTodayTasks: () => request<Task[]>("/api/tasks/today", { method: "GET" }),
  createTask: (input: { title: string; detail?: string; minutes?: number; category?: string }) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  updateTask: (id: string, input: { title?: string; detail?: string; minutes?: number; category?: string }) =>
    request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteTask: (id: string) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  toggleTask: (id: string) => request<Task>(`/api/tasks/${id}/toggle`, { method: "POST" }),
  /** 更新任务状态：TODO / DOING / DONE */
  setTaskStatus: (id: string, status: TaskStatus) =>
    request<Task>(`/api/tasks/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  /* 打卡 */
  checkin: () => request<{ streakDays: number; checkedInAt: string; checkedIn: boolean }>("/api/checkin", { method: "POST" }),
  checkinStatus: () => request<{ streakDays: number; checkedInAt: string; checkedIn: boolean }>("/api/checkin", { method: "GET" }),

  /* 统计 */
  todayStats: () => request<TodayStats>("/api/stats/today", { method: "GET" }),
  statsSummary: (weeks = 20) => request<StatsSummary>(`/api/stats/summary?weeks=${weeks}`, { method: "GET" }),
  heatmap: (weeks = 20) => request<HeatDay[]>(`/api/stats/heatmap?weeks=${weeks}`, { method: "GET" }),
  growth: (weeks = 12) => request<GrowthPoint[]>(`/api/stats/growth?weeks=${weeks}`, { method: "GET" }),
  dayDetail: (date: string) => request<DayDetail>(`/api/stats/day/${date}`, { method: "GET" }),

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

export const apiMeta = { baseUrl: BASE_URL, configured: Boolean(BASE_URL) };
