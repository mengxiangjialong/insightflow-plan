/**
 * 前端 API 客户端占位。
 *
 * 与 Java + Spring Boot 后端对接的建议接口契约：
 *   GET    /api/plans                          -> Plan[]
 *   GET    /api/plans/{id}                     -> Plan
 *   POST   /api/plans/generate                 { goal, dailyMinutes, weeks, level } -> Plan
 *   GET    /api/tasks/today                    -> Task[]
 *   POST   /api/tasks/{id}/toggle              -> Task
 *   POST   /api/checkin                        -> { streakDays, checkedInAt }
 *   GET    /api/me                             -> User
 *   POST   /api/auth/login                     { email, password } -> { token }
 *
 * 建议后端：Spring Boot 3 + Spring Security (JWT) + MyBatis-Plus / JPA + MySQL 8 + Redis 7
 * Redis 用途：会话/JWT 黑名单、AI 结果缓存、每日打卡去重、热点计划榜。
 */

import { currentPlan, plansList, todayTasks, user, type Plan, type Task } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async listPlans(): Promise<Plan[]> { await delay(120); return plansList; },
  async getPlan(id: string): Promise<Plan> { await delay(120); return plansList.find((p) => p.id === id) ?? currentPlan; },
  async generatePlan(input: { goal: string; dailyMinutes: number; weeks: number; level: string }): Promise<Plan> {
    await delay(1500);
    return { ...currentPlan, title: input.goal || currentPlan.title, weeks: input.weeks };
  },
  async listTodayTasks(): Promise<Task[]> { await delay(80); return todayTasks; },
  async me() { await delay(60); return user; },
};