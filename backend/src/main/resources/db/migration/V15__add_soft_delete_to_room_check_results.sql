ALTER TABLE room_check_results
    ADD COLUMN deleted_at DATETIME(6),
    ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0;
