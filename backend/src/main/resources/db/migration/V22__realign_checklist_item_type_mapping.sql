-- V22: 기능명세서 v2.1.2 기준 체크리스트 항목 분류 및 성향 매핑 정규화
--
-- DEFAULT: 모든 사용자에게 항상 노출되는 기본 필수 항목 15개
-- USER_TYPE: 성향별/첫 자취형에서 노출되는 시스템 제공 추가 항목
-- CUSTOM: 사용자가 직접 추가한 개인 항목(owner_user_id NOT NULL)
--
-- checklist_items.user_type 단일 컬럼은 한 항목의 다중 성향 매핑을 표현할 수 없으므로
-- checklist_item_user_types 연결 테이블로 성향 매핑을 분리한다.

CREATE TABLE IF NOT EXISTS checklist_item_user_types (
    id BIGINT NOT NULL AUTO_INCREMENT,
    checklist_item_id BIGINT NOT NULL,
    user_type VARCHAR(30) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_checklist_item_user_type (checklist_item_id, user_type),
    CONSTRAINT fk_checklist_item_user_types_item
        FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id)
);

DELETE FROM checklist_item_user_types;

-- 1. 시스템 제공 항목 중 DEFAULT 15개를 제외한 나머지는 USER_TYPE으로 정리한다.
--    첫 자취형은 DEFAULT + 전체 USER_TYPE 항목을 조회한다.
UPDATE checklist_items
SET item_type = 'USER_TYPE',
    user_type = NULL,
    owner_user_id = NULL,
    updated_at = NOW()
WHERE owner_user_id IS NULL
  AND item_name NOT IN (
    '에어컨',
    '세탁기',
    '냉장고',
    '인터넷/와이파이',
    '채광',
    '환기',
    '수압 및 배수',
    '곰팡이',
    '벌레 흔적',
    '공동 현관',
    '창문 잠금장치',
    '카페 / 공부 공간',
    '코인세탁소',
    '편의점 / 마트',
    '대중교통 접근성'
  );

-- 2. 기능명세서 기준 DEFAULT 15개를 고정한다.
UPDATE checklist_items
SET item_type = 'DEFAULT',
    user_type = NULL,
    owner_user_id = NULL,
    updated_at = NOW()
WHERE owner_user_id IS NULL
  AND item_name IN (
    '에어컨',
    '세탁기',
    '냉장고',
    '인터넷/와이파이',
    '채광',
    '환기',
    '수압 및 배수',
    '곰팡이',
    '벌레 흔적',
    '공동 현관',
    '창문 잠금장치',
    '카페 / 공부 공간',
    '코인세탁소',
    '편의점 / 마트',
    '대중교통 접근성'
  );

-- 3. 성향 매핑 적재
-- 벌레회피형
INSERT INTO checklist_item_user_types (checklist_item_id, user_type, created_at, updated_at)
SELECT id, 'BUG_AVOIDER', NOW(), NOW()
FROM checklist_items
WHERE owner_user_id IS NULL
  AND item_name IN (
    '창문 / 망충망',
    '현관 / 문틈',
    '벌레 흔적',
    '하수구/곰팡이 냄새',
    '녹지/산 인접도',
    '음식점 밀집도'
  );

-- 소음민감형
INSERT INTO checklist_item_user_types (checklist_item_id, user_type, created_at, updated_at)
SELECT id, 'NOISE_SENSITIVE', NOW(), NOW()
FROM checklist_items
WHERE owner_user_id IS NULL
  AND item_name IN (
    '방음',
    '내/외부 소음',
    '대중교통 접근성',
    '야간 상권 인접도',
    '유동인구',
    '공사장 여부'
  );

-- 쾌적환경형
INSERT INTO checklist_item_user_types (checklist_item_id, user_type, created_at, updated_at)
SELECT id, 'CLEAN_FREAK', NOW(), NOW()
FROM checklist_items
WHERE owner_user_id IS NULL
  AND item_name IN (
    '채광',
    '환기',
    '곰팡이',
    '습기 / 결로',
    '녹지/산 인접도',
    '음식점 밀집도'
  );

-- 생활성능형
INSERT INTO checklist_item_user_types (checklist_item_id, user_type, created_at, updated_at)
SELECT id, 'PERFORMANCE_TYPE', NOW(), NOW()
FROM checklist_items
WHERE owner_user_id IS NULL
  AND item_name IN (
    '수압 및 배수',
    '내/외부 소음',
    '코인세탁소',
    '콘센트 수',
    '세탁 건조 공간'
  );

-- 4. DEFAULT 15개를 숨기는 기존 OFF 설정 잔재 제거
DELETE cs
FROM user_checklist_settings cs
JOIN checklist_items ci ON ci.id = cs.item_id
WHERE cs.is_enabled = false
  AND ci.owner_user_id IS NULL
  AND ci.item_type = 'DEFAULT'
  AND ci.item_name IN (
    '에어컨',
    '세탁기',
    '냉장고',
    '인터넷/와이파이',
    '채광',
    '환기',
    '수압 및 배수',
    '곰팡이',
    '벌레 흔적',
    '공동 현관',
    '창문 잠금장치',
    '카페 / 공부 공간',
    '코인세탁소',
    '편의점 / 마트',
    '대중교통 접근성'
  );
