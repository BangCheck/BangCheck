CREATE TABLE IF NOT EXISTS user_type_selections (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    user_type VARCHAR(30) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_user_type (user_id, user_type),
    PRIMARY KEY (id)
);
