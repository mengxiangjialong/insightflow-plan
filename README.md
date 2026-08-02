# 墨策 InkPlan · AI 学习计划平台

> 今天开始，坚持学习，遇见更好的自己。

墨策是一个前后端分离的现代化 AI 学习计划平台：AI 根据目标生成分阶段学习路径，
每日任务可增删改、可打卡，成长以 GitHub 风格贡献墙与曲线图可视化。
界面遵循 Material Design 3 语汇，采用「墨稿手稿风」视觉方向，支持 PC / Pad / 手机与深色模式。

---

## 1. 目录结构

```
.
├── src/                # task-frontend：TanStack Start + React 19 + Tailwind v4
│   ├── routes/         # 文件路由（首页 / 仪表盘 / 计划 / 日历 / 统计 / 个人中心 / 管理后台）
│   ├── components/     # AppShell 响应式外壳、认证模态框、shadcn UI
│   ├── lib/            # api 客户端、认证、主题、用户数据隔离层、占位数据
│   └── styles.css      # M3 设计令牌（OKLCH/HEX）、深浅色主题、卡片高程与动效
└── task-backend/       # Java 17 + Spring Boot 3 + MySQL 8 + Redis 7
    └── src/main/java/com/inkplan/{config,controller,domain,dto,repository,security,service}
```

## 2. 技术栈

| 层         | 技术                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 前端       | React 19、TanStack Start / Router、TypeScript、Tailwind CSS v4、lucide-react |
| 设计体系   | Material Design 3 令牌化主题（浅色 / 深色）、响应式（≤640 / 768 / ≥1024） |
| 后端       | Java 17、Spring Boot 3.3（Web / Validation / Data JPA / Security）    |
| 存储       | MySQL 8（业务持久化）、Redis 7（打卡去重、AI 结果缓存、JWT 黑名单、热榜） |
| 鉴权       | JWT（jjwt 0.12.x）+ BCrypt                                            |
| 构建       | 前端 Vite 7 / Bun，后端 Maven                                        |

## 3. 功能一览

- **AI 计划生成**：输入目标、每日投入、周期、当前水平，生成分阶段路径与检查点。
- **今日任务**：新增 / 行内编辑 / 删除 / 勾选完成，完成率与今日进度实时联动。
- **计划详情**：阶段折叠卡片，阶段内任务可增删改、可勾选，Enter 保存 / Esc 取消。
- **学习日历**：GitHub 风格 20 周 × 7 天贡献墙，点选查看单日学习时长。
- **学习统计**：成长曲线（SVG 面积图）、周投入分布、连续天数、累计专注。
- **个人中心**：昵称 / 邮箱行内编辑，查看本人全部计划。
- **管理后台**：用户、公告、分类、AI Prompt、统计、配置、日志七大模块，仅管理员可见。
- **主题**：一键深浅色切换，偏好持久化。

## 4. 账号与权限

| 角色     | 账号             | 说明                                       |
| -------- | ---------------- | ------------------------------------------ |
| 管理员   | `admin@163.com` / `admin` | 唯一管理员入口，可进入 `/admin`     |
| 普通用户 | 任意合法邮箱 / ≥6 位密码 | 注册即用，仅可见自己的数据          |

登录 / 注册均做邮箱格式校验；`admin@163.com` 为系统保留账号，不可注册。

## 5. 数据隔离（重要）

**每个用户的数据互相不可见**，双层保证：

1. **前端**：所有学习数据经 `src/lib/user-data.ts` 读写，键名以当前登录用户 ID 命名空间化
   —— `inkplan.u.<userId>.tasks`、`inkplan.u.<userId>.plans`；活跃度按用户 ID 确定性生成。
   切换账号立即读到另一套数据，退出登录后回到空态。访问他人计划 ID 会展示「未找到」空态。
2. **后端**：JWT 过滤器把 subject 写入 `SecurityContext`，所有查询/写入以
   `CurrentUser.id()` 为过滤条件（如 `taskRepository.findByUserIdAndTaskDate(...)`），
   Redis 打卡键为 `inkplan:checkin:{userId}:{yyyyMMdd}`，越权访问返回 404 / 403。

## 6. 本地启动

### 前端（task-frontend）

```bash
bun install
bun run dev          # http://localhost:8080
```

未配置后端地址时，前端使用内置占位数据运行（纯前端预览）。配置后自动走真实接口：

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

### 后端（task-backend）

```bash
mysql -uroot -p -e "CREATE DATABASE inkplan DEFAULT CHARACTER SET utf8mb4;"
mysql -uroot -p inkplan < task-backend/src/main/resources/schema.sql
redis-server
cd task-backend && mvn spring-boot:run
```

## 7. 接口契约

| Method | Path                     | 说明                    |
| ------ | ------------------------ | ----------------------- |
| POST   | `/api/auth/login`        | 邮箱密码登录，返回 JWT  |
| GET    | `/api/me`                | 当前用户信息            |
| GET    | `/api/plans`             | 我的计划列表（按用户过滤） |
| GET    | `/api/plans/{id}`        | 计划详情（校验归属）    |
| POST   | `/api/plans/generate`    | AI 生成学习计划         |
| GET    | `/api/tasks/today`       | 今日任务                |
| POST   | `/api/tasks/{id}/toggle` | 切换任务完成状态        |
| POST   | `/api/checkin`           | 每日打卡（Redis 去重）  |

前端契约定义见 `src/lib/api.ts`（含请求失败自动回退占位数据的能力）。

## 8. 约定

- 颜色、阴影、圆角一律使用 `src/styles.css` 中的语义令牌，组件内不写死颜色类。
- 路由文件即页面，勿手改 `src/routeTree.gen.ts`。
- 新增用户级数据请走 `useScopedState`，避免绕过隔离层。
