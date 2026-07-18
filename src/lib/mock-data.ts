// 前后端分离占位数据。真实后端接口契约（Java + Spring Boot + MySQL + Redis）见 src/lib/api.ts。

export type TaskCategory = "READING" | "LISTENING" | "PRACTICE" | "REVIEW" | "WRITING";

export interface Task {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  category: TaskCategory;
  done: boolean;
}

export interface PhaseTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Phase {
  id: string;
  index: number;
  title: string;
  summary: string;
  progress: number;
  status: "done" | "active" | "locked";
  tasks: PhaseTask[];
}

export interface Plan {
  id: string;
  title: string;
  goal: string;
  dailyMinutes: number;
  weeks: number;
  level: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  progress: number;
  phases: Phase[];
}

export const todayTasks: Task[] = [
  { id: "t1", title: "精读《经济学人》社论 1 篇", detail: "专注度要求：高 · 预计 45 分钟", minutes: 45, category: "READING", done: false },
  { id: "t2", title: "完成雅思听力 Section 3 练习", detail: "得分：7.5 · 已用时 30 分钟", minutes: 30, category: "LISTENING", done: true },
  { id: "t3", title: "复述 20 个学术核心词汇", detail: "使用 Anki 卡片进行主动回忆", minutes: 20, category: "REVIEW", done: false },
  { id: "t4", title: "撰写雅思 Task 2 议论文一篇", detail: "主题：科技对教育的影响 · 250 词以上", minutes: 40, category: "WRITING", done: false },
  { id: "t5", title: "口语 Part 2 卡片限时练习", detail: "3 张卡片 · 每张 2 分钟录音", minutes: 25, category: "PRACTICE", done: true },
];

export const currentPlan: Plan = {
  id: "p1",
  title: "雅思 7.5 冲刺",
  goal: "四个月内将雅思总分从 6.5 提升至 7.5",
  dailyMinutes: 90,
  weeks: 16,
  level: "intermediate",
  createdAt: "2024-09-01",
  progress: 0.42,
  phases: [
    {
      id: "ph1", index: 1, title: "基础夯实", summary: "词汇扩展与语法结构精讲",
      progress: 0.66, status: "active",
      tasks: [
        { id: "ph1t1", title: "核心词汇 3000 首轮背诵", done: true },
        { id: "ph1t2", title: "长难句结构分析 20 组", done: true },
        { id: "ph1t3", title: "语法体系专题梳理", done: false },
      ],
    },
    {
      id: "ph2", index: 2, title: "专项突破", summary: "听力陷阱与阅读定位技术",
      progress: 0, status: "locked",
      tasks: [
        { id: "ph2t1", title: "剑桥真题听力 5 套精练", done: false },
        { id: "ph2t2", title: "阅读关键词定位法训练", done: false },
      ],
    },
    {
      id: "ph3", index: 3, title: "冲刺模考", summary: "全真模拟与错题精讲",
      progress: 0, status: "locked",
      tasks: [
        { id: "ph3t1", title: "全真模考 4 套", done: false },
        { id: "ph3t2", title: "错题归因与专项补漏", done: false },
      ],
    },
  ],
};

export const plansList: Plan[] = [currentPlan];

export const stats = {
  streakDays: 12,
  weekProgress: 0.84,
  todayDone: 3,
  todayTotal: 5,
  focusHours: 24.5,
};

export const user = { name: "张志远", email: "zhiyuan@example.com", role: "Pro Learner" };

/** GitHub-style contribution heatmap: 最近 20 周 × 7 天 */
function seed(n: number) {
  let s = n;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seed(42);
export const heatmap: { date: string; minutes: number }[] = (() => {
  const arr: { date: string; minutes: number }[] = [];
  const today = new Date();
  for (let i = 20 * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const r = rand();
    const minutes = r < 0.3 ? 0 : Math.floor(r * 180);
    arr.push({ date: d.toISOString().slice(0, 10), minutes });
  }
  return arr;
})();

/** 成长曲线：最近 12 周累计专注小时 */
export const growthCurve: { week: string; hours: number }[] = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  hours: Math.round((6 + i * 1.4 + rand() * 3) * 10) / 10,
}));

/** 管理员：用户列表 */
export const adminUsers = [
  { id: "u1", name: "张志远", email: "zhiyuan@example.com", role: "user", status: "active", joinedAt: "2024-09-01" },
  { id: "u2", name: "李清照", email: "qingzhao@example.com", role: "user", status: "active", joinedAt: "2024-10-11" },
  { id: "u3", name: "王阳明", email: "yangming@example.com", role: "admin", status: "active", joinedAt: "2024-06-20" },
  { id: "u4", name: "苏轼", email: "sushi@example.com", role: "user", status: "banned", joinedAt: "2024-08-03" },
];

export const announcements = [
  { id: "a1", title: "平台 v1.2 更新：AI 计划支持自定义节奏", createdAt: "2026-07-10", pinned: true },
  { id: "a2", title: "每周学习之星评选开始啦", createdAt: "2026-07-04", pinned: false },
];

export const categories = [
  { id: "c1", name: "编程开发", count: 128 },
  { id: "c2", name: "语言学习", count: 96 },
  { id: "c3", name: "考研考证", count: 74 },
  { id: "c4", name: "兴趣爱好", count: 43 },
];

export const aiPrompts = [
  { id: "p1", name: "计划生成器", model: "gpt-4o", updatedAt: "2026-07-12" },
  { id: "p2", name: "每日任务拆解", model: "gpt-4o-mini", updatedAt: "2026-07-08" },
  { id: "p3", name: "复盘助教", model: "gpt-4o", updatedAt: "2026-06-30" },
];

export const systemLogs = [
  { id: "l1", level: "INFO", message: "用户 zhiyuan 登录成功", at: "2026-07-18 09:12:44" },
  { id: "l2", level: "WARN", message: "AI 请求限流触发", at: "2026-07-18 08:41:02" },
  { id: "l3", level: "INFO", message: "计划 p1 已生成", at: "2026-07-17 22:15:11" },
  { id: "l4", level: "ERROR", message: "Redis 连接短暂中断（30s）", at: "2026-07-17 20:03:29" },
];