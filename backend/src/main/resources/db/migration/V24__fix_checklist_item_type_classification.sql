-- V24: 명세서 v2.1.2 기준 체크리스트 항목 분류 정정
--
-- 문제: V22가 "상태=기본" 15개를 DEFAULT로 분류했으나,
--       명세서 기준 "사용자 유형 컬럼이 -/공란인 24개"가 공통 항목이어야 함.
--
-- 수정:
--   1) DEFAULT 오분류 7건 → USER_TYPE (유형별 노출 전환)
--      - checklist_item_user_types 매핑은 V22에서 이미 적재됨 (변경 불필요)
--   2) USER_TYPE 매핑 누락 16건 → DEFAULT (공통 항목으로 복원)
--      - 어떤 유형 선택해도 미노출되던 항목들을 공통으로 전환
--
-- 결과: DEFAULT 24개 (15 - 7 + 16), 유형별 최대 30개 노출 (명세서 일치)

-- 1. DEFAULT 오분류 7건 → USER_TYPE
UPDATE checklist_items
SET item_type  = 'USER_TYPE',
    updated_at = NOW()
WHERE owner_user_id IS NULL
  AND item_name IN (
    '채광',
    '환기',
    '수압 및 배수',
    '곰팡이',
    '벌레 흔적',
    '코인세탁소',
    '대중교통 접근성'
  );

-- 2. USER_TYPE 매핑 누락 16건 → DEFAULT
UPDATE checklist_items
SET item_type  = 'DEFAULT',
    updated_at = NOW()
WHERE owner_user_id IS NULL
  AND item_name IN (
    '가스레인지/인덕션',
    '책상/의자',
    '옷장/수납',
    '난방',
    '누수 흔적',
    'CCTV 설치 여부',
    '야간 조명',
    '경찰서 근처',
    '밤길 안전도',
    '접근성',
    '소화기/화재 경보',
    '자전거 / 차량 주차',
    '병원 / 약국',
    '집주인 거주 여부',
    '택배 보관 환경',
    '언덕 경사'
  );
