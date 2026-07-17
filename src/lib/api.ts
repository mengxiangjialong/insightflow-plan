/**
 * 前后端分离 API 客户端。
 *
 * 前端通过 HTTP 调用独立部署的 Java + Spring Boot 后端（见项目根目录 `task-backend/`）。
 * 通过环境变量 `VITE_API_BASE_URL` 指定后端地址，例如：
 *   VITE_API_BASE_URL=http://localhost:8080
 *
 * 后端接口契约：
 *   GET    /api/plans                          -> Plan[]
 *   GET    /api/plans/{id}                     -> Plan
 *   POST   /api/plans/generate                 { goal, dailyMinutes, weeks, level } -> Plan
 *   GET    /api/tasks/today                    -> Task[]
 *   POST   /api/tasks/{id}/toggle              -> Task
 *   POST   /api/checkin                        -> { streakDays, checkedInAt }
 *   GET    /api/me                             -> User
 *   POST   /api/auth/login                     { email, password } -> { token }
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (mock) {
      console.warn(`[api] ${path} 请求失败，回退 mock：`, err);
      return mock();
    }
    throw err;
  }
}

export const api = {
  listPlans: () =>
    request<Plan[]>("/api/plans", { method: "GET" }, async () => (await delay(120), plansList)),
  getPlan: (id: string) =>
    request<Plan>(`/api/plans/${id}`, { method: "GET" }, async () => (await delay(120), plansList.find((p) => p.id === id) ?? currentPlan)),
  generatePlan: (input: { goal: string; dailyMinutes: number; weeks: number; level: string }) =>
    request<Plan>("/api/plans/generate", { method: "POST", body: JSON.stringify(input) }, async () => {
      await delay(1500);
      return { ...currentPlan, title: input.goal || currentPlan.title, weeks: input.weeks };
    }),
  listTodayTasks: () =>
    request<Task[]>("/api/tasks/today", { method: "GET" }, async () => (await delay(80), todayTasks)),
  toggleTask: (id: string) =>
    request<Task>(`/api/tasks/${id}/toggle`, { method: "POST" }, async () => {
      const t = todayTasks.find((x) => x.id === id)!;
      t.done = !t.done;
      return t;
    }),
  checkin: () =>
    request<{ streakDays: number; checkedInAt: string }>("/api/checkin", { method: "POST" }, async () => ({
      streakDays: 13,
      checkedInAt: new Date().toISOString(),
    })),
  me: () => request("/api/me", { method: "GET" }, async () => (await delay(60), user)),
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, async () => ({ token: "mock-token" })),
};

export const apiMeta = { baseUrl: BASE_URL, useMock: USE_MOCK };