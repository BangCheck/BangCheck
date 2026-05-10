-- 기존 체크리스트 시드 데이터에 중복 INSERT가 누적되어 itemType 분기가 무력화된 상태를 정리한다.
-- 운영/개발 모두에서 안전하게 재실행되도록 TRUNCATE 후 V17과 동일한 시드를 다시 적재한다.
-- 사용자 답변(room_check_results) 및 체크리스트 on/off 설정(user_checklist_settings)도
-- 마스터 테이블 FK가 깨질 수 있어 함께 정리한다. 사용자 성향 선택(user_type_selections)은 보존한다.

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE room_check_selected_options;
TRUNCATE TABLE room_check_results;
TRUNCATE TABLE user_checklist_settings;
TRUNCATE TABLE checklist_options;
TRUNCATE TABLE checklist_items;

ALTER TABLE checklist_items AUTO_INCREMENT = 1;
ALTER TABLE checklist_options AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- 옵션 (OPTION)
INSERT INTO checklist_items (item_name, category, item_type, user_type, input_type, description, display_order, created_at, updated_at, is_deleted)
VALUES
('에어컨', 'OPTION', 'DEFAULT', NULL, 'MULTIPLE_CHOICE', NULL, 1, NOW(), NOW(), 0),
('세탁기', 'OPTION', 'DEFAULT', NULL, 'MULTIPLE_CHOICE', NULL, 2, NOW(), NOW(), 0),
('냉장고', 'OPTION', 'DEFAULT', NULL, 'MULTIPLE_CHOICE', NULL, 3, NOW(), NOW(), 0),
('인터넷/와이파이', 'OPTION', 'DEFAULT', NULL, 'MULTIPLE_CHOICE', NULL, 4, NOW(), NOW(), 0),
('가스레인지/인덕션', 'OPTION', 'CUSTOM', NULL, 'MULTIPLE_CHOICE', NULL, 5, NOW(), NOW(), 0),
('책상/의자', 'OPTION', 'CUSTOM', NULL, 'MULTIPLE_CHOICE', NULL, 6, NOW(), NOW(), 0),
('옷장/수납', 'OPTION', 'CUSTOM', NULL, 'MULTIPLE_CHOICE', NULL, 7, NOW(), NOW(), 0),
('난방', 'OPTION', 'CUSTOM', NULL, 'MULTIPLE_CHOICE', NULL, 8, NOW(), NOW(), 0);

-- 내부 상태 (INTERNAL_STATE)
INSERT INTO checklist_items (item_name, category, item_type, user_type, input_type, description, display_order, created_at, updated_at, is_deleted)
VALUES
('채광', 'INTERNAL_STATE', 'USER_TYPE', 'CLEAN_FREAK', 'SINGLE_CHOICE', '낮 시간 방문 시 자연광 들어오는 정도 확인

✓ 가능하면 오전/오후 두 번 방문하여 햇빛 변화 확인
✓ 창문 크기와 위치, 가리는 건물/장애물 확인
✓ 모든 조명을 끄고 자연광만으로 밝기 체감
✓ 흐린 날 추가 방문하면 최소 채광 확인 가능
✓ 인근 건물 신축 계획 확인 (향후 채광 변화 예측)', 1, NOW(), NOW(), 0),
('환기', 'INTERNAL_STATE', 'USER_TYPE', 'CLEAN_FREAK', 'SINGLE_CHOICE', '창문 개수, 위치, 맞통풍 가능 여부 확인

✓ 창문이 두 면 이상에 있는지 확인 (맞통풍 가능 여부)
✓ 환기창/팬 작동 테스트 (욕실, 주방)
✓ 창문 열고 공기 흐름 직접 체감
✓ 창문 외부 환경 확인 (도로/벽/건물 등)
✓ 결로/곰팡이 흔적이 있다면 환기 부족 의심', 2, NOW(), NOW(), 0),
('수압 및 배수', 'INTERNAL_STATE', 'USER_TYPE', 'PERFORMANCE_TYPE', 'SINGLE_CHOICE', '주방 싱크대, 욕실 샤워, 변기 모두 직접 작동

✓ 모든 수전을 동시에 켜서 수압 변화 확인
✓ 뜨거운 물이 나오기까지 걸리는 시간 측정
✓ 변기 물 내림 후 다시 차오르는 속도 확인
✓ 욕실 배수구에 물 부어 빠지는 속도 확인
✓ 싱크대 배수 시 역류 또는 냄새 여부 확인
✓ 세탁기 급수/배수 확인 (해당 시)', 3, NOW(), NOW(), 0),
('방음', 'INTERNAL_STATE', 'CUSTOM', 'NOISE_SENSITIVE', 'SINGLE_CHOICE', '벽을 두드려보거나 외부 소음 들리는 정도 확인

✓ 벽을 가볍게 두드려 두께 체감 (텅 빈 소리는 얇은 벽)
✓ 방문 닫고 외부 복도 소리 들리는지 확인
✓ 옆집/위층 발소리, 대화 소리 확인 (가능하면 거주 시간대 방문)
✓ 창문 닫고 외부 소음 차단 정도 확인
✓ 화장실 환풍구로 다른 호실 소리 들리는지 확인', 4, NOW(), NOW(), 0),
('창문 / 망충망', 'INTERNAL_STATE', 'CUSTOM', 'BUG_AVOIDER', 'SINGLE_CHOICE', '창문 개폐 작동 + 방충망 파손 여부 확인', 5, NOW(), NOW(), 0),
('현관 / 문틈', 'INTERNAL_STATE', 'CUSTOM', 'BUG_AVOIDER', 'SINGLE_CHOICE', '현관문 개폐 + 문틈 사이 빛/바람 새는지 확인

✓ 문 닫은 상태에서 외부 빛이 새어 들어오는지 확인 (어둡게 한 후 체크)
✓ 문 사이로 손가락이나 종이가 들어가는지 확인 (단열/방음 영향)
✓ 도어락 작동 부드러움 확인
✓ 외풍 차단 패드/도어 스토퍼 부착 가능 여부 확인', 6, NOW(), NOW(), 0);

-- 문제 요소 (PROBLEM)
INSERT INTO checklist_items (item_name, category, item_type, user_type, input_type, description, display_order, created_at, updated_at, is_deleted)
VALUES
('곰팡이', 'PROBLEM', 'DEFAULT', 'CLEAN_FREAK', 'SINGLE_CHOICE', '벽지 모서리, 욕실 천장, 창문 주변, 싱크대 하부 확인

✓ 가구/가전 뒤편(특히 침대 머리맡 벽) 확인 요청
✓ 욕실 실리콘/타일 사이 검은 점 형태 확인
✓ 벽지/장판 들뜸이 있는 구역 의심
✓ 창문 주변 결로 흔적 (얼룩/물자국) 확인
✓ 곰팡이 냄새가 나는 공간 (옷장/신발장 내부) 확인
✓ 새로 도배한 흔적이 있다면 그 이유 문의', 1, NOW(), NOW(), 0),
('누수 흔적', 'PROBLEM', 'CUSTOM', NULL, 'SINGLE_CHOICE', '천장 얼룩, 창문 물기, 화장실 배관 연결부 확인

✓ 천장 얼룩/변색 부위 확인 (특히 욕실/주방 위층 배관 통과 지점)
✓ 벽 하단 페인트 벗겨짐, 벽지 들뜸 확인
✓ 욕실 배관 연결부 물기/녹 흔적 확인
✓ 베란다/세탁기 주변 바닥 곰팡이 또는 물자국 확인
✓ 비 오는 날이나 직후 방문 권장 (실제 누수 확인 가능)
✓ 옥상 바로 아래층/반지하는 더 꼼꼼한 확인 필요', 2, NOW(), NOW(), 0),
('벌레 흔적', 'PROBLEM', 'DEFAULT', 'BUG_AVOIDER', 'SINGLE_CHOICE', '트랩 확인, 싱크대 하부/창틀/몰딩 주변/배수구 확인

✓ 검은 점 형태의 배설물이 있는지 확인 (싱크대 하부, 서랍 모서리)
✓ 조명 커버 안에 벌레 시체가 있는지 확인
✓ 트랩 및 모서리에 쥐똥/치약 형태의 흔적이 있는지 확인
✓ 싱크대 하부 수전 주변 끈끈한 자국/알 확인
✓ 베란다 배수구, 화장실 배수구 트랩 상태 확인
✓ 창틀 실리콘 갈라짐 (외부 유입 경로) 확인', 3, NOW(), NOW(), 0),
('내/외부 소음', 'PROBLEM', 'CUSTOM', 'NOISE_SENSITIVE', 'SINGLE_CHOICE', '방문 시 일정 시간 머무르며 외부 소음 청취

✓ 가능한 한 거주 시간대(저녁, 주말)에 방문하여 실제 소음 체감
✓ 창문 열고/닫고 각각 외부 소음 차이 확인
✓ 도로 인접 시 차량 소음, 학교/상가 인접 시 시간대별 변화 확인
✓ 위층/옆집 발소리/대화 소리 확인
✓ 화장실 배관 소음, 환풍구로 들리는 소음 확인
✓ 인근 공사장/유흥가 유무 확인', 4, NOW(), NOW(), 0),
('하수구/곰팡이 냄새', 'PROBLEM', 'CUSTOM', 'BUG_AVOIDER', 'SINGLE_CHOICE', '욕실, 싱크대, 베란다 등 배수구 주변에서 직접 냄새 확인

✓ 환기구를 막은 상태에서 냄새 체크 (환기로 가려진 냄새 확인)
✓ 배수구 트랩 물 부어 봉수 확인 (마른 트랩이면 하수 냄새 올라옴)
✓ 옷장/신발장 내부 곰팡이 냄새 확인
✓ 비 온 직후 방문 시 습기 관련 냄새 더 명확히 확인 가능
✓ 이전 거주자가 사용한 방향제/탈취제로 가려진 냄새 의심', 5, NOW(), NOW(), 0),
('습기 / 결로', 'PROBLEM', 'CUSTOM', 'CLEAN_FREAK', 'SINGLE_CHOICE', '창문 주변, 벽 하단, 욕실 외벽 결로 흔적 확인

✓ 창문 주변 물자국/얼룩 (결로 발생 흔적) 확인
✓ 벽 하단 곰팡이/페인트 벗겨짐 확인
✓ 옷장 안쪽 곰팡이/습기 냄새 확인
✓ 겨울철 방문 시 결로 직접 확인 가능
✓ 환기 부족, 단열 부실, 외벽 면한 방인 경우 위험도 증가
✓ 반지하/북향 방은 더 꼼꼼한 확인 필요', 6, NOW(), NOW(), 0);

-- 안전/보안 (SAFETY)
INSERT INTO checklist_items (item_name, category, item_type, user_type, input_type, description, display_order, created_at, updated_at, is_deleted)
VALUES
('공동 현관', 'SAFETY', 'DEFAULT', NULL, 'BOOLEAN', '건물 출입구의 공동 현관 비밀번호 또는 카드키 시스템 확인', 1, NOW(), NOW(), 0),
('창문 잠금장치', 'SAFETY', 'DEFAULT', NULL, 'BOOLEAN', '모든 창문의 잠금장치 정상 작동 여부 확인', 2, NOW(), NOW(), 0),
('CCTV 설치 여부', 'SAFETY', 'CUSTOM', NULL, 'BOOLEAN', '건물 내외부 CCTV 설치 위치 및 작동 여부 확인', 3, NOW(), NOW(), 0),
('야간 조명', 'SAFETY', 'CUSTOM', NULL, 'SINGLE_CHOICE', '저녁/밤 시간대 방문 시 골목 및 건물 주변 조명 밝기 확인

✓ 가능하면 저녁 7시 이후 방문 권장
✓ 지하철역/버스정류장에서 집까지 가는 길의 가로등 확인
✓ 골목 진입 후 최종 도착지까지 어두운 구간 유무 확인
✓ 건물 입구 자동 센서 등 설치 여부 확인
✓ 인근 편의점/상가 영업시간 확인 (불빛 보조 효과)', 4, NOW(), NOW(), 0),
('경찰서 근처', 'SAFETY', 'CUSTOM', NULL, 'SINGLE_CHOICE', '지도 앱으로 가장 가까운 경찰서/지구대 거리 확인', 5, NOW(), NOW(), 0),
('밤길 안전도', 'SAFETY', 'CUSTOM', NULL, 'SINGLE_CHOICE', '저녁 시간 직접 거주지까지 걸어보며 안전성 확인

✓ 늦은 저녁 시간 직접 가장 가까운 역/정류장에서 도착 경로 걸어보기
✓ 인적이 드문 골목, 외진 구역 유무 확인
✓ 인근 유흥가/유동인구 확인
✓ 방범 순찰 빈도 확인 (지구대 문의 가능)
✓ 비상 상황 대피 가능한 24시간 영업장 위치 확인', 6, NOW(), NOW(), 0),
('접근성', 'SAFETY', 'CUSTOM', NULL, 'SINGLE_CHOICE', '큰길에서 집까지 진입 경로 확인', 7, NOW(), NOW(), 0),
('소화기/화재 경보', 'SAFETY', 'CUSTOM', NULL, 'BOOLEAN', '복도 소화기 비치 위치 및 화재 감지기 설치 여부 확인', 8, NOW(), NOW(), 0);

-- 생활 편의 (CONVENIENCE)
INSERT INTO checklist_items (item_name, category, item_type, user_type, input_type, description, display_order, created_at, updated_at, is_deleted)
VALUES
('카페 / 공부 공간', 'CONVENIENCE', 'DEFAULT', NULL, 'BOOLEAN', '도보 10분 내 카페/스터디카페/공공도서관 위치 확인', 1, NOW(), NOW(), 0),
('코인세탁소', 'CONVENIENCE', 'DEFAULT', 'PERFORMANCE_TYPE', 'BOOLEAN', '도보 10분 내 코인세탁소 위치 확인 (세탁기 옵션 없을 시 필수)', 2, NOW(), NOW(), 0),
('자전거 / 차량 주차', 'CONVENIENCE', 'CUSTOM', NULL, 'BOOLEAN', '건물 주차장 또는 주변 거치 공간 확인', 3, NOW(), NOW(), 0),
('병원 / 약국', 'CONVENIENCE', 'CUSTOM', NULL, 'BOOLEAN', '도보 또는 대중교통 5~10분 내 병원/약국 위치 확인', 4, NOW(), NOW(), 0),
('콘센트 수', 'CONVENIENCE', 'CUSTOM', 'PERFORMANCE_TYPE', 'SINGLE_CHOICE', '각 방의 콘센트 위치 및 개수 직접 확인

✓ 책상 위치에 충분한 콘센트가 있는지 확인 (전자기기 사용)
✓ 침대 머리맡 콘센트 유무 확인 (충전기/조명 사용)
✓ 주방 콘센트 위치/개수 확인 (가전 사용)
✓ 콘센트 노후 상태 확인 (그을음, 흔들림)
✓ 멀티탭 사용 시 안전 여부 (오래된 건물은 누전 위험)', 5, NOW(), NOW(), 0),
('집주인 거주 여부', 'CONVENIENCE', 'CUSTOM', NULL, 'SINGLE_CHOICE', '집주인이 같은 건물 또는 인근 거주 여부 확인', 6, NOW(), NOW(), 0),
('택배 보관 환경', 'CONVENIENCE', 'CUSTOM', NULL, 'SINGLE_CHOICE', '공동 택배함 또는 무인 택배 보관 시스템 유무 확인', 7, NOW(), NOW(), 0),
('세탁 건조 공간', 'CONVENIENCE', 'CUSTOM', 'PERFORMANCE_TYPE', 'BOOLEAN', '실내 건조 공간 또는 베란다 유무 확인', 8, NOW(), NOW(), 0);

-- 주변환경 (ENVIRONMENT)
INSERT INTO checklist_items (item_name, category, item_type, user_type, input_type, description, display_order, created_at, updated_at, is_deleted)
VALUES
('편의점 / 마트', 'ENVIRONMENT', 'DEFAULT', NULL, 'SINGLE_CHOICE', '도보 5~10분 내 편의점/마트 위치 확인', 1, NOW(), NOW(), 0),
('대중교통 접근성', 'ENVIRONMENT', 'DEFAULT', 'NOISE_SENSITIVE', 'SINGLE_CHOICE', '도보 10분 내 지하철역/버스정류장 위치 확인', 2, NOW(), NOW(), 0),
('야간 상권 인접도', 'ENVIRONMENT', 'CUSTOM', 'NOISE_SENSITIVE', 'SINGLE_CHOICE', '인근 술집/유흥가 밀집도 확인 (소음/안전 영향)', 3, NOW(), NOW(), 0),
('녹지/산 인접도', 'ENVIRONMENT', 'CUSTOM', 'BUG_AVOIDER', 'SINGLE_CHOICE', '도보 거리 내 공원/산책로 위치 확인', 4, NOW(), NOW(), 0),
('음식점 밀집도', 'ENVIRONMENT', 'CUSTOM', 'BUG_AVOIDER', 'SINGLE_CHOICE', '도보 거리 내 식당/배달 가능 매장 수 확인', 5, NOW(), NOW(), 0),
('유동인구', 'ENVIRONMENT', 'CUSTOM', 'NOISE_SENSITIVE', 'SINGLE_CHOICE', '평일/주말, 낮/밤 시간대별 거리 활기 정도 확인', 6, NOW(), NOW(), 0),
('공사장 여부', 'ENVIRONMENT', 'CUSTOM', 'NOISE_SENSITIVE', 'SINGLE_CHOICE', '인근 공사장 유무 확인 (소음/먼지/진동 영향)

✓ 인근 신축/리모델링 공사장 위치 확인
✓ 공사 예정 정보 확인 (구청 건축과 또는 지도 앱)
✓ 공사 기간 및 작업 시간대 확인
✓ 도로 공사로 인한 소음/먼지 영향 가능성 확인
✓ 향후 1~2년 내 신축 예정 건물 (조망/채광 변화) 확인', 7, NOW(), NOW(), 0),
('언덕 경사', 'ENVIRONMENT', 'CUSTOM', NULL, 'SINGLE_CHOICE', '집까지 가는 길의 경사도 확인 (도보 시 체감)', 8, NOW(), NOW(), 0);

-- 옵션 항목들의 선택지 추가 (있음, 없음)
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '에어컨' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '에어컨' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '세탁기' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '세탁기' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '냉장고' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '냉장고' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '인터넷/와이파이' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '인터넷/와이파이' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '가스레인지/인덕션' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '가스레인지/인덕션' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '책상/의자' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '책상/의자' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '옷장/수납' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '옷장/수납' UNION ALL
SELECT id, '있음', 1 FROM checklist_items WHERE item_name = '난방' UNION ALL
SELECT id, '없음', 2 FROM checklist_items WHERE item_name = '난방';

-- 내부 상태 선택지
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '나쁨', 1 FROM checklist_items WHERE item_name = '채광' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '채광' UNION ALL
SELECT id, '좋음', 3 FROM checklist_items WHERE item_name = '채광';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '나쁨', 1 FROM checklist_items WHERE item_name = '환기' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '환기' UNION ALL
SELECT id, '좋음', 3 FROM checklist_items WHERE item_name = '환기';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '나쁨', 1 FROM checklist_items WHERE item_name = '수압 및 배수' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '수압 및 배수' UNION ALL
SELECT id, '좋음', 3 FROM checklist_items WHERE item_name = '수압 및 배수';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '나쁨', 1 FROM checklist_items WHERE item_name = '방음' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '방음' UNION ALL
SELECT id, '좋음', 3 FROM checklist_items WHERE item_name = '방음';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '나쁨', 1 FROM checklist_items WHERE item_name = '창문 / 망충망' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '창문 / 망충망' UNION ALL
SELECT id, '좋음', 3 FROM checklist_items WHERE item_name = '창문 / 망충망';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '나쁨', 1 FROM checklist_items WHERE item_name = '현관 / 문틈' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '현관 / 문틈' UNION ALL
SELECT id, '좋음', 3 FROM checklist_items WHERE item_name = '현관 / 문틈';

-- 문제 요소 선택지
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '곰팡이' UNION ALL
SELECT id, '약간', 2 FROM checklist_items WHERE item_name = '곰팡이' UNION ALL
SELECT id, '심함', 3 FROM checklist_items WHERE item_name = '곰팡이';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '누수 흔적' UNION ALL
SELECT id, '약간', 2 FROM checklist_items WHERE item_name = '누수 흔적' UNION ALL
SELECT id, '심함', 3 FROM checklist_items WHERE item_name = '누수 흔적';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '벌레 흔적' UNION ALL
SELECT id, '약간', 2 FROM checklist_items WHERE item_name = '벌레 흔적' UNION ALL
SELECT id, '심함', 3 FROM checklist_items WHERE item_name = '벌레 흔적';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '내/외부 소음' UNION ALL
SELECT id, '약간', 2 FROM checklist_items WHERE item_name = '내/외부 소음' UNION ALL
SELECT id, '심함', 3 FROM checklist_items WHERE item_name = '내/외부 소음';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '하수구/곰팡이 냄새' UNION ALL
SELECT id, '약간', 2 FROM checklist_items WHERE item_name = '하수구/곰팡이 냄새' UNION ALL
SELECT id, '심함', 3 FROM checklist_items WHERE item_name = '하수구/곰팡이 냄새';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '습기 / 결로' UNION ALL
SELECT id, '약간', 2 FROM checklist_items WHERE item_name = '습기 / 결로' UNION ALL
SELECT id, '심함', 3 FROM checklist_items WHERE item_name = '습기 / 결로';

-- 안전/보안 선택지
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '어두움', 1 FROM checklist_items WHERE item_name = '야간 조명' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '야간 조명' UNION ALL
SELECT id, '밝음', 3 FROM checklist_items WHERE item_name = '야간 조명';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '멀다', 1 FROM checklist_items WHERE item_name = '경찰서 근처' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '경찰서 근처' UNION ALL
SELECT id, '가깝다', 3 FROM checklist_items WHERE item_name = '경찰서 근처';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '불안', 1 FROM checklist_items WHERE item_name = '밤길 안전도' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '밤길 안전도' UNION ALL
SELECT id, '안전', 3 FROM checklist_items WHERE item_name = '밤길 안전도';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '큰길 근처', 1 FROM checklist_items WHERE item_name = '접근성' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '접근성' UNION ALL
SELECT id, '깊은 골목', 3 FROM checklist_items WHERE item_name = '접근성';

-- 생활 편의 선택지
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '부족', 1 FROM checklist_items WHERE item_name = '콘센트 수' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '콘센트 수' UNION ALL
SELECT id, '충분', 3 FROM checklist_items WHERE item_name = '콘센트 수';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '상주', 1 FROM checklist_items WHERE item_name = '집주인 거주 여부' UNION ALL
SELECT id, '비상주', 2 FROM checklist_items WHERE item_name = '집주인 거주 여부';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '택배 보관 환경' UNION ALL
SELECT id, '공용 보관', 2 FROM checklist_items WHERE item_name = '택배 보관 환경';

-- 주변환경 선택지
INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '멀다', 1 FROM checklist_items WHERE item_name = '편의점 / 마트' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '편의점 / 마트' UNION ALL
SELECT id, '가깝다', 3 FROM checklist_items WHERE item_name = '편의점 / 마트';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '멀다', 1 FROM checklist_items WHERE item_name = '대중교통 접근성' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '대중교통 접근성' UNION ALL
SELECT id, '가깝다', 3 FROM checklist_items WHERE item_name = '대중교통 접근성';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '멀다', 1 FROM checklist_items WHERE item_name = '야간 상권 인접도' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '야간 상권 인접도' UNION ALL
SELECT id, '가깝다', 3 FROM checklist_items WHERE item_name = '야간 상권 인접도';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '멀다', 1 FROM checklist_items WHERE item_name = '녹지/산 인접도' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '녹지/산 인접도' UNION ALL
SELECT id, '가깝다', 3 FROM checklist_items WHERE item_name = '녹지/산 인접도';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '음식점 밀집도' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '음식점 밀집도' UNION ALL
SELECT id, '많음', 3 FROM checklist_items WHERE item_name = '음식점 밀집도';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '유동인구' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '유동인구' UNION ALL
SELECT id, '많음', 3 FROM checklist_items WHERE item_name = '유동인구';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '없음', 1 FROM checklist_items WHERE item_name = '공사장 여부' UNION ALL
SELECT id, '모름', 2 FROM checklist_items WHERE item_name = '공사장 여부' UNION ALL
SELECT id, '있음', 3 FROM checklist_items WHERE item_name = '공사장 여부';

INSERT INTO checklist_options (checklist_item_id, option_value, display_order)
SELECT id, '완만', 1 FROM checklist_items WHERE item_name = '언덕 경사' UNION ALL
SELECT id, '보통', 2 FROM checklist_items WHERE item_name = '언덕 경사' UNION ALL
SELECT id, '가파름', 3 FROM checklist_items WHERE item_name = '언덕 경사';
