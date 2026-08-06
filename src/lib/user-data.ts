/**
 * 数据访问层：全部通过 `src/lib/api.ts` 调用 task-backend 接口。
 *
 * 数据隔离由服务端保证：后端所有查询都以 JWT 中的 `CurrentUser.id()`
 * 作为过滤条件，越权访问返回 404，因此不同账号看到的数据互不可见。
 * 未配置 `VITE_API_BASE_URL` 或后端不可达时，返回 error，由页面渲染空态。
 */
import { useCallback, useEffect, useState } from "react";
import { api, apiErrorText, type GrowthPoint, type HeatDay, type TodayStats } from "./api";
import { useAuth } from "./auth";
import type { Plan, Task, TaskStatus } from "./mock-data";

export type ActivityDay = HeatDay;

export type UserActivity = {
  heatmap: HeatDay[];
  growth: GrowthPoint[];
  streakDays: number;
  focusHours: number;
  weekProgress: number;
  activeDays: number;
};

/** 今日待办：列表 + 增删改 + 状态切换，全部走后端接口。 */
export function useTodayTasks() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setTasks(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setTasks(await api.listTodayTasks());
      setError(null);
    } catch (e) {
      setTasks(null);
      setError(apiErrorText(e));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    try {
      await fn();
      setError(null);
    } catch (e) {
      setError(apiErrorText(e));
    }
  }, []);

  const add = useCallback(
    (input: { title: string; detail?: string; minutes?: number; category?: string }) =>
      run(async () => {
        const t = await api.createTask(input);
        setTasks((prev) => [...(prev ?? []), t]);
      }),
    [run],
  );

  const update = useCallback(
    (id: string, patch: { title?: string; detail?: string; minutes?: number; category?: string }) =>
      run(async () => {
        const t = await api.updateTask(id, patch);
        setTasks((prev) => (prev ?? []).map((x) => (x.id === id ? t : x)));
      }),
    [run],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await api.deleteTask(id);
        setTasks((prev) => (prev ?? []).filter((x) => x.id !== id));
      }),
    [run],
  );

  const setStatus = useCallback(
    (id: string, status: TaskStatus) =>
      run(async () => {
        const t = await api.setTaskStatus(id, status);
        setTasks((prev) => (prev ?? []).map((x) => (x.id === id ? t : x)));
      }),
    [run],
  );

  return { tasks, loading, error, add, update, remove, setStatus, refresh };
}

/** 今日学习：已学时长 / 今日目标 / 完成率 / 连续天数。日期取服务器当前时间。 */
export function useTodayStats() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setStats(await api.todayStats());
      setError(null);
    } catch (e) {
      setStats(null);
      setError(apiErrorText(e));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}

/** 学习日历（贡献墙）+ 成长曲线 + 汇总。 */
export function useUserActivity(weeks = 20) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [data, setData] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setData(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const [heatmap, growth, summary] = await Promise.all([
          api.heatmap(weeks),
          api.growth(Math.min(weeks, 12)),
          api.statsSummary(weeks),
        ]);
        if (!alive) return;
        setData({ heatmap, growth, ...summary });
        setError(null);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(apiErrorText(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, weeks]);

  return { activity: data, loading, error };
}

/** 我的学习计划列表（服务端按 userId 隔离）。 */
export function useUserPlans() {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setPlans(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .listPlans()
      .then((p) => {
        if (!alive) return;
        setPlans(p);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setPlans(null);
        setError(apiErrorText(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [uid]);

  return { plans, setPlans, loading, error };
}
