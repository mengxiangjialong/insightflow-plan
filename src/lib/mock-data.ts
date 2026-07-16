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