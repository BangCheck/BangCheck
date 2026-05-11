-- V21: zombie CUSTOM 항목 (owner_user_id=NULL) → DEFAULT 정정
-- V19에서 item_type = 'CUSTOM'으로 잘못 분류된 시스템 항목 20개
-- V20이 일부만 정정(CCTV, 소화기 등)했고, 나머지 누락 상태
-- 효과: findAllForSettings + findCustomizedItems 쿼리 모두에서 포함됨
--       → 커스터마이징 STEP 3 표시 및 체크리스트 생성 시 반영 정상화

-- 내부 상태
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '방음'               AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '창문 / 망충망'       AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '현관 / 문틈'         AND owner_user_id IS NULL;

-- 문제 요소
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '누수 흔적'           AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '내/외부 소음'         AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '하수구/곰팡이 냄새'  AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '습기 / 결로'          AND owner_user_id IS NULL;

-- 안전/보안
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '야간 조명'            AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '경찰서 근처'          AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '밤길 안전도'          AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '접근성'               AND owner_user_id IS NULL;

-- 생활 편의
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '콘센트 수'            AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '집주인 거주 여부'     AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '택배 보관 환경'       AND owner_user_id IS NULL;

-- 주변 환경
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '야간 상권 인접도'     AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '녹지/산 인접도'       AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '음식점 밀집도'        AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '유동인구'             AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '공사장 여부'          AND owner_user_id IS NULL;
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '언덕 경사'            AND owner_user_id IS NULL;
