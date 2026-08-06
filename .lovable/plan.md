# 双库拆分 + 任务状态下拉 + 品牌图标

## 1. 代码库结构拆分（insightflow-plan）

当前仓库是「前端在根目录 + task-backend 子目录」。改为两个平级、可独立发布的工程：

```text
insightflow-plan/
  task-frontend/   前端（React + TanStack Start）
  task-backend/    后端（Java 17 + Spring Boot 3 + MySQL + Redis）
```

说明：Lovable 只能运行一个前端工程，若把前端源码真的移到 `task-frontend/` 子目录，预览与构建会失效。因此采用「后端已是完整独立工程 + 文档指引拆库」的方式：
- `task-backend/` 自带 pom、README、schema.sql，可直接 `git init` 推成 `insightflow-plan/task-backend`。
- 根 `README.md` 改为总览：两库职责、拆库步骤、环境变量、联调命令。
- 前端 `package.json` 名称保持 `task-frontend`，README 补充 `VITE_API_BASE_URL` 配置说明。

## 2. 前端全部数据来自后端接口

- 移除 `src/lib/api.ts` 中的 mock 回退分支，`mock-data.ts` 只保留类型定义。
- 未配置 `VITE_API_BASE_URL` 或请求失败时，页面显示「后端未连接 / 加载失败 + 重试」空态，不再伪造数据。
- `useTodayTasks / useTodayStats / useUserActivity / useUserPlans` 增加 `loading`、`error` 状态；dashboard、calendar、stats、plans、admin、profile 统一渲染骨架屏与错误态。

## 3. 今日待办改为状态下拉框

- 状态枚举：`TODO 未开始` / `DOING 进行中` / `DONE 已完成`。
- 后端：`task` 表新增 `status varchar(16)`，`TaskEntity` 加字段；新增 `PUT /api/tasks/{id}/status`，保留 `toggle` 兼容。`status=DONE` 时写入学习记录并更新今日统计，取消完成则回退记录。
- 前端：`Task` 类型加 `status`，待办每行用 shadcn `Select` 展示当前状态（带状态色点），切换即调用接口并刷新今日统计。

## 4. 移除 AI / Lovable 相关标签

- `src/components/app-shell.tsx` 删除「AI 助教已就绪」徽标。
- `src/routes/plans.new.tsx` 删除「AI 智能引擎」标签。
- `src/routes/admin.tsx` 系统配置中的「AI 网关 / Lovable AI Gateway」改为后端返回的中性配置项。
- 全局检索确认无「Built with / End with Lovable」类可见文案（内部错误上报代码不显示给用户，保留）。

## 5. 独特的站点图标

- 生成一枚方形墨稿风格品牌图标：宣纸底 + 墨黑印章质感的墨迹「流」形笔画，呼应 InsightFlow 与墨稿手稿风。
- 输出 `public/favicon.png`，在 `src/routes/__root.tsx` 的 `head().links` 中替换 `favicon.ico`，删除默认 `public/favicon.ico`，同时用作 apple-touch-icon。

## 技术细节

- 数据库变更写入 `task-backend/src/main/resources/schema.sql`（`ALTER TABLE task ADD COLUMN status`，并按 `done` 回填历史数据）。
- `status` 与 `done` 双向保持一致，避免旧接口出现不一致。
- 完成后运行类型检查确认无编译错误。