# InsightFlow · 墨策 AI 学习计划平台

墨稿手稿风格的 AI 学习计划平台：AI 生成分阶段学习路径、今日待办（状态可切换）、
学习打卡、GitHub 风格学习日历、学习统计与成长曲线，以及完整的管理后台。

代码分为两个独立仓库：

```text
insightflow-plan/
  task-frontend/   前端：React 19 + TanStack Start + Tailwind CSS v4
  task-backend/    后端：Java 17 + Spring Boot 3 + MySQL 8 + Redis 7
```

本仓库即 `task-frontend`（前端工程位于根目录），`task-backend/` 是完整、可独立构建的
Maven 工程，可原样拆分为独立仓库。

## 拆分为两个仓库

```bash
# 1) 后端
cp -r task-backend /path/to/task-backend
cd /path/to/task-backend && git init && git add . && git commit -m "init task-backend"
git remote add origin git@github.com:<org>/task-backend.git && git push -u origin main

# 2) 前端（当前仓库，删除 task-backend 目录后推送）
rm -rf task-backend
git remote add origin git@github.com:<org>/task-frontend.git && git push -u origin main
```

## 前端 task-frontend

```bash
bun install
echo "VITE_API_BASE_URL=http://localhost:8080" > .env
bun run dev            # http://localhost:8080（前端）
```

- 所有页面数据均通过 `src/lib/api.ts` 从后端接口获取，**不含任何本地示例数据**。
- 未配置 `VITE_API_BASE_URL` 或后端不可达时，页面显示「后端未连接 / 加载失败」空态。
- JWT 存于 `localStorage`（`inkplan.token`），随请求以 `Authorization: Bearer` 发送。

目录要点：

| 路径 | 说明 |
| --- | --- |
| `src/lib/api.ts` | 接口客户端与错误处理（ApiError / apiErrorText） |
| `src/lib/user-data.ts` | 数据 Hook（今日待办、今日统计、日历与成长曲线、计划） |
| `src/lib/auth.tsx` | 登录 / 注册 / GitHub 登录、会话持久化 |
| `src/routes/` | 首页、仪表盘、计划、日历、统计、个人中心、管理后台 |

## 后端 task-backend

```bash
cd task-backend
mysql -uroot -p < src/main/resources/schema.sql
mvn spring-boot:run    # http://localhost:8080
```

配置见 `task-backend/src/main/resources/application.yml`（MySQL、Redis、JWT 密钥、
GitHub OAuth Client ID/Secret）。

主要接口：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/login` `/api/auth/register` | 邮箱登录 / 注册，返回 JWT |
| GET | `/api/auth/github/url` | GitHub OAuth 授权地址（state 存于 Redis） |
| GET/PUT | `/api/me` | 个人信息 |
| GET/POST | `/api/goals` | 学习目标 |
| GET/POST | `/api/plans` `/api/plans/generate` | 学习计划与 AI 生成（结果 Redis 缓存） |
| GET | `/api/tasks/today` | 今日待办（当天为空自动初始化默认任务） |
| POST/PUT/DELETE | `/api/tasks` `/api/tasks/{id}` | 待办增删改 |
| PUT | `/api/tasks/{id}/status` | 更新任务状态：`TODO` / `DOING` / `DONE` |
| GET/POST | `/api/checkin` | 打卡状态 / 打卡（Redis 防重复） |
| GET | `/api/stats/today` `/summary` `/heatmap` `/growth` `/day/{date}` | 学习统计 |
| GET… | `/api/admin/**` | 用户、公告、分类、Prompt、配置、日志、统计（仅 admin） |

## 权限与数据隔离

- 系统管理员固定为 `admin@163.com`（密码 `admin`），该邮箱不可注册。
- 后端所有查询以 JWT 中的 `CurrentUser.id()` 过滤，越权访问返回 404，
  因此不同账号的任务、计划与统计互不可见。

## 任务状态

今日待办每行提供状态下拉框：`未开始 TODO` / `进行中 DOING` / `已完成 DONE`。
切换为 `DONE` 时写入学习记录并刷新今日统计；取消完成会回退记录。
