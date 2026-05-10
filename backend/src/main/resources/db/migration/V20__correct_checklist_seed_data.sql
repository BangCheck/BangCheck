-- V20: V19 시드 데이터 오류 정정
-- 1. item_type 오분류 (USER_TYPE → DEFAULT): 채광 / 환기 / 수압 및 배수
-- 2. 좀비 CUSTOM 항목 정정 (CUSTOM+ownerUserId=NULL → DEFAULT): OPTION 4건 + 기타 5건
-- 3. BOOLEAN 항목 options 누락 보완: 없음(1) / 있음(2)

-- ── 1. item_type 오분류 정정 ─────────────────────────────────────────────────
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '채광';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '환기';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '수압 및 배수';

-- ── 2. 좀비 CUSTOM 정정 ─────────────────────────────────────────────────────
-- OPTION 카테고리
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '가스레인지/인덕션' AND category = 'OPTION';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '책상/의자'         AND category = 'OPTION';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '옷장/수납'         AND category = 'OPTION';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '난방'              AND category = 'OPTION';

-- 기타 카테고리
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = 'CCTV 설치 여부';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '소화기/화재 경보';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '자전거 / 차량 주차';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '병원 / 약국';
UPDATE checklist_items SET item_type = 'DEFAULT' WHERE item_name = '세탁 건조 공간';

-- ── 3. BOOLEAN 항목 options 누락 보완 ───────────────────────────────────────
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '공동 현관'        UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '공동 현관'        UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '창문 잠금장치'    UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '창문 잠금장치'    UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = 'CCTV 설치 여부'  UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = 'CCTV 설치 여부'  UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '소화기/화재 경보' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '소화기/화재 경보' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '카페 / 공부 공간' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '카페 / 공부 공간' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '코인세탁소'       UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '코인세탁소'       UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '자전거 / 차량 주차' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '자전거 / 차량 주차' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '병원 / 약국'      UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '병원 / 약국'      UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '세탁 건조 공간'   UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '세탁 건조 공간';
