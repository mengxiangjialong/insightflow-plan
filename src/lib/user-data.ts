/**
 * 数据访问层：全部通过 `src/lib/api.ts` 调用 Java 后端接口。
 *
 * 数据隔离由服务端保证：后端所有查询都以 JWT 中的 `CurrentUser.id()`
 * 作为过滤条件，越权访问返回 404，因此不同账号看到的数据互不可见。
 * 未配置 `VITE_API_BASE_URL` 时 api 层自动回退 mock，便于纯前端预览。
 */
import { useCallback, useEffect, useState } from "react";
import { api, type GrowthPoint, type HeatDay, type TodayStats } from "./api";
import { useAuth } from "./auth";
import type { Plan, Task } from "./mock-data";

export type ActivityDay = HeatDay;

export type UserActivity = {
  heatmap: HeatDay[];
  growth: GrowthPoint[];
  streakDays: number;
  focusHours: number;
  weekProgress: number;
  activeDays: number;
};

/** 今日待办：列表 + 增删改 + 打勾，全部走后端接口。 */
export function useTodayTasks() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [tasks, setTasks] = useState<Task[] | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) return setTasks(null);
    try {
      setTasks(await api.listTodayTasks());
    } catch {
      setTasks([]);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: { title: string; detail?: string; minutes?: number; category?: string }) => {
      const t = await api.createTask(input);
      setTasks((prev) => [...(prev ?? []), t]);
    },
    [],
  );

  const update = useCallback(
    async (id: string, patch: { title?: string; detail?: string; minutes?: number; category?: string }) => {
      const t = await api.updateTask(id, patch);
      setTasks((prev) => (prev ?? []).map((x) => (x.id === id ? t : x)));
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => (prev ?? []).filter((x) => x.id !== id));
  }, []);

  const toggle = useCallback(async (id: string) => {
    const t = await api.toggleTask(id);
    setTasks((prev) => (prev ?? []).map((x) => (x.id === id ? t : x)));
  }, []);

  return { tasks, add, update, remove, toggle, refresh };
}

/** 今日学习：已学时长 / 今日目标 / 完成率 / 连续天数。日期取服务器当前时间。 */
export function useTodayStats() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [stats, setStats] = useState<TodayStats | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) return setStats(null);
    try {
      setStats(await api.todayStats());
    } catch {
      setStats(null);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, refresh };
}

/** 学习日历（贡献墙）+ 成长曲线 + 汇总。 */
export function useUserActivity(weeks = 20): UserActivity | null {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [data, setData] = useState<UserActivity | null>(null);

  useEffect(() => {
    if (!uid) {
      setData(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const [heatmap, growth, summary] = await Promise.all([
          api.heatmap(weeks),
          api.growth(Math.min(weeks, 12)),
          api.statsSummary(weeks),
        ]);
        if (alive) setData({ heatmap, growth, ...summary });
      } catch {
        if (alive) setData({ heatmap: [], growth: [], streakDays: 0, focusHours: 0, weekProgress: 0, activeDays: 0 });
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, weeks]);

  return data;
}

/** 我的学习计划列表（服务端按 userId 隔离）。 */
export function useUserPlans() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [plans, setPlans] = useState<Plan[] | null>(null);

  useEffect(() => {
    if (!uid) {
      setPlans(null);
      return;
    }
    let alive = true;
    api
      .listPlans()
      .then((p) => alive && setPlans(p))
      .catch(() => alive && setPlans([]));
    return () => {
      alive = false;
    };
  }, [uid]);

  return [plans, setPlans] as const;
}
