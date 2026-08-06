// 领域类型定义（仅类型，无示例数据）。
// 所有运行时数据均通过 src/lib/api.ts 从 task-backend 获取。

export type TaskCategory = "READING" | "LISTENING" | "PRACTICE" | "REVIEW" | "WRITING";

/** 今日待办任务状态 */
export type TaskStatus = "TODO" | "DOING" | "DONE";

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; dot: string }[] = [
  { value: "TODO", label: "未开始", dot: "bg-secondary/50" },
  { value: "DOING", label: "进行中", dot: "bg-primary" },
  { value: "DONE", label: "已完成", dot: "bg-green-600" },
];

export interface Task {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  category: TaskCategory;
  done: boolean;
  status: TaskStatus;
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
