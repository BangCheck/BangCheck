UPDATE rooms SET special_floor = NULL WHERE special_floor IS NOT NULL AND special_floor NOT IN ('SEMI_BASEMENT', 'ROOFTOP', 'NONE');
ALTER TABLE rooms MODIFY COLUMN special_floor VARCHAR(20);
