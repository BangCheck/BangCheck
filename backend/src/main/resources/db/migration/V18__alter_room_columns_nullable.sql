ALTER TABLE rooms
    MODIFY COLUMN rent_type VARCHAR(20) NULL,
    MODIFY COLUMN maintenance_status VARCHAR(20) NULL,
    MODIFY COLUMN is_management_fee_unknown TINYINT(1) NULL,
    MODIFY COLUMN has_loan TINYINT(1) NULL,
    MODIFY COLUMN can_register_address TINYINT(1) NULL,
    MODIFY COLUMN building_type VARCHAR(50) NULL,
    MODIFY COLUMN has_elevator TINYINT(1) NULL,
    MODIFY COLUMN direction VARCHAR(20) NULL;
