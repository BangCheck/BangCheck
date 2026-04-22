ALTER TABLE users CHANGE COLUMN user_id id BIGINT NOT NULL AUTO_INCREMENT;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL UNIQUE,
    token       VARCHAR(500)    NOT NULL,
    expires_at  DATETIME(6)     NOT NULL,
    created_at  DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;