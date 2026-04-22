CREATE TABLE IF NOT EXISTS users (
    user_id          BIGINT          NOT NULL AUTO_INCREMENT,
    nickname         VARCHAR(20)     NOT NULL,
    role             VARCHAR(20)     NOT NULL,
    status           VARCHAR(20)     NOT NULL,
    provider         VARCHAR(20)     NOT NULL,
    social_provider_id VARCHAR(255)  NOT NULL,
    is_onboarding_done TINYINT(1)    NOT NULL DEFAULT 0,
    email            VARCHAR(100)    NOT NULL,
    created_at       DATETIME(6)     NOT NULL,
    updated_at       DATETIME(6)     NOT NULL,
    deleted_at       DATETIME(6),
    is_deleted       TINYINT(1)      NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;