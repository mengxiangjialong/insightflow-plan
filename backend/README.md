# 墨策 · 后端服务（Spring Boot 3 + MySQL 8 + Redis 7）

前后端分离架构：前端（TanStack Start / React 19，本仓库根目录）通过 REST API 调用本服务。

## 技术栈

- Java 17
- Spring Boot 3.3.x（Web / Validation / Data JPA / Security）
- MySQL 8（业务持久层）
- Redis 7（会话缓存、JWT 黑名单、AI 结果缓存、每日打卡去重、热点计划榜）
- JWT（jjwt 0.12.x）
- Maven

## 目录结构

```
backend/
├── pom.xml
├── src/main/java/com/inkplan/
│   ├── InkPlanApplication.java
│   ├── config/           # CORS、Redis、Security、JWT
│   ├── controller/       # REST 控制器（对应前端 src/lib/api.ts 契约）
│   ├── domain/           # JPA 实体
│   ├── dto/              # 请求/响应 DTO
│   ├── repository/       # Spring Data JPA
│   ├── service/          # 业务服务（含 AI 计划生成占位）
│   └── security/         # JWT 过滤器 / 用户上下文
└── src/main/resources/
    ├── application.yml
    └── schema.sql        # 建表脚本
```

## 快速启动

```bash
# 1) 建库
mysql -uroot -p -e "CREATE DATABASE inkplan DEFAULT CHARACTER SET utf8mb4;"
mysql -uroot -p inkplan < src/main/resources/schema.sql

# 2) 启动 Redis
redis-server

# 3) 启动后端（默认端口 8080）
mvn spring-boot:run
```

然后在前端仓库根目录创建 `.env`：

```
VITE_API_BASE_URL=http://localhost:8080
```

## 接口契约

| Method | Path                       | 说明                     |
| ------ | -------------------------- | ------------------------ |
| POST   | `/api/auth/login`          | 邮箱密码登录，返回 JWT   |
| GET    | `/api/me`                  | 当前用户信息             |
| GET    | `/api/plans`               | 我的学习计划列表         |
| GET    | `/api/plans/{id}`          | 计划详情                 |
| POST   | `/api/plans/generate`      | AI 生成个性化学习计划    |
| GET    | `/api/tasks/today`         | 今日任务                 |
| POST   | `/api/tasks/{id}/toggle`   | 切换任务完成状态         |
| POST   | `/api/checkin`             | 每日打卡（Redis 去重）   |

## Redis 键约定

- `inkplan:jwt:blacklist:{jti}` — JWT 黑名单
- `inkplan:ai:plan:{hash}` — AI 生成计划的结果缓存（TTL 7 天）
- `inkplan:checkin:{userId}:{yyyyMMdd}` — 打卡去重（SETNX + TTL 到当日结束）
- `inkplan:hot:plans` — 热门计划榜（ZSET）