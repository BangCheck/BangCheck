ALTER TABLE rooms
    ADD COLUMN name                     VARCHAR(255),
    ADD COLUMN is_management_fee_unknown TINYINT(1) NOT NULL DEFAULT 0,
    ADD COLUMN is_move_in_date_negotiable TINYINT(1),
    ADD COLUMN has_parking              TINYINT(1),
    ADD COLUMN special_floor            VARCHAR(50);
