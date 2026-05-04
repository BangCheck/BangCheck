CREATE TABLE room_check_results (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    room_id    BIGINT NOT NULL,
    item_id    BIGINT NOT NULL,
    value_text TEXT,
    value_number DECIMAL(10,2),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_item (room_id, item_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (item_id) REFERENCES checklist_items(id)
);

CREATE TABLE room_check_selected_options (
    id        BIGINT NOT NULL AUTO_INCREMENT,
    result_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (result_id) REFERENCES room_check_results(id),
    FOREIGN KEY (option_id) REFERENCES checklist_options(id)
);
