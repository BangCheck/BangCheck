-- V20: 체크리스트 시드 데이터 분류 / 옵션 누락 정정
--
-- V17 시드 (V19 로 재적재) 단계의 세 가지 오류를 정정한다.
--
-- 1) item_type 오분류 — 명세상 "기본" 항목인 채광 / 환기 / 수압 및 배수가
--    USER_TYPE 으로 들어가 GET /api/checklist/items 응답에서 누락.
--
-- 2) 좀비 CUSTOM 항목 — item_type='CUSTOM' + owner_user_id IS NULL 로 적재되어
--    JPQL `(ci.itemType = 'CUSTOM' AND ci.ownerUserId = :userId)` 분기에서
--    어떤 사용자에게도 매치되지 않아 화면에 노출되지 않던 항목들.
--
-- 3) BOOLEAN 항목 옵션 누락 — input_type='BOOLEAN' 항목 9개에 대한
--    checklist_options INSERT 가 V17/V19 에서 빠져 있어 응답의 options 가
--    빈 배열 → FE 선택지 렌더링 불가.

-- 1) USER_TYPE 오분류 → DEFAULT
UPDATE checklist_items
SET item_type = 'DEFAULT', user_type = NULL
WHERE item_name IN ('채광', '환기', '수압 및 배수');

-- 2) CUSTOM + owner_user_id IS NULL 좀비 항목 → DEFAULT
UPDATE checklist_items
SET item_type = 'DEFAULT', user_type = NULL
WHERE owner_user_id IS NULL
  AND item_type = 'CUSTOM'
  AND item_name IN (
    'CCTV 설치 여부',
    '소화기/화재 경보',
    '자전거 / 차량 주차',
    '병원 / 약국',
    '세탁 건조 공간'
  );

-- 3) BOOLEAN 항목 옵션 누락 보강 ('없음' 1, '있음' 2)
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '공동 현관' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '공동 현관' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '창문 잠금장치' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '창문 잠금장치' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = 'CCTV 설치 여부' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = 'CCTV 설치 여부' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '소화기/화재 경보' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '소화기/화재 경보' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '카페 / 공부 공간' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '카페 / 공부 공간' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '코인세탁소' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '코인세탁소' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '자전거 / 차량 주차' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '자전거 / 차량 주차' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '병원 / 약국' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '병원 / 약국' UNION ALL
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '세탁 건조 공간' UNION ALL
SELECT id, '있음', 2 FROM checklist_items WHERE item_name = '세탁 건조 공간';
