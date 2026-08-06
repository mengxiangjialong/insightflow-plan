-- 墨策 · MySQL 8 建表脚本

CREATE TABLE IF NOT EXISTS `user` (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(128) NOT NULL UNIQUE,
  password     VARCHAR(128) NOT NULL,
  name         VARCHAR(64)  NOT NULL,
  role         VARCHAR(32)  NOT NULL DEFAULT 'user',
  status       VARCHAR(16)  NOT NULL DEFAULT 'active',
  provider     VARCHAR(32)  NOT NULL DEFAULT 'local',
  provider_id  VARCHAR(64)  NULL,
  avatar_url   VARCHAR(256) NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `plan` (
  id            VARCHAR(32) PRIMARY KEY,
  user_id       BIGINT      NOT NULL,
  title         VARCHAR(128) NOT NULL,
  goal          VARCHAR(512) NOT NULL,
  daily_minutes INT          NOT NULL,
  weeks         INT          NOT NULL,
  level         VARCHAR(32)  NOT NULL,
  progress      DOUBLE       NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_plan_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `phase` (
  id         VARCHAR(32) PRIMARY KEY,
  plan_id    VARCHAR(32) NOT NULL,
  idx        INT         NOT NULL,
  title      VARCHAR(128) NOT NULL,
  summary    VARCHAR(512),
  progress   DOUBLE      NOT NULL DEFAULT 0,
  status     VARCHAR(16) NOT NULL DEFAULT 'locked',
  KEY idx_phase_plan (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `phase_task` (
  id       VARCHAR(32) PRIMARY KEY,
  phase_id VARCHAR(32) NOT NULL,
  title    VARCHAR(256) NOT NULL,
  done     TINYINT(1) NOT NULL DEFAULT 0,
  KEY idx_ptask_phase (phase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `task` (
  id        VARCHAR(32) PRIMARY KEY,
  user_id   BIGINT      NOT NULL,
  plan_id   VARCHAR(32),
  title     VARCHAR(256) NOT NULL,
  detail    VARCHAR(512),
  minutes   INT          NOT NULL,
  category  VARCHAR(32)  NOT NULL,
  done      TINYINT(1)   NOT NULL DEFAULT 0,
  status    VARCHAR(16)  NOT NULL DEFAULT 'TODO',
  task_date DATE         NOT NULL,
  KEY idx_task_user_date (user_id, task_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `checkin` (
  id           VARCHAR(32) PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  checkin_date DATE   NOT NULL,
  minutes      INT    NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_day (user_id, checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学习记录（学习日历 / 统计 / 成长曲线数据源）
CREATE TABLE IF NOT EXISTS `study_record` (
  id         VARCHAR(32) PRIMARY KEY,
  user_id    BIGINT      NOT NULL,
  study_date DATE        NOT NULL,
  minutes    INT         NOT NULL DEFAULT 0,
  title      VARCHAR(256),
  category   VARCHAR(32),
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_record_user_date (user_id, study_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学习目标
CREATE TABLE IF NOT EXISTS `goal` (
  id            VARCHAR(32) PRIMARY KEY,
  user_id       BIGINT      NOT NULL,
  title         VARCHAR(128) NOT NULL,
  description   VARCHAR(512),
  daily_minutes INT          NOT NULL DEFAULT 90,
  weeks         INT          NOT NULL DEFAULT 12,
  level         VARCHAR(32)  NOT NULL DEFAULT 'intermediate',
  status        VARCHAR(16)  NOT NULL DEFAULT 'active',
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_goal_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 公告
CREATE TABLE IF NOT EXISTS `announcement` (
  id         VARCHAR(32) PRIMARY KEY,
  title      VARCHAR(128) NOT NULL,
  content    VARCHAR(2000),
  pinned     TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类
CREATE TABLE IF NOT EXISTS `category` (
  id         VARCHAR(32) PRIMARY KEY,
  name       VARCHAR(64) NOT NULL,
  item_count INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AI Prompt 模板
CREATE TABLE IF NOT EXISTS `ai_prompt` (
  id         VARCHAR(32) PRIMARY KEY,
  name       VARCHAR(64) NOT NULL,
  scene      VARCHAR(64),
  content    VARCHAR(4000),
  enabled    TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统配置
CREATE TABLE IF NOT EXISTS `system_config` (
  id           VARCHAR(32) PRIMARY KEY,
  config_key   VARCHAR(64) NOT NULL UNIQUE,
  config_value VARCHAR(2000),
  description  VARCHAR(256)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统日志
CREATE TABLE IF NOT EXISTS `sys_log` (
  id         VARCHAR(32) PRIMARY KEY,
  user_id    BIGINT,
  level      VARCHAR(16) NOT NULL DEFAULT 'INFO',
  action     VARCHAR(64),
  message    VARCHAR(1000),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_log_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GitHub 账号登录唯一约束（已存在库可单独执行）
ALTER TABLE `user` ADD UNIQUE KEY uk_provider (provider, provider_id);

-- 升级已有库：为 task 增加状态列并按 done 回填
-- ALTER TABLE `task` ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'TODO';
-- UPDATE `task` SET status = IF(done = 1, 'DONE', 'TODO');
