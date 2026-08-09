ALTER TABLE checklist_items
    ADD COLUMN issue_type VARCHAR(30) NULL AFTER input_type;

UPDATE checklist_items
SET issue_type = CASE item_name
    WHEN '곰팡이' THEN 'MOLD'
    WHEN '누수 흔적' THEN 'LEAK'
    WHEN '벌레 흔적' THEN 'BUG'
    WHEN '하수구/곰팡이 냄새' THEN 'DRAIN_SMELL'
    WHEN '습기 / 결로' THEN 'CONDENSATION'
    ELSE issue_type
END
WHERE item_name IN ('곰팡이', '누수 흔적', '벌레 흔적', '하수구/곰팡이 냄새', '습기 / 결로');
