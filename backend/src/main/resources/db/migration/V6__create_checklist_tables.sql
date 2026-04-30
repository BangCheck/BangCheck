CREATE TABLE IF NOT EXISTS checklist_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    user_type VARCHAR(30),
    input_type VARCHAR(30) NOT NULL,
    description VARCHAR(600),
    display_order INT,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6),
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS checklist_options (
    id BIGINT NOT NULL AUTO_INCREMENT,
    checklist_item_id BIGINT NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    display_order INT,
    PRIMARY KEY (id)
);