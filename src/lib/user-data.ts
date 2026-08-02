/**
 * 用户数据隔离层。
 *
 * 所有学习数据（任务、计划、活跃度）都以当前登录用户的 ID 作为命名空间键
 * 存放：`inkplan.u.<userId>.<name>`。切换账号后读到的是完全不同的键，
 * 因此用户之间的数据互不可见；退出登录后返回空态。
 *
 * 对接 Java 后端后，同样的隔离由服务端保证：所有查询都以
 * `CurrentUser.id()`（JWT subject）作为过滤条件，前端 key 仅作本地缓存。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth";
import { currentPlan, todayTasks, type Plan, type Task } from "./mock-data";

const NS = "inkplan.u";
export const scopedKey = (userId: string, name: string) => `${NS}.${userId}.${name}`;

function hashId(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 233280;
}

function seededRandom(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** 读写当前用户命名空间下的持久化状态；未登录时为 null。 */
export function useScopedState<T>(name: string, factory: (userId: string) => T) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    if (!uid) {
      setValue(null);
      return;
    }
    const key = scopedKey(uid, name);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setValue(JSON.parse(raw) as T);
        return;
      }
    } catch {
      /* ignore corrupted cache */
    }
    const seed = factory(uid);
    try {
      window.localStorage.setItem(key, JSON.stringify(seed));
    } catch {
      /* storage full — 仅内存态 */
    }
    setValue(seed);
    // factory 保持稳定，无需进入依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, name]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        if (prev == null) return prev;
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (uid) {
          try {
            window.localStorage.setItem(scopedKey(uid, name), JSON.stringify(v));
          } catch {
            /* ignore */
          }
        }
        return v;
      });
    },
    [uid, name],
  );

  return [value, update] as const;
}

/** 新用户的初始任务：内容相同但状态归零，且仅存在于该用户的命名空间。 */
function seedTasks(): Task[] {
  return todayTasks.map((t) => ({ ...t, done: false }));
}

function seedPlans(): Plan[] {
  return [
    {
      ...currentPlan,
      id: "p1",
      progress: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      phases: currentPlan.phases.map((ph, i) => ({
        ...ph,
        progress: 0,
        status: i === 0 ? "active" : "locked",
        tasks: ph.tasks.map((t) => ({ ...t, done: false })),
      })),
    },
  ];
}

export function useUserTasks() {
  return useScopedState<Task[]>("tasks", seedTasks);
}

export function useUserPlans() {
  return useScopedState<Plan[]>("plans", seedPlans);
}

export type ActivityDay = { date: string; minutes: number };

export type UserActivity = {
  heatmap: ActivityDay[];
  growth: { week: string; hours: number }[];
  streakDays: number;
  focusHours: number;
  weekProgress: number;
};

/** 按用户 ID 生成确定性活跃度数据 —— 不同用户看到不同的曲线与热力图。 */
export function useUserActivity(): UserActivity | null {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  return useMemo(() => {
    if (!uid) return null;
    const rand = seededRandom(hashId(uid) + 7);
    const heatmap: ActivityDay[] = [];
    const today = new Date();
    for (let i = 20 * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const r = rand();
      heatmap.push({
        date: d.toISOString().slice(0, 10),
        minutes: r < 0.28 ? 0 : Math.floor(r * 180),
      });
    }
    const growth = Array.from({ length: 12 }, (_, i) => {
      const slice = heatmap.slice(heatmap.length - (12 - i) * 7, heatmap.length - (11 - i) * 7);
      const mins = slice.reduce((s, d) => s + d.minutes, 0);
      return { week: `W${i + 1}`, hours: Math.round((mins / 60) * 10) / 10 };
    });
    let streakDays = 0;
    for (let i = heatmap.length - 1; i >= 0; i--) {
      if (heatmap[i]!.minutes > 0) streakDays++;
      else break;
    }
    const focusHours = Math.round((heatmap.reduce((s, d) => s + d.minutes, 0) / 60) * 10) / 10;
    const lastWeek = heatmap.slice(-7);
    const weekProgress = Math.min(1, lastWeek.filter((d) => d.minutes > 0).length / 7);
    return { heatmap, growth, streakDays, focusHours, weekProgress };
  }, [uid]);
}
