-- 墨策 · MySQL 8 建表脚本

CREATE TABLE IF NOT EXISTS `user` (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(128) NOT NULL UNIQUE,
  password     VARCHAR(128) NOT NULL,
  name         VARCHAR(64)  NOT NULL,
  role         VARCHAR(32)  NOT NULL DEFAULT 'user',
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
  task_date DATE         NOT NULL,
  KEY idx_task_user_date (user_id, task_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `checkin` (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  checkin_day DATE   NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_day (user_id, checkin_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GitHub 账号登录唯一约束（已存在库可单独执行）
ALTER TABLE `user` ADD UNIQUE KEY uk_provider (provider, provider_id);
