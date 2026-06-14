# BE API 핸들링 — 시나리오 뱅크 (raw, backend-dev 생성 2026-06-13)

> 165 break-case 후보 원본. 큐레이트본은 개발자노트-ver1.1 §BE 참조. verdict: concerns(고품질·소스검증, right-sizing 필요).

## 공통 에러 시스템 (foundation)




### break categories



## ReportController  (18 scenarios)
endpoints: GET /api/v1/report/info, POST /api/v1/report/compare

- [ ] **RPT-01** 토큰 없이 매물 비교 리스트 조회 시 401  (auth / 인증 (token & session))
      given Authorization 헤더가 없는 미인증 요청 (보호 라우트, SecurityConfig entrypoint)
      when  GET /api/v1/report/info (no Authorization header)
      then  HTTP 401, FLAT ApiResponse body {success:false, code:"AUTH_401", message:"Unauthorized", data:null}. PATH C(entrypoint,   [AUTH_401]
- [ ] **RPT-02** 만료 토큰으로 매물 비교 리스트 조회 시 401  (auth / 인증 (token & session))
      given 만료된 access token. JwtAuthenticationFilter가 만료 분기에서 직접 응답 작성
      when  GET /api/v1/report/info (Authorization: Bearer <expired>)
      then  HTTP 401, FLAT body code="AUTH_40102", message="Access token has expired. Please re-login.". PATH C(필터, advice 우회)  [AUTH_40102]
- [ ] **RPT-03** 위변조/무효 토큰으로 매물 비교 요청 시 401  (auth / 인증 (token & session))
      given 서명 검증 실패한 invalid access token. JwtAuthenticationFilter invalid 분기
      when  POST /api/v1/report/compare (Authorization: Bearer <invalid>) body {roomIds:[1],categories:["BASIC_INFO"]}
      then  HTTP 401, FLAT body code="AUTH_40103", message="Invalid access token.". PATH C(필터)  [AUTH_40103]
- [ ] **RPT-04** SecurityContext principal이 Long이 아닐 때 AUTH_40101  (auth / 인증 (token & session))
      given 인증 객체는 있으나 principal이 Long userId가 아님(혹은 anonymous). SecurityUtil.getCurrentUserId()가 컨트롤러 내부에서 호출됨
      when  GET /api/v1/report/info (principal이 Long 아닌 컨텍스트)
      then  HTTP 401, FLAT body code="AUTH_40101", message="Unauthorized.". PATH A(GeneralException→GlobalExceptionHandler.handleGen  [AUTH_40101]
- [ ] **RPT-05** compare 요청 본문이 비어있거나 깨진 JSON  (validation / 검증 (request shape))
      given @RequestBody CompareRoomRequestDTO를 파싱할 수 없는 malformed/empty body
      when  POST /api/v1/report/compare with body "" 또는 "{" (Content-Type application/json)
      then  HTTP 400, FLAT body code="COMMON_400_BODY_NOT_READABLE". PATH B(HttpMessageNotReadableException). code로 단언  [COMMON_400_BODY_NOT_READABLE]
- [ ] **RPT-06** info 엔드포인트에 잘못된 HTTP 메서드(POST)  (validation / 검증 (request shape))
      given GET 전용 /report/info 에 POST 호출
      when  POST /api/v1/report/info
      then  HTTP 405, FLAT body code="COMMON_405", message="Method not allowed: POST". PATH B(HttpRequestMethodNotSupportedException  [COMMON_405]
- [ ] **RPT-07** 존재하지 않는 하위 경로 요청 시 404  (validation / 검증 (request shape))
      given 라우팅되지 않는 경로
      when  GET /api/v1/report/unknown
      then  HTTP 404, FLAT body code="COMMON_404", message="Resource not found.". PATH B(NoResourceFoundException)  [COMMON_404]
- [ ] **RPT-08** [갭] 미지의 category 문자열 → 400이 아닌 500  (validation / 검증 (request shape))
      given categories에 ChecklistCategory enum에 없는 값(예: "FOO"). compareRooms line 53 ChecklistCategory.valueOf(categoryName)가 분기 전 즉
      when  POST /api/v1/report/compare body {roomIds:[1], categories:["FOO"]}
      then  HTTP 500, FLAT body code="COMMON_500", message="Internal server error.". IllegalArgumentException 미처리→fallthrough. [KNOW  [COMMON_500]
- [ ] **RPT-09** [갭] categories=null → NPE로 500 (검증 미발화)  (validation / 검증 (request shape))
      given DTO에 @NotNull/@Valid 없음 → bean-validation 발화 안 함. compareRooms의 for(String categoryName : categories)에서 NPE
      when  POST /api/v1/report/compare body {roomIds:[1]} (categories 누락)
      then  HTTP 500, FLAT body code="COMMON_500". [KNOWN-DEFECT] @NotEmpty 부재 → 400_VALIDATION 대신 500. 갭 플래그  [COMMON_500]
- [ ] **RPT-10** [갭] roomIds=null → NPE/JPA 오류로 500 (검증 미발화)  (validation / 검증 (request shape))
      given roomIds 미지정. buildBasicInfoItems/buildRoomFieldItem의 for(Long roomId : roomIds) NPE, 또는 체크리스트 분기에서 findByRoomIdInAndItem
      when  POST /api/v1/report/compare body {categories:["BASIC_INFO"]} (roomIds 누락)
      then  HTTP 500, FLAT body code="COMMON_500". [KNOWN-DEFECT] roomIds 검증 부재. 갭 플래그  [COMMON_500]
- [ ] **RPT-11** roomIds=[] (빈 배열) + BASIC_INFO 비교  (validation / 검증 (request shape))
      given roomIds 빈 리스트. buildBasicInfoItems의 모든 item이 rooms 비어→필터링→itemsData empty→categoryGroup 미추가
      when  POST /api/v1/report/compare body {roomIds:[], categories:["BASIC_INFO"]}
      then  HTTP 200, FLAT body data.compareData = [] (빈 배열). 에러 아님 — 빈 입력 경계 동작 박제  []
- [ ] **RPT-12** categories=[] (빈 배열) 비교  (validation / 검증 (request shape))
      given categories 빈 리스트 → for-loop 미실행 → compareData 비어있음
      when  POST /api/v1/report/compare body {roomIds:[1,2], categories:[]}
      then  HTTP 200, FLAT body data.compareData = []. 에러 아님 — 경계 동작 박제  []
- [ ] **RPT-13** [보안/IDOR] 타 유저 소유 roomId 비교가 차단되지 않음  (domain business-rule / 비즈니스 규칙)
      given userA 인증 상태. requestDTO.roomIds에 userB 소유 roomId 포함. compareRooms는 userId를 서비스에 넘기지 않고 buildRoomFieldItem이 findById(room
      when  POST /api/v1/report/compare (userA token) body {roomIds:[<userB의 roomId>], categories:["BASIC_INFO"]}
      then  HTTP 200 — 타 유저 매물 데이터가 valueText로 노출됨(403/404 아님). [KNOWN-DEFECT 보안] 인가 미적용 현행 동작 박제 + IDOR 갭 강하게 플래그  []
- [ ] **RPT-14** 존재하지 않는/soft-deleted roomId 비교 시 404 안 남  (not-found / 리소스 부재 (null·orElseThrow))
      given 한 번도 없던 roomId 또는 is_deleted=true 인 roomId. buildRoomFieldItem의 findById가 빈 Optional 반환(IsDeletedFalse 필터 없음 → soft-dele
      when  POST /api/v1/report/compare body {roomIds:[999999], categories:["BASIC_INFO"]}
      then  HTTP 200 — 해당 roomId 셀은 valueText=null 로 렌더, ROOM_404 던지지 않음. [KNOWN-DEFECT] orElseThrow 부재 — 현행 silent 동작 박제. soft-dele  []
- [ ] **RPT-15** [갭] BASIC_INFO 비교 중 nullable 필드 역참조로 500  (fallthrough / unmapped (catch-all 500))
      given 조회된 room의 rentType/hasLoan/canRegisterAddress 등이 null. buildBasicInfoItems가 room.getRentType().name() 등을 무조건 역참조
      when  POST /api/v1/report/compare body {roomIds:[<rentType null인 room>], categories:["BASIC_INFO"]}
      then  HTTP 500, FLAT body code="COMMON_500". NPE 미처리→fallthrough. [KNOWN-DEFECT] null-safe 처리 부재. 갭 플래그  [COMMON_500]
- [ ] **RPT-16** [갭] BUILDING_INFO 비교 중 buildingType/direction null 역참조로 500  (fallthrough / unmapped (catch-all 500))
      given 조회된 room의 buildingType/hasElevator/direction null. buildBuildingInfoItems가 room.getBuildingType().name(), room.getDirect
      when  POST /api/v1/report/compare body {roomIds:[<direction null인 room>], categories:["BUILDING_INFO"]}
      then  HTTP 500, FLAT body code="COMMON_500". NPE→fallthrough. [KNOWN-DEFECT] 갭 플래그  [COMMON_500]
- [ ] **RPT-17** 서비스가 예기치 못한 런타임 예외 던질 때 catch-all 500  (fallthrough / unmapped (catch-all 500))
      given ReportService.getRoomsForCompare가 의존 repository에서 비매핑 RuntimeException(예: DB 커넥션 단절)을 던지도록 stub
      when  GET /api/v1/report/info (정상 인증)
      then  HTTP 500, FLAT body code="COMMON_500", message="Internal server error.". PATH B 일반 catch-all. 각 케이스는 전용 매핑 후보로 표시  [COMMON_500]
- [ ] **RPT-18** info: 매물 0개 유저 — 200 빈 리스트 경계  (not-found / 리소스 부재 (null·orElseThrow))
      given 방을 한 번도 등록 안 했거나 전부 soft-deleted 된 유저. findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc가 빈 리스트 반환
      when  GET /api/v1/report/info (정상 인증)
      then  HTTP 200, FLAT body data.rooms=[], data.categories=[8개 ChecklistCategory]. 에러 아님 — 빈 결과 경계 박제(404 아님)  []

## RoomController  (37 scenarios)
endpoints: POST /api/v1/rooms/check-results — 방+체크리스트 등록 (RoomWithCheckAnswerRequestDTO), POST /api/v1/rooms — 방 등록 (RoomCreateRequestDTO), GET /api/v1/rooms — 내 방 목록 조회 (rentType, sort query), GET /api/v1/rooms/{id} — 내 방 1개 + 체크결과 조회, POST /api/v1/rooms/{id}/check-results — 체크리스트 답변 저장 (List<RoomCheckAnswerRequestDTO>), PUT /api/v1/rooms/{id} — 방+체크리스트 수정 (RoomUpdateWithCheckAnswerRequestDTO), DELETE /api/v1/rooms/{id} — 내 방 1개 삭제

- [ ] **ROOM-01** 방 등록 시 토큰 없음 (필터/엔트리포인트 401, PATH C)  (auth / 인증 (token & session))
      given Authorization 헤더가 전혀 없는 비인증 요청. /api/v1/rooms 는 SecurityConfig 상 .authenticated() 보호 라우트.
      when  POST /api/v1/rooms  (유효한 RoomCreateRequestDTO 바디)
      then  HTTP 401. SecurityConfig authenticationEntryPoint 가 직접 쓰는 flat 바디 {success:false, code:"AUTH_401", message:"Unauthorized  [AUTH_401]
- [ ] **ROOM-02** 방 등록 시 만료 토큰 (필터 401, PATH C)  (auth / 인증 (token & session))
      given 만료된 JWT 를 Authorization: Bearer 로 전달. JwtAuthenticationFilter 가 검증 단계에서 만료 감지.
      when  POST /api/v1/rooms  (유효한 RoomCreateRequestDTO 바디)
      then  HTTP 401. JwtAuthenticationFilter.writeErrorResponse 가 objectMapper 로 직접 쓴 flat 바디 code="AUTH_40102". 어드바이스 미경유 — 필터 체인   [AUTH_40102]
- [ ] **ROOM-03** SecurityContext 비어있는 채 컨트롤러 진입 시 AUTH_40101 (PATH A)  (auth / 인증 (token & session))
      given 필터가 인증을 세팅하지 않아 SecurityContext 에 userId 가 없는 상태에서 컨트롤러 핸들러가 호출됨(예: GUEST 토큰이 필터를 통과했으나 authentication 미설정). 모든 핸들러 첫 줄이
      when  GET /api/v1/rooms
      then  HTTP 401. SecurityUtil.getCurrentUserId() 가 GeneralException(AuthErrorCode.UNAUTHORIZED) throw → GlobalExceptionHandler   [AUTH_40101]
- [ ] **ROOM-04** 방 등록 — name 누락 @Valid 위반  (validation / 검증 (request shape))
      given 인증된 사용자. RoomCreateRequestDTO.name 은 @NotBlank("방 이름은 필수입니다.").
      when  POST /api/v1/rooms  바디 {"address":"서울시 강남구..."}  (name 누락)
      then  HTTP 400. MethodArgumentNotValidException → COMMON_400_VALIDATION. flat 바디 code="COMMON_400_VALIDATION", message 는 "[nam  [COMMON_400_VALIDATION]
- [ ] **ROOM-05** 방 등록 — address 누락 @Valid 위반  (validation / 검증 (request shape))
      given 인증된 사용자. RoomCreateRequestDTO.address 는 @NotBlank("주소는 필수입니다.").
      when  POST /api/v1/rooms  바디 {"name":"우리집"}  (address 누락)
      then  HTTP 400. COMMON_400_VALIDATION. message 에 "[address] 주소는 필수입니다." 포함.  [COMMON_400_VALIDATION]
- [ ] **ROOM-06** 방 등록 — 빈/깨진 JSON 바디  (validation / 검증 (request shape))
      given 인증된 사용자. @RequestBody 필수.
      when  POST /api/v1/rooms  Content-Type: application/json, 바디가 빈 문자열 또는 깨진 JSON "{name:"
      then  HTTP 400. HttpMessageNotReadableException → code="COMMON_400_BODY_NOT_READABLE".  [COMMON_400_BODY_NOT_READABLE]
- [ ] **ROOM-07** 방 등록 — rentType enum 에 알 수 없는 값  (validation / 검증 (request shape))
      given 인증된 사용자. RentType = {MONTHLY, JEONSE, SHORT_TERM}. Jackson 역직렬화 단계에서 알 수 없는 enum 토큰 거부.
      when  POST /api/v1/rooms  바디 {"name":"집","address":"...","rentType":"WEEKLY"}
      then  HTTP 400. enum 파싱 실패는 HttpMessageNotReadableException 로 표면화 → code="COMMON_400_BODY_NOT_READABLE". (경로/쿼리 enum 의 TYPE_MI  [COMMON_400_BODY_NOT_READABLE]
- [ ] **ROOM-08** 방 등록 — 6개 한도 초과 (경계: 정확히 6개 보유)  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자가 isDeleted=false 인 방을 정확히 6개 보유. RoomService.createRoom 의 countByUserIdAndIsDeletedFalse(userId) >= 6 가드.
      when  POST /api/v1/rooms  (유효한 7번째 방 바디)
      then  HTTP 400. GeneralException(ROOM_LIMIT_EXCEEDED) PATH A. flat 바디 code="ROOM_400_LIMIT", message="방은 최대 6개까지 등록할 수 있습니다.".  [ROOM_400_LIMIT]
- [ ] **ROOM-09** 한도 경계 통과 — 정확히 5개 보유 시 6번째 등록 성공  (rate / over-limit (count caps))
      given 인증된 사용자가 isDeleted=false 방 5개 보유. 가드는 >= 6 이므로 5 는 통과.
      when  POST /api/v1/rooms  (유효한 6번째 방 바디)
      then  HTTP 200, success=true, data=RoomCreateResponseDTO. 한도 미초과 경계가 정상 통과함을 회귀 고정(off-by-one 방지).  []
- [ ] **ROOM-10** 6개 한도 동시성 — check-then-act 경쟁 (알려진 한계)  (concurrency / 동시성)
      given @Version/락 없음, @Transactional 만 존재. 5개 보유 사용자가 동시 2건 등록을 보냄 — 두 트랜잭션이 모두 count<6 read 를 통과 가능.
      when  POST /api/v1/rooms x2 (거의 동시)
      then  DB 유니크 제약이 없으므로 깔끔한 에러 코드 없이 방이 6개를 초과해 저장될 수 있음. 순수 단위테스트로는 경쟁 재현 불가 — 알려진 한계로 문서화하고 단일 스레드 경계(ROOM-08/09)만 커버. 코드 매핑 후  [ROOM_400_LIMIT]
- [ ] **ROOM-11** 방 등록 — JEONSE 인데 보증금 null  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자, 한도 미초과. Room.create 의 rentType==JEONSE && deposit==null 가드.
      when  POST /api/v1/rooms  바디 {"name":"집","address":"...","rentType":"JEONSE","deposit":null}
      then  HTTP 400. GeneralException(JEONSE_DEPOSIT_REQUIRED) PATH A. code="ROOM_400_JEONSE_DEPOSIT", message="전세는 보증금이 필수입니다.". 단  [ROOM_400_JEONSE_DEPOSIT]
- [ ] **ROOM-12** 방 등록 — MONTHLY 인데 월세 금액 null  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자, 한도 미초과. Room.create 의 rentType==MONTHLY && rent==null 가드.
      when  POST /api/v1/rooms  바디 {"name":"집","address":"...","rentType":"MONTHLY","rent":null}
      then  HTTP 400. GeneralException(MONTHLY_RENT_REQUIRED). code="ROOM_400_MONTHLY_RENT", message="월세는 월세 금액이 필수입니다.".  [ROOM_400_MONTHLY_RENT]
- [ ] **ROOM-13** 방 등록 — hasLoan=true 인데 융자 금액 null  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자, 한도 미초과. Room.create 의 hasLoan==true && loanAmount==null 가드.
      when  POST /api/v1/rooms  바디 {"name":"집","address":"...","hasLoan":true,"loanAmount":null}
      then  HTTP 400. GeneralException(LOAN_AMOUNT_REQUIRED). code="ROOM_400_LOAN_AMOUNT", message="융자가 있는 경우 금액은 필수입니다.".  [ROOM_400_LOAN_AMOUNT]
- [ ] **ROOM-14** 방 등록 — geocoding 무결과 시 좌표 null 로 200 저장 (현 동작 고정)  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자, 한도 미초과. GeocodingService.getCoordinates 가 Naver 응답 addresses 빈 배열/null → getCoordinates 가 null 반환. RoomService 
      when  POST /api/v1/rooms  바디 (존재하지 않는/매칭 안 되는 주소)
      then  HTTP 200, success=true. 방은 lat=null, lon=null 로 저장됨. GEOCODING_400/ADDRESS_NOT_FOUND 는 절대 throw 되지 않음(데드코드). 현 동작을 핀하고 '  []
- [ ] **ROOM-15** 방 등록 — Naver geocoding 외부 API 5xx/타임아웃 → COMMON_500  (external-API failure / 외부 API 실패 (juso · Naver geocoding · OAuth))
      given 인증된 사용자, 한도 미초과. GeocodingService 의 RestClient 호출이 try/catch 로 감싸지지 않음(OAuthService 와 달리). geocoding 스텁이 RestClientExcep
      when  POST /api/v1/rooms  (유효 바디, 단 Naver geocoding 이 502/타임아웃 응답)
      then  HTTP 500. 예외가 GlobalExceptionHandler.handleException 으로 전파 → code="COMMON_500", message="Internal server error.". 알려진 갭:  [COMMON_500]
- [ ] **ROOM-16** 방 등록 — DB 무결성 위반 → COMMON_409  (DB constraint / 무결성)
      given 인증된 사용자. roomRepository.save 가 유니크/FK 제약 위반으로 DataIntegrityViolationException throw(예: 동시성으로 인한 제약 충돌).
      when  POST /api/v1/rooms  (유효 바디, 단 save 단계에서 제약 위반)
      then  HTTP 409. PATH B. code="COMMON_409". message 는 드라이버 메시지에 'Duplicate' 포함 시 "Duplicate value violates unique constraint.",  [COMMON_409]
- [ ] **ROOM-17** 방+체크리스트 등록 — name 누락 @Valid 위반  (validation / 검증 (request shape))
      given 인증된 사용자. RoomWithCheckAnswerRequestDTO 가 RoomCreateRequestDTO 상속 → @NotBlank name/address 그대로 적용. 핸들러 @Valid 적용됨.
      when  POST /api/v1/rooms/check-results  바디 {"address":"...","checkAnswers":[]}  (name 누락)
      then  HTTP 400. COMMON_400_VALIDATION. message 에 "[name] 방 이름은 필수입니다." 포함.  [COMMON_400_VALIDATION]
- [ ] **ROOM-18** 방+체크리스트 등록 — 6개 한도 초과  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자가 isDeleted=false 방 6개 보유. createRoomWithCheckAnswers 도 동일 >=6 가드를 가장 먼저 수행.
      when  POST /api/v1/rooms/check-results  (유효 7번째 방+체크답변 바디)
      then  HTTP 400. ROOM_LIMIT_EXCEEDED PATH A. code="ROOM_400_LIMIT". geocoding/저장/체크답변 저장 모두 미수행.  [ROOM_400_LIMIT]
- [ ] **ROOM-19** 방+체크리스트 등록 — JEONSE 보증금 null (한도 통과 후)  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자, 한도 미초과. geocoding 스텁 응답. Room.create 의 JEONSE 가드.
      when  POST /api/v1/rooms/check-results  바디 {"name":"집","address":"...","rentType":"JEONSE","deposit":null,"checkAnswers":[...]
      then  HTTP 400. code="ROOM_400_JEONSE_DEPOSIT". 방이 save 되기 전 throw 되므로 체크답변도 미저장(트랜잭션 롤백).  [ROOM_400_JEONSE_DEPOSIT]
- [ ] **ROOM-20** 방 목록 조회 — rentType 쿼리 enum 에 잘못된 값  (validation / 검증 (request shape))
      given 인증된 사용자. @RequestParam(required=false) RentType rentType 는 타입드 enum 쿼리.
      when  GET /api/v1/rooms?rentType=WOLSE
      then  HTTP 400. MethodArgumentTypeMismatchException → code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'rentType'."  [COMMON_400_TYPE_MISMATCH]
- [ ] **ROOM-21** 방 목록 조회 — sort 쿼리 enum 에 잘못된 값  (validation / 검증 (request shape))
      given 인증된 사용자. @RequestParam(required=false) RoomSortType sort = {DEPOSIT_ASC, RENT_ASC, MANAGEMENT_FEE_ASC}.
      when  GET /api/v1/rooms?sort=PRICE
      then  HTTP 400. COMMON_400_TYPE_MISMATCH, message="Invalid value for 'sort'.".  [COMMON_400_TYPE_MISMATCH]
- [ ] **ROOM-22** 방 목록 조회 — 빈 결과 (보유 방 없음)  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자가 보유한(isDeleted=false) 방이 없음. findRoomsWithFilter 가 빈 리스트 반환.
      when  GET /api/v1/rooms
      then  HTTP 200, success=true, data=[] (빈 배열). 빈 목록은 에러가 아니라 200/빈배열임을 회귀 고정 — 404 아님.  []
- [ ] **ROOM-23** 방 1개 조회 — path id 비숫자 타입 미스매치  (validation / 검증 (request shape))
      given 인증된 사용자. @PathVariable Long id.
      when  GET /api/v1/rooms/abc
      then  HTTP 400. MethodArgumentTypeMismatchException → code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'id'.".  [COMMON_400_TYPE_MISMATCH]
- [ ] **ROOM-24** 방 1개 조회 — 존재하지 않는 id  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자. findByIdAndUserIdAndIsDeletedFalse 가 empty Optional 반환. 컨트롤러가 orElseThrow(GeneralException(ROOM_NOT_FOUND)).
      when  GET /api/v1/rooms/999999
      then  HTTP 404. PATH A. code="ROOM_404", message="방을 찾을 수 없습니다.".  [ROOM_404]
- [ ] **ROOM-25** 방 1개 조회 — 소프트 삭제된 방 (is_deleted=true)  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자의 방이 존재하지만 softDelete() 로 is_deleted=true. 쿼리는 IsDeletedFalse 조건이라 행을 못 찾음.
      when  GET /api/v1/rooms/{삭제된_id}
      then  HTTP 404. code="ROOM_404". '존재한 적 없음'과 '소프트 삭제됨' 모두 동일하게 404 로 표면화됨을 확인.  [ROOM_404]
- [ ] **ROOM-26** 방 1개 조회 — 타 사용자 소유 방 (인가 격리)  (not-found / 리소스 부재 (null·orElseThrow))
      given 방은 존재하지만 userId 가 요청자와 다름. 쿼리에 userId 조건이 포함되어 타인 방은 매칭 안 됨.
      when  GET /api/v1/rooms/{타인_id}
      then  HTTP 404 code="ROOM_404" (403 아님 — 소유권 격리가 NOT_FOUND 로 구현됨). 정보 노출 방지 동작을 회귀 고정.  [ROOM_404]
- [ ] **ROOM-27** 체크리스트 답변 저장 — 소유권/존재 검증 부재 (알려진 갭)  (not-found / 리소스 부재 (null·orElseThrow))
      given saveCheckResults 핸들러는 SecurityUtil 호출도, room 존재/소유 검증도 하지 않고 roomCheckResultService.saveCheckResult(id, answers) 를 raw i
      when  POST /api/v1/rooms/999999/check-results  바디 [유효 RoomCheckAnswerRequestDTO]
      then  존재하지 않는/타인 roomId 라도 ROOM_404 가 throw 되지 않고 해당 roomId 로 결과가 저장됨(고아 데이터). 현 동작을 핀하고 '소유권/존재 검증 누락 + 인증 가드 부재' 보안 갭으로 플래그.  []
- [ ] **ROOM-28** 체크리스트 답변 저장 — 깨진/비배열 JSON 바디  (validation / 검증 (request shape))
      given 핸들러 시그니처 @RequestBody List<RoomCheckAnswerRequestDTO> (@Valid 없음).
      when  POST /api/v1/rooms/{id}/check-results  바디가 빈 문자열 또는 배열이 아닌 {} 
      then  HTTP 400. HttpMessageNotReadableException → code="COMMON_400_BODY_NOT_READABLE". (@Valid 가 없어 원소 단위 bean-validation 은 미수  [COMMON_400_BODY_NOT_READABLE]
- [ ] **ROOM-29** 방 수정 — 존재하지 않는 id  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자. updateRoom(=updateRoomWithCheckAnswers 내부) 의 findByIdAndUserIdAndIsDeletedFalse 가 empty → orElseThrow(ROOM_NOT_
      when  PUT /api/v1/rooms/999999  (유효 RoomUpdateWithCheckAnswerRequestDTO)
      then  HTTP 404. code="ROOM_404". 소프트 삭제/타인 소유도 동일하게 404.  [ROOM_404]
- [ ] **ROOM-30** 방 수정 — name 누락 @Valid 위반  (validation / 검증 (request shape))
      given 인증된 사용자. RoomUpdateRequestDTO.name 은 @NotBlank. 핸들러 @Valid 적용.
      when  PUT /api/v1/rooms/{id}  바디 {"rentType":"MONTHLY","rent":50}  (name 누락)
      then  HTTP 400. COMMON_400_VALIDATION. message 에 "[name] 방 이름은 필수입니다." 포함.  [COMMON_400_VALIDATION]
- [ ] **ROOM-31** 방 수정 — JEONSE 보증금 null 인데 검증 누락으로 200 통과 (알려진 결함)  (domain business-rule / 비즈니스 규칙)
      given 인증된 사용자, 본인 방 존재. Room.update() 는 create() 와 달리 JEONSE/MONTHLY/LOAN 가드를 전혀 실행하지 않고 필드를 그대로 대입(라인 182-208).
      when  PUT /api/v1/rooms/{id}  바디 {"name":"집","rentType":"JEONSE","deposit":null}
      then  HTTP 200, success=true — POST 라면 ROOM_400_JEONSE_DEPOSIT 였을 입력이 PUT 에서는 통과해 deposit=null JEONSE 방으로 저장됨. 현 동작을 핀하고 'upda  []
- [ ] **ROOM-32** 방 수정 — 주소 변경 시 geocoding 외부 API 실패 → COMMON_500  (external-API failure / 외부 API 실패 (juso · Naver geocoding · OAuth))
      given 인증된 사용자, 본인 방 존재. updateRoom 은 request.getAddress()!=null 일 때만 getCoordinates 호출. geocoding 스텁이 RestClientException thro
      when  PUT /api/v1/rooms/{id}  바디 {"name":"집","address":"새 주소"}  (Naver geocoding 502)
      then  HTTP 500. code="COMMON_500", message="Internal server error.". 외부 실패가 도메인 코드 없이 흡수됨 — 전용 매핑 후보로 플래그.  [COMMON_500]
- [ ] **ROOM-33** 방 삭제 — 존재하지 않는 id  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자. deleteRoom 의 findByIdAndUserIdAndIsDeletedFalse empty → orElseThrow(ROOM_NOT_FOUND).
      when  DELETE /api/v1/rooms/999999
      then  HTTP 404. code="ROOM_404", message="방을 찾을 수 없습니다.".  [ROOM_404]
- [ ] **ROOM-34** 방 삭제 — 이미 소프트 삭제된 방 재삭제 (멱등성 아님)  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증된 사용자의 방이 이미 is_deleted=true. IsDeletedFalse 쿼리가 못 찾음.
      when  DELETE /api/v1/rooms/{삭제된_id}
      then  HTTP 404. code="ROOM_404". 두 번째 삭제는 200 멱등이 아니라 404 임을 확인.  [ROOM_404]
- [ ] **ROOM-35** 방 삭제 — 타 사용자 소유 방 (인가 격리)  (not-found / 리소스 부재 (null·orElseThrow))
      given 방은 존재하나 userId 가 요청자와 다름. 쿼리 userId 조건으로 매칭 실패.
      when  DELETE /api/v1/rooms/{타인_id}
      then  HTTP 404 code="ROOM_404" (403 아님). 타인 자원 삭제 시도가 NOT_FOUND 로 격리됨을 회귀 고정.  [ROOM_404]
- [ ] **ROOM-36** 지원하지 않는 HTTP 메서드  (validation / 검증 (request shape))
      given 인증된 사용자. /api/v1/rooms/{id} 는 GET/PUT/DELETE 만 매핑됨(PATCH 없음).
      when  PATCH /api/v1/rooms/1
      then  HTTP 405. HttpRequestMethodNotSupportedException → code="COMMON_405".  [COMMON_405]
- [ ] **ROOM-37** 예기치 못한 런타임 예외 → catch-all 500  (fallthrough / unmapped (catch-all 500))
      given 인증된 사용자. RoomService 또는 RoomCheckResultService 가 매핑되지 않은 RuntimeException(NPE 등) throw — 예: getRooms 의 issuesSummary 집계 
      when  GET /api/v1/rooms  (서비스 내부에서 비예상 예외 발생하도록 스텁)
      then  HTTP 500. GlobalExceptionHandler.handleException → code="COMMON_500", message="Internal server error.". 각 catch-all 케이스는  [COMMON_500]

## AuthController  (34 scenarios)
endpoints: GET /api/v1/auth/oauth2/{provider}, GET /api/v1/auth/oauth2/{provider}/callback, POST /api/v1/auth/guest, POST /api/v1/auth/jwt/refresh, POST /api/v1/auth/logout

- [ ] **AUTH-AZ-01** authorize with unsupported provider string  (OAuth state / provider routing)
      given oauthService.buildAuthorizeUrl switch default branch fires for any provider not 'naver'/'google'
      when  GET /api/v1/auth/oauth2/kakao (path var provider='kakao')
      then  HTTP 400, flat ApiResponse {success:false, code:'AUTH_40001', message:'Invalid OAuth provider.', data:null} via GlobalEx  [AUTH_40001 (INVALID_PROVIDER)]
- [ ] **AUTH-AZ-02** authorize provider casing mismatch ('Naver') is unsupported  (OAuth state / provider routing)
      given switch is case-sensitive on lowercase 'naver'/'google'; 'Naver' falls to default
      when  GET /api/v1/auth/oauth2/Naver
      then  HTTP 400, flat body code 'AUTH_40001' (treated as invalid provider, not normalized)  [AUTH_40001 (INVALID_PROVIDER)]
- [ ] **AUTH-AZ-03** authorize via wrong HTTP method  (validation / 검증 (request shape))
      given endpoint is mapped GET only
      when  POST /api/v1/auth/oauth2/naver
      then  HTTP 405, flat body code 'COMMON_405' via GlobalExceptionHandler PATH B  [COMMON_405]
- [ ] **AUTH-CB-01** callback when provider denies consent (error param present)  (OAuth state / provider routing)
      given controller checks StringUtils.hasText(error) FIRST, before code/state
      when  GET /api/v1/auth/oauth2/naver/callback?error=access_denied (no code/state)
      then  HTTP 400, flat body code 'AUTH_40005', message 'OAuth login was denied by the user.' PATH A; error param takes precedenc  [AUTH_40005 (OAUTH_USER_DENIED)]
- [ ] **AUTH-CB-02** callback missing code query param  (validation / 검증 (request shape))
      given code is @RequestParam(required=false); controller guards !hasText(code)
      when  GET /api/v1/auth/oauth2/naver/callback?state=abc123 (no code, no error)
      then  HTTP 400, flat body code 'AUTH_40002', message 'Invalid or expired OAuth state.' PATH A (note: NOT a COMMON_400 validati  [AUTH_40002 (INVALID_STATE)]
- [ ] **AUTH-CB-03** callback missing state query param  (OAuth state / provider routing)
      given state is required=false; controller guards !hasText(state)
      when  GET /api/v1/auth/oauth2/naver/callback?code=authcode (no state, no error)
      then  HTTP 400, flat body code 'AUTH_40002' PATH A  [AUTH_40002 (INVALID_STATE)]
- [ ] **AUTH-CB-04** callback with unknown / never-issued state  (OAuth state / provider routing)
      given both code and state present; oauthService.validateState calls validateAndDeleteState which returns false for unknown sta
      when  GET /api/v1/auth/oauth2/naver/callback?code=authcode&state=neverissued
      then  HTTP 400, flat body code 'AUTH_40002' PATH A  [AUTH_40002 (INVALID_STATE)]
- [ ] **AUTH-CB-05** callback with reused (single-use, already consumed) state  (OAuth state / provider routing)
      given state was valid once; validateAndDeleteState already deleted it on first use, second call returns false
      when  GET /api/v1/auth/oauth2/naver/callback?code=authcode&state=usedonce (replayed)
      then  HTTP 400, flat body code 'AUTH_40002'; distinct branch from unknown-state but same code — replay protection  [AUTH_40002 (INVALID_STATE)]
- [ ] **AUTH-CB-06** callback with unsupported provider after state passes  (OAuth state / provider routing)
      given valid state, but handleCallback provider is neither 'naver' nor 'google'
      when  GET /api/v1/auth/oauth2/kakao/callback?code=authcode&state=validstate
      then  HTTP 400, flat body code 'AUTH_40001' PATH A (OAuthService.handleCallback fallthrough)  [AUTH_40001 (INVALID_PROVIDER)]
- [ ] **AUTH-CB-07** callback: provider token-exchange RestClient failure (4xx/5xx/timeout)  (external-API failure / 외부 API 실패)
      given valid state+provider; tokenClient.exchangeNaverCodeForToken throws (wrapped in try/catch)
      when  GET /api/v1/auth/oauth2/naver/callback?code=badcode&state=validstate; stub OAuthTokenClient to throw
      then  HTTP 502, flat body code 'AUTH_50201', message 'OAuth token request failed.' PATH A (wrapped, NOT COMMON_500)  [AUTH_50201 (OAUTH_TOKEN_REQUEST_FAILED)]
- [ ] **AUTH-CB-08** callback: provider userinfo RestClient failure  (external-API failure / 외부 API 실패)
      given token exchange ok; userInfoClient.fetchNaverUserInfo throws (wrapped)
      when  GET /api/v1/auth/oauth2/naver/callback?code=authcode&state=validstate; stub userinfo client to throw
      then  HTTP 502, flat body code 'AUTH_50202', message 'OAuth user info request failed.' PATH A  [AUTH_50202 (OAUTH_USERINFO_REQUEST_FAILED)]
- [ ] **AUTH-CB-09** callback: naver userinfo returns null response/id  (external-API failure / 외부 API 실패)
      given userinfo call succeeds but body.response==null or response.id==null
      when  GET /api/v1/auth/oauth2/naver/callback?code=authcode&state=validstate; stub userinfo to return empty response
      then  HTTP 502, flat body code 'AUTH_50202' PATH A (explicit null guard maps to userinfo-failed)  [AUTH_50202 (OAUTH_USERINFO_REQUEST_FAILED)]
- [ ] **AUTH-CB-10** callback: provider returns no email  (OAuth state / provider routing)
      given AuthService.handleOAuthCallback sees oauthInfo.email()==null or blank
      when  GET /api/v1/auth/oauth2/google/callback?code=authcode&state=validstate; stub userinfo email=null
      then  HTTP 400, flat body code 'AUTH_40006', message 'Email is required but was not provided by the OAuth provider.' PATH A  [AUTH_40006 (OAUTH_EMAIL_NOT_PROVIDED)]
- [ ] **AUTH-CB-11** callback: same email already registered under a different provider  (DB constraint / 무결성)
      given userRepository.findByEmailAndProviderNotAndIsDeletedFalse returns a present user (app-level guard, fires before DB)
      when  GET /api/v1/auth/oauth2/google/callback?code=authcode&state=validstate; existing naver account has same email
      then  HTTP 409, flat body code 'AUTH_40901', message 'An account with this email already exists using a different social provi  [AUTH_40901 (DUPLICATE_EMAIL_DIFFERENT_PROVIDER)]
- [ ] **AUTH-CB-12** callback OAuth-vs-juso failure contrast (defect-pin)  (fallthrough / unmapped (catch-all 500))
      given OAuthService wraps RestClient in try/catch (unlike juso/geocoding which propagate to COMMON_500)
      when  GET /api/v1/auth/oauth2/naver/callback with provider call throwing; compare to GeocodingService behavior
      then  PIN: OAuth external failure = clean 502 AUTH_50201/50202, NOT COMMON_500 — assert it stays 502 so a future un-wrapping r  [AUTH_50201 / AUTH_50202]
- [ ] **AUTH-CB-13** callback Provider.valueOf unguarded mapping (latent defect-pin)  (fallthrough / unmapped (catch-all 500))
      given AuthService calls Provider.valueOf(provider.toUpperCase()) with no try/catch; today unreachable because OAuthService swi
      when  hypothetical: OAuthService returns a provider string with no matching Provider enum constant
      then  DOCUMENT (not primary assert): IllegalArgumentException would propagate uncaught -> COMMON_500/500; flag as latent gap i  [COMMON_500]
- [ ] **AUTH-CB-14** callback via wrong HTTP method  (validation / 검증 (request shape))
      given callback is mapped GET only
      when  POST /api/v1/auth/oauth2/naver/callback
      then  HTTP 405, flat body code 'COMMON_405' PATH B  [COMMON_405]
- [ ] **AUTH-GU-01** guest token via wrong HTTP method  (validation / 검증 (request shape))
      given guest is mapped POST only; permitAll route
      when  GET /api/v1/auth/guest
      then  HTTP 405, flat body code 'COMMON_405' PATH B  [COMMON_405]
- [ ] **AUTH-GU-02** guest endpoint requires no auth (negative-of-protection sanity)  (auth / 인증 (token & session))
      given /api/v1/auth/guest is permitAll; must NOT 401 even with no token
      when  POST /api/v1/auth/guest with no Authorization header
      then  HTTP 200, flat body {success:true, data:{guestId, accessToken}} — assert it does NOT fall to AUTH_401; pins permitAll wi  [none]
- [ ] **AUTH-RF-01** refresh with missing refresh_token cookie  (auth / 인증 (token & session))
      given @CookieValue refresh_token required=false -> null; AuthService.refresh guards null/blank
      when  POST /api/v1/auth/jwt/refresh with no refresh_token cookie
      then  HTTP 400, flat body code 'AUTH_40004', message 'Missing refresh token.' PATH A  [AUTH_40004 (MISSING_REFRESH_TOKEN)]
- [ ] **AUTH-RF-02** refresh with malformed / bad-signature refresh token  (auth / 인증 (token & session))
      given jwtProvider.validateToken returns false for unparseable or wrong-signed token
      when  POST /api/v1/auth/jwt/refresh, Cookie: refresh_token=garbage.jwt.value
      then  HTTP 401, flat body code 'AUTH_40104', message 'Invalid refresh token.' PATH A  [AUTH_40104 (INVALID_REFRESH_TOKEN)]
- [ ] **AUTH-RF-03** refresh token valid but does not match stored token  (auth / 인증 (token & session))
      given validateToken passes; jwtService.validateRefreshToken(userId, token) returns false (rotated/revoked/replaced)
      when  POST /api/v1/auth/jwt/refresh with an old but signature-valid refresh token after rotation
      then  HTTP 401, flat body code 'AUTH_40105', message 'Refresh token mismatch.' PATH A — covers single-threaded boundary of the  [AUTH_40105 (REFRESH_TOKEN_MISMATCH)]
- [ ] **AUTH-RF-04** refresh with EXPIRED refresh-token JWT (defect-pin)  (auth / 인증 (token & session))
      given jwtProvider.validateToken catches ExpiredJwtException in its blanket catch and returns false
      when  POST /api/v1/auth/jwt/refresh, Cookie: refresh_token=<expired but well-formed JWT>
      then  HTTP 401, flat body code 'AUTH_40104' (INVALID, not a dedicated 'refresh expired' code) — PIN current behavior so a futu  [AUTH_40104 (INVALID_REFRESH_TOKEN)]
- [ ] **AUTH-RF-05** refresh for a user that no longer exists  (not-found / 리소스 부재 (null·orElseThrow))
      given token valid + matches stored, but userRepository.findById(userId) returns empty (user hard-deleted / id absent)
      when  POST /api/v1/auth/jwt/refresh with a valid refresh token whose userId has no users row
      then  HTTP 404, flat body code 'AUTH_40401', message 'User not found.' PATH A (orElseThrow)  [AUTH_40401 (USER_NOT_FOUND)]
- [ ] **AUTH-RF-06** refresh with blank/empty cookie value  (validation / 검증 (request shape))
      given cookie present but value empty/whitespace; refresh guards isBlank()
      when  POST /api/v1/auth/jwt/refresh, Cookie: refresh_token=
      then  HTTP 400, flat body code 'AUTH_40004' PATH A (blank treated same as missing)  [AUTH_40004 (MISSING_REFRESH_TOKEN)]
- [ ] **AUTH-RF-07** refresh via wrong HTTP method  (validation / 검증 (request shape))
      given refresh is mapped POST only
      when  GET /api/v1/auth/jwt/refresh
      then  HTTP 405, flat body code 'COMMON_405' PATH B  [COMMON_405]
- [ ] **AUTH-RF-08** refresh is permitAll — must not 401 on missing Authorization header  (auth / 인증 (token & session))
      given /api/v1/auth/jwt/refresh is permitAll; auth comes from cookie not the security chain
      when  POST /api/v1/auth/jwt/refresh with valid refresh_token cookie but NO Authorization header
      then  Does NOT hit AUTH_401 entrypoint; proceeds to AuthService.refresh — pins that refresh bypasses .authenticated()  [none]
- [ ] **AUTH-LO-01** logout with no token (security entrypoint)  (auth / 인증 (token & session))
      given /logout is .authenticated(); JwtAuthenticationFilter sets no auth; SecurityConfig authenticationEntryPoint fires
      when  POST /api/v1/auth/logout with no Authorization header
      then  HTTP 401, flat literal body {success:false, code:'AUTH_401', message:'Unauthorized', data:null} PATH C (BYPASSES advice   [AUTH_401]
- [ ] **AUTH-LO-02** logout with expired access token (JwtAuthenticationFilter)  (auth / 인증 (token & session))
      given filter calls jwtProvider.isTokenExpired -> true and writes its own response, returning before the chain
      when  POST /api/v1/auth/logout, Authorization: Bearer <expired access JWT>
      then  HTTP 401, flat body code 'AUTH_40102', message 'Access token has expired. Please re-login.' PATH C (filter writeErrorRes  [AUTH_40102]
- [ ] **AUTH-LO-03** logout with invalid / bad-signature access token  (auth / 인증 (token & session))
      given not expired but validateToken false; filter writes AUTH_40103 and returns
      when  POST /api/v1/auth/logout, Authorization: Bearer not.a.real.jwt
      then  HTTP 401, flat body code 'AUTH_40103', message 'Invalid access token.' PATH C (filter, bypasses advice)  [AUTH_40103]
- [ ] **AUTH-LO-04** logout with a GUEST token (anonymous principal)  (auth / 인증 (token & session))
      given GUEST token passes the filter WITHOUT setting authentication; SecurityUtil.getCurrentUserId sees AnonymousAuthentication
      when  POST /api/v1/auth/logout, Authorization: Bearer <valid GUEST token from /guest>
      then  HTTP 401, flat body code 'AUTH_40101', message 'Unauthorized.' PATH A (thrown inside controller — distinct from no-token  [AUTH_40101 (UNAUTHORIZED)]
- [ ] **AUTH-LO-05** logout via wrong HTTP method  (validation / 검증 (request shape))
      given logout is mapped POST only
      when  GET /api/v1/auth/logout (with valid Bearer)
      then  HTTP 405, flat body code 'COMMON_405' PATH B  [COMMON_405]
- [ ] **AUTH-LO-06** logout with malformed Authorization header (no 'Bearer ' prefix)  (auth / 인증 (token & session))
      given extractTokenFromRequest returns null when header lacks 'Bearer ' prefix; filter treats it as no-token
      when  POST /api/v1/auth/logout, Authorization: Token abc123 (wrong scheme)
      then  HTTP 401, flat body code 'AUTH_401' PATH C (no token extracted -> entrypoint, NOT AUTH_40103)  [AUTH_401]
- [ ] **AUTH-LO-07** logout idempotency: token valid but no stored refresh token  (domain business-rule / 비즈니스 규칙)
      given jwtService.deleteRefreshToken(userId) is a no-op when nothing stored (no orElseThrow)
      when  POST /api/v1/auth/logout twice with the same valid Bearer token
      then  Both return HTTP 200, flat {success:true, data:null}, Set-Cookie expiring refresh_token — pins that double-logout does N  [none]

## MapController  (28 scenarios)
endpoints: GET /api/v1/map/rooms, GET /api/v1/map/points, POST /api/v1/map/points, DELETE /api/v1/map/points/{pointId}

- [ ] **MAP-01** GET /rooms 토큰 없음 → AUTH_40101  (auth / 인증 (token & session))
      given SecurityContext에 인증 principal이 없음(SecurityUtil.getCurrentUserId가 GeneralException(AuthErrorCode.UNAUTHORIZED)을 던지는 상태). 
      when  GET /api/v1/map/rooms (Authorization 헤더 없음, 쿼리 없음)
      then  HTTP 401, flat ApiResponse {success:false, code:"AUTH_40101", message:"Unauthorized.", data:null}. PATH A(advice 경유). 단위  [AUTH_40101]
- [ ] **MAP-02** GET /rooms 만료/위조 JWT → 필터 단 AUTH_40102/40103 (advice 우회)  (auth / 인증 (token & session))
      given JwtAuthenticationFilter가 만료(40102) 또는 위조(40103) 토큰을 직접 writeErrorResponse로 처리. @WebMvcTest가 필터 체인을 제외하면 재현되지 않음 → securi
      when  GET /api/v1/map/rooms (Authorization: Bearer <expired/invalid>)
      then  HTTP 401, flat ApiResponse code="AUTH_40102"(만료) 또는 "AUTH_40103"(위조). PATH C(필터가 직접 작성, GlobalExceptionHandler 미경유). 컨트롤  [AUTH_40102]
- [ ] **MAP-03** GET /rooms rentType 잘못된 enum 문자열 → 타입 미스매치  (validation / 검증 (request shape))
      given rentType 쿼리는 RentType enum 바인딩. 정의 외 문자열은 MethodArgumentTypeMismatchException 유발. 인증은 통과 상태.
      when  GET /api/v1/map/rooms?rentType=WEIRDTYPE
      then  HTTP 400, flat ApiResponse code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'rentType'.". PATH B. data:null.  [COMMON_400_TYPE_MISMATCH]
- [ ] **MAP-04** GET /rooms sort 잘못된 enum 문자열 → 타입 미스매치  (validation / 검증 (request shape))
      given sort 쿼리는 MapSortType enum(DISTANCE_ASC/DEPOSIT_ASC/RENT_ASC/MANAGEMENT_FEE_ASC) 바인딩. 그 외 값은 변환 실패.
      when  GET /api/v1/map/rooms?sort=PRICE_DESC
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'sort'.". PATH B.  [COMMON_400_TYPE_MISMATCH]
- [ ] **MAP-05** GET /rooms pointId 비숫자 → 타입 미스매치  (validation / 검증 (request shape))
      given pointId 쿼리는 Long 바인딩. 비숫자 문자열은 변환 실패. 인증 통과.
      when  GET /api/v1/map/rooms?pointId=abc
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'pointId'.". PATH B.  [COMMON_400_TYPE_MISMATCH]
- [ ] **MAP-06** GET /rooms maxDistance 비숫자 → 타입 미스매치  (validation / 검증 (request shape))
      given maxDistance 쿼리는 Integer 바인딩. 비숫자/소수점 문자열은 변환 실패.
      when  GET /api/v1/map/rooms?maxDistance=10km
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'maxDistance'.". PATH B.  [COMMON_400_TYPE_MISMATCH]
- [ ] **MAP-07** GET /rooms 존재하지 않는 pointId → MAP_404  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증 통과. mapService.getMapPointById(pointId,userId)가 빈 Optional 반환 → 컨트롤러 orElseThrow(GeneralException(MapErrorCode.MAP_PO
      when  GET /api/v1/map/rooms?pointId=999999 (해당 user에게 없는 id)
      then  HTTP 404, flat ApiResponse code="MAP_404", message="기준점을 찾을 수 없습니다.". PATH A. rooms 거리계산 분기에 진입하기 전 throw.  [MAP_404]
- [ ] **MAP-08** GET /rooms 소프트삭제된 pointId → MAP_404  (not-found / 리소스 부재 (null·orElseThrow))
      given pointId 행이 존재하나 is_deleted=true. repository.findByIdAndUserIdAndIsDeletedFalse가 빈 Optional 반환.
      when  GET /api/v1/map/rooms?pointId=<soft-deleted id>
      then  HTTP 404, code="MAP_404". 소프트삭제 행은 200이 아니라 404로 표면화됨을 핀.  [MAP_404]
- [ ] **MAP-09** GET /rooms 타 유저의 pointId → MAP_404 (소유권 격리)  (not-found / 리소스 부재 (null·orElseThrow))
      given pointId가 다른 userId 소유. 쿼리가 userId로 스코프되어 현재 user에겐 조회 안 됨 → 403이 아니라 404로 누설 차단.
      when  GET /api/v1/map/rooms?pointId=<other-user's point>
      then  HTTP 404, code="MAP_404". 권한부족을 404로 처리(존재 자체를 숨김).  [MAP_404]
- [ ] **MAP-10** GET /rooms 외부/하위 서비스 예외 전파 → COMMON_500  (fallthrough / unmapped (catch-all 500))
      given 인증·pointId 통과. roomCheckResultService.getRoomIssuesSummary(roomId) 또는 roomRepository.findRoomsWithFilter가 예기치 못한 Runtime
      when  GET /api/v1/map/rooms (정상 쿼리, 하위 서비스 강제 예외 주입)
      then  HTTP 500, code="COMMON_500", message="Internal server error.". PATH B catch-all. 미매핑 결함 후보로 기록.  [COMMON_500]
- [ ] **MAP-11** GET /rooms maxDistance 음수 → 결과 무음 빈 리스트 (검증 갭)  (validation / 검증 (request shape))
      given maxDistance에 범위/양수 검증 없음(@Min 등 미적용). 컨트롤러는 dto.getDistanceM() <= maxDistance 필터만 수행. 음수면 모든 방이 탈락.
      when  GET /api/v1/map/rooms?pointId=<valid>&maxDistance=-1
      then  HTTP 200, data:[] (빈 배열). 에러가 아니라 무음 빈 결과 — 현재 동작을 핀하고 검증 부재를 갭으로 플래그.  []
- [ ] **MAP-12** GET /points 토큰 없음 → AUTH_40101  (auth / 인증 (token & session))
      given 인증 미설정. getMapPoints 첫 줄 SecurityUtil.getCurrentUserId()가 throw.
      when  GET /api/v1/map/points (인증 없음)
      then  HTTP 401, flat ApiResponse code="AUTH_40101", message="Unauthorized.". PATH A.  [AUTH_40101]
- [ ] **MAP-13** GET /points 잘못된 HTTP 메서드 → COMMON_405  (validation / 검증 (request shape))
      given /api/v1/map/points는 GET/POST만 매핑. PUT/PATCH는 미지원.
      when  PUT /api/v1/map/points
      then  HTTP 405, code="COMMON_405" (HttpRequestMethodNotSupportedException). PATH B.  [COMMON_405]
- [ ] **MAP-14** POST /points 빈/공백 name·address → 검증 실패  (validation / 검증 (request shape))
      given MapPointCreateRequestDTO: name·address @NotBlank. 공백/누락은 MethodArgumentNotValidException.
      when  POST /api/v1/map/points body={"name":"","address":"  ","lat":37.5,"lon":127.0}
      then  HTTP 400, code="COMMON_400_VALIDATION", message에 "기준점 이름은 필수입니다."/"주소는 필수입니다." 필드 메시지 포함(substring 검증). PATH B. code 우선   [COMMON_400_VALIDATION]
- [ ] **MAP-15** POST /points lat·lon 누락(null) → 검증 실패  (validation / 검증 (request shape))
      given lat·lon @NotNull(BigDecimal). 누락 시 bean validation 위반. MapPoint 엔티티 컬럼도 nullable=false.
      when  POST /api/v1/map/points body={"name":"집근처역","address":"서울시..."} (lat·lon 없음)
      then  HTTP 400, code="COMMON_400_VALIDATION", message에 "위도는 필수입니다."/"경도는 필수입니다." 포함. PATH B. 엔티티 not-null 위반(COMMON_409)까지 가기   [COMMON_400_VALIDATION]
- [ ] **MAP-16** POST /points 비어있는/깨진 JSON 바디 → 읽기 불가  (validation / 검증 (request shape))
      given @RequestBody 필수. 빈 본문 또는 깨진 JSON은 HttpMessageNotReadableException.
      when  POST /api/v1/map/points (Content-Type: application/json, 본문 비어있음 또는 {"name":)
      then  HTTP 400, code="COMMON_400_BODY_NOT_READABLE". PATH B.  [COMMON_400_BODY_NOT_READABLE]
- [ ] **MAP-17** POST /points lat·lon 비숫자 문자열 → 읽기 불가  (validation / 검증 (request shape))
      given lat·lon은 BigDecimal로 역직렬화. 숫자가 아닌 문자열은 Jackson 역직렬화 단계에서 실패 → HttpMessageNotReadableException(@Valid 도달 전).
      when  POST /api/v1/map/points body={"name":"역","address":"주소","lat":"north","lon":"east"}
      then  HTTP 400, code="COMMON_400_BODY_NOT_READABLE" (VALIDATION 아님 — 역직렬화 단계 실패). PATH B.  [COMMON_400_BODY_NOT_READABLE]
- [ ] **MAP-18** POST /points 토큰 없음 → AUTH_40101  (auth / 인증 (token & session))
      given 인증 미설정. @Valid 바디 검증은 통과해도 컨트롤러 본문 첫 줄 SecurityUtil.getCurrentUserId()에서 throw. (주의: @Valid 위반이 동시에 있으면 검증이 먼저 400을 낼 수 
      when  POST /api/v1/map/points body={유효한 name/address/lat/lon} (인증 없음)
      then  HTTP 401, code="AUTH_40101", message="Unauthorized.". PATH A.  [AUTH_40101]
- [ ] **MAP-19** POST /points 범위 밖 lat·lon → 검증 없이 저장 (검증 갭)  (validation / 검증 (request shape))
      given DTO/엔티티에 위경도 범위 검증 없음(@DecimalMin/Max 미적용). precision=10,scale=7만 존재. -90~90/-180~180 밖 값도 통과.
      when  POST /api/v1/map/points body={"name":"x","address":"y","lat":999.0,"lon":-500.0}
      then  HTTP 200, 저장 성공(혹은 precision 초과 시 DB 단계 COMMON_500). 의미적으로 잘못된 좌표가 무검증 저장됨 — 검증 부재 갭으로 플래그.  []
- [ ] **MAP-20** POST /points 저장 시 무결성 위반 → COMMON_409  (DB constraint / 무결성)
      given createMapPoint→mapRepository.save에 try/catch 없음. DB 유니크/제약 위반 시 DataIntegrityViolationException 전파.
      when  POST /api/v1/map/points (제약 위반 유발하는 바디; 단위테스트는 save가 DataIntegrityViolationException 던지도록 stub)
      then  HTTP 409, code="COMMON_409", message는 드라이버 메시지에 "Duplicate" 포함 시 "Duplicate value violates unique constraint." 아니면 "Data  [COMMON_409]
- [ ] **MAP-21** POST /points 영속화 비제약 예외 → COMMON_500  (fallthrough / unmapped (catch-all 500))
      given save 중 DataIntegrity가 아닌 예기치 못한 예외(JDBC 연결 끊김, NPE 등). MapService 미래핑.
      when  POST /api/v1/map/points (유효 바디; save가 일반 RuntimeException 던지도록 stub)
      then  HTTP 500, code="COMMON_500", message="Internal server error.". PATH B catch-all.  [COMMON_500]
- [ ] **MAP-22** DELETE /points/{pointId} 토큰 없음 → AUTH_40101  (auth / 인증 (token & session))
      given 인증 미설정. deleteMapPoint 첫 줄 SecurityUtil.getCurrentUserId() throw.
      when  DELETE /api/v1/map/points/1 (인증 없음)
      then  HTTP 401, code="AUTH_40101", message="Unauthorized.". PATH A.  [AUTH_40101]
- [ ] **MAP-23** DELETE /points/{pointId} 비숫자 path var → 타입 미스매치  (validation / 검증 (request shape))
      given pointId path var는 Long. 비숫자 세그먼트는 MethodArgumentTypeMismatchException.
      when  DELETE /api/v1/map/points/abc
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message="Invalid value for 'pointId'.". PATH B.  [COMMON_400_TYPE_MISMATCH]
- [ ] **MAP-24** DELETE /points/{pointId} 존재하지 않는 id → MAP_404  (not-found / 리소스 부재 (null·orElseThrow))
      given 인증 통과. mapService.deleteMapPoint → findByIdAndUserIdAndIsDeletedFalse 빈 Optional → orElseThrow(GeneralException(MAP_POIN
      when  DELETE /api/v1/map/points/999999
      then  HTTP 404, code="MAP_404", message="기준점을 찾을 수 없습니다.". PATH A.  [MAP_404]
- [ ] **MAP-25** DELETE /points/{pointId} 이미 소프트삭제됨(중복 삭제) → MAP_404  (not-found / 리소스 부재 (null·orElseThrow))
      given 행이 존재하나 is_deleted=true. 두 번째 삭제 호출 시 IsDeletedFalse 쿼리가 빈 Optional 반환 → 멱등 아님(204/200 아닌 404).
      when  DELETE /api/v1/map/points/<already soft-deleted id> (같은 id 2회차)
      then  HTTP 404, code="MAP_404". 삭제 멱등성 부재를 핀 — 재삭제가 404로 떨어짐.  [MAP_404]
- [ ] **MAP-26** DELETE /points/{pointId} 타 유저 소유 id → MAP_404 (소유권 격리)  (not-found / 리소스 부재 (null·orElseThrow))
      given pointId가 다른 userId 소유. 쿼리가 (id,userId)로 스코프 → 현재 user는 삭제 불가, 403이 아닌 404.
      when  DELETE /api/v1/map/points/<other-user's point>
      then  HTTP 404, code="MAP_404". 권한부족을 존재은닉 404로 처리.  [MAP_404]
- [ ] **MAP-27** 기준점 생성 동시성 — 카운트 캡/락 없음(설계 한계 문서화)  (concurrency / 동시성)
      given MapPoint 생성에 개수 상한·@Version·비관락 없음. @Transactional만 존재. 순수 단위테스트로 레이스 재현 불가.
      when  동일 user가 createMapPoint를 동시 다발 호출(개념상)
      then  기준점 무제한 생성 — 클린 에러코드 없음. 알려진 한계로 문서화하고, 단일스레드 경계(연속 N건 성공)만 단위테스트로 핀.  []
- [ ] **MAP-28** 잘못된 HTTP 메서드 on /points/{pointId} → COMMON_405  (validation / 검증 (request shape))
      given /api/v1/map/points/{pointId}는 DELETE만 매핑(GET/PUT 미지원).
      when  GET /api/v1/map/points/1
      then  HTTP 405, code="COMMON_405" (HttpRequestMethodNotSupportedException). PATH B.  [COMMON_405]

## AddressController (행안부 juso 주소검색 프록시)  (15 scenarios)
endpoints: GET /api/v1/address/search?keyword={String} — 키워드 기반 주소 검색 (행안부 juso addrLinkApi 프록시), returns ApiResponse<List<AddressSearchResponseDTO>> {roadAddr, jibunAddr, zipNo}

- [ ] **ADDR-01** 토큰 없이 보호 라우트 호출 → 401 (SecurityConfig entrypoint, PATH C)  (auth / 인증 (token & session))
      given /api/v1/address/** 는 SecurityConfig 의 어떤 permitAll 매처에도 없고 .anyRequest().authenticated() 에 걸리는 보호 라우트다. 시큐리티 필터체인이 활성화된 
      when  GET /api/v1/address/search?keyword=강남 (Authorization 헤더 없음)
      then  HTTP 401. 응답은 GlobalExceptionHandler 를 거치지 않고 SecurityConfig authenticationEntryPoint 가 직접 기록한 평탄 바디 {success:false, cod  [AUTH_401]
- [ ] **ADDR-02** 만료된 JWT 로 호출 → 401 (JwtAuthenticationFilter, PATH C)  (auth / 인증 (token & session))
      given exp 가 지난 access 토큰. JwtAuthenticationFilter.writeErrorResponse 가 어드바이스를 우회하여 직접 응답을 기록한다. 필터가 등록된 컨텍스트 필요.
      when  GET /api/v1/address/search?keyword=강남 (Authorization: Bearer <expired>)
      then  HTTP 401, 평탄 바디 code=="AUTH_40102" (만료). enum AuthErrorCode 값이 아니라 필터 하드코딩 리터럴이므로 정확히 "AUTH_40102" 단언.  [AUTH_40102]
- [ ] **ADDR-03** 위변조/형식불량 JWT 로 호출 → 401 invalid (JwtAuthenticationFilter, PATH C)  (auth / 인증 (token & session))
      given 서명 검증 실패 또는 파싱 불가한 토큰. JwtAuthenticationFilter 가 invalid 분기로 직접 응답 기록.
      when  GET /api/v1/address/search?keyword=강남 (Authorization: Bearer not-a-real-jwt)
      then  HTTP 401, 평탄 바디 code=="AUTH_40103".  [AUTH_40103]
- [ ] **ADDR-04** GUEST 타입 토큰으로 호출 → 401 (게스트는 인증 미설정 → entrypoint)  (auth / 인증 (token & session))
      given GUEST 토큰은 JwtAuthenticationFilter 를 통과하되 SecurityContext 에 authentication 을 세팅하지 않는다(server_notes). address/search 는 .au
      when  GET /api/v1/address/search?keyword=강남 (Authorization: Bearer <guest-token>)
      then  HTTP 401, entrypoint 바디 code=="AUTH_401". (게스트는 익명 취급되어 인증 필요 라우트 진입 불가) — 현 동작 핀.  [AUTH_401]
- [ ] **ADDR-05** juso 외부 API 가 5xx 반환 → 미래핑 → COMMON_500 (PATH B 캐치올, KNOWN GAP)  (external-API failure / 외부 API 실패 (juso · Naver geocoding · OAuth))
      given AddressSearchService.getLegitAddress 의 RestClient 호출은 try/catch 로 감싸지 않음(OAuthService 와 달리). juso addrLinkApi 가 5xx 응답 →
      when  GET /api/v1/address/search?keyword=강남 (인증 통과 상태)
      then  HTTP 500. GlobalExceptionHandler.handleException 캐치올 → 평탄 바디 {success:false, code:"COMMON_500", message:"Internal server  [COMMON_500]
- [ ] **ADDR-06** juso 외부 API 가 4xx(키 오류/쿼터) 반환 → COMMON_500 (KNOWN GAP)  (external-API failure / 외부 API 실패 (juso · Naver geocoding · OAuth))
      given confmKey 무효 또는 호출쿼터 초과로 juso 가 4xx 반환. 미래핑이므로 4xx 도 도메인 코드로 변환되지 않는다. RestClient stub 으로 HttpClientErrorException 발생.
      when  GET /api/v1/address/search?keyword=강남
      then  HTTP 500, code=="COMMON_500". 4xx→500 으로 격하되는 현 동작 핀(외부 인증오류가 서버 내부오류로 마스킹됨) — 갭 기록.  [COMMON_500]
- [ ] **ADDR-07** juso 응답 타임아웃/연결실패 → COMMON_500 (KNOWN GAP)  (external-API failure / 외부 API 실패 (juso · Naver geocoding · OAuth))
      given juso 호스트 무응답/네트워크 단절. RestClient 가 ResourceAccessException(타임아웃) 던짐. 미래핑.
      when  GET /api/v1/address/search?keyword=강남
      then  HTTP 500, code=="COMMON_500", message=="Internal server error.". 타임아웃 전용 502/504 매핑 없음 — 갭.  [COMMON_500]
- [ ] **ADDR-08** juso 가 파싱불가 바디 반환 → 역직렬화 실패 → COMMON_500  (external-API failure / 외부 API 실패 (juso · Naver geocoding · OAuth))
      given juso 가 200 이지만 JusoApiResponseDTO 와 맞지 않는 본문(HTML 오류페이지/깨진 JSON) 반환. RestClient .body(JusoApiResponseDTO.class) 역직렬화에서 예
      when  GET /api/v1/address/search?keyword=강남
      then  HTTP 500, code=="COMMON_500". (juso 가 에러를 200+HTML 로 주는 실패모드 — 역직렬화 예외가 캐치올로) 갭 기록.  [COMMON_500]
- [ ] **ADDR-09** keyword 미제공(파라미터 부재) → 빈 리스트 200 (에러 아님, 사일런트 분기)  (validation / 검증 (request shape))
      given keyword 는 @RequestParam(required=false) String. 서비스 진입부에서 null/blank 면 Collections.emptyList() 즉시 반환. juso 호출 자체가 일어나지 않
      when  GET /api/v1/address/search (keyword 없음)
      then  HTTP 200, {success:true, code:..., message:..., data:[]}. 400 아님. required=false + 사일런트 빈리스트 동작 핀(누락이 검증오류로 안 잡힘).  []
- [ ] **ADDR-10** keyword 가 공백문자열 → 빈 리스트 200 (isBlank 분기)  (validation / 검증 (request shape))
      given getLegitAddress 의 keyword.isBlank() 가드. 공백/스페이스만 입력 시 외부호출 없이 빈 리스트.
      when  GET /api/v1/address/search?keyword=%20%20 (공백 2칸)
      then  HTTP 200, data==[]. 외부 API 미호출 단언(RestClient 미상호작용). 에러 아님.  []
- [ ] **ADDR-11** juso 가 결과 0건(정상응답이나 매칭 없음) → 빈 리스트 200 (사일런트 no-result, GAP)  (not-found / 리소스 부재 (null·orElseThrow))
      given juso 가 200 으로 results.juso == null 또는 빈 리스트 반환. 서비스의 null 가드(response/results/juso null 체크) 통과 후 빈 리스트 반환. RestClient st
      when  GET /api/v1/address/search?keyword=존재하지않는주소xyz
      then  HTTP 200, data==[]. GEOCODING_400 / 404 아님 — ADDRESS_NOT_FOUND 데드코드, no-result 가 에러로 표면화되지 않는 현 동작 핀(갭).  []
- [ ] **ADDR-12** juso 가 응답 전체 null → 빈 리스트 200 (response==null 가드)  (not-found / 리소스 부재 (null·orElseThrow))
      given RestClient .body(...) 가 null 반환(빈 본문 등). 서비스의 response==null 가드.
      when  GET /api/v1/address/search?keyword=강남
      then  HTTP 200, data==[]. NPE 없이 빈리스트로 흡수되는지 단언(가드 동작 핀).  []
- [ ] **ADDR-13** 잘못된 HTTP 메서드(POST) → 405 (PATH B)  (validation / 검증 (request shape))
      given 엔드포인트는 @GetMapping("/search") 만 존재. POST 핸들러 없음. HttpRequestMethodNotSupportedException.
      when  POST /api/v1/address/search?keyword=강남
      then  HTTP 405, 평탄 바디 code=="COMMON_405", message 는 "Method not allowed: POST" 로 시작. (단, 보호 라우트라 토큰 없으면 401 이 먼저 — 인증 통과 후 메서드  [COMMON_405]
- [ ] **ADDR-14** 존재하지 않는 하위 경로 → 404 (PATH B)  (validation / 검증 (request shape))
      given AddressController 에 /search 외 매핑 없음. NoResourceFoundException.
      when  GET /api/v1/address/unknown?keyword=강남
      then  HTTP 404, 평탄 바디 code=="COMMON_404", message=="Resource not found.". (인증 통과 컨텍스트 기준).  [COMMON_404]
- [ ] **ADDR-15** 서비스에서 예기치 못한 RuntimeException(NPE 등) → COMMON_500 (캐치올)  (fallthrough / unmapped (catch-all 500))
      given AddressSearchService.getLegitAddress 가 GeneralException 이 아닌 임의 RuntimeException 던지도록 mock. 어떤 *ErrorCode 로도 매핑되지 않음.
      when  GET /api/v1/address/search?keyword=강남
      then  HTTP 500, code=="COMMON_500", message=="Internal server error.". 미매핑 예외 싱크 동작 핀.  [COMMON_500]

## ChecklistController  (33 scenarios)
endpoints: GET /api/checklist/items, GET /api/checklist/items/all, POST /api/checklist/types/{userType}, DELETE /api/checklist/types/{userType}, GET /api/checklist/types, POST /api/checklist/items/settings, POST /api/checklist/items/custom, DELETE /api/checklist/items/custom/{customItemId}

- [ ] **CHK-01** GET /items 무토큰 → AUTH_40101 (advice 경로)  (auth / 인증 (token & session))
      given SecurityContext에 인증 없음(익명). 컨트롤러 첫 줄이 SecurityUtil.getCurrentUserId() 호출
      when  GET /api/checklist/items (Authorization 헤더 없음, SecurityContext 익명)
      then  HTTP 401, flat ApiResponse {success:false, code:"AUTH_40101", message:"Unauthorized.", data:null}. SecurityUtil이 General  [AUTH_40101]
- [ ] **CHK-02** GET /items 만료 토큰 → AUTH_40102 (filter 경로, advice 우회)  (auth / 인증 (token & session))
      given JwtAuthenticationFilter가 만료된 액세스 토큰을 검출. 보안 필터 체인이 등록된 슬라이스 필요(@WebMvcTest 필터 제외 시 재현 불가)
      when  GET /api/checklist/items (Authorization: Bearer <expired>)
      then  HTTP 401, flat ApiResponse code="AUTH_40102". JwtAuthenticationFilter.writeErrorResponse가 직접 바디를 씀 — GlobalExceptionHand  [AUTH_40102]
- [ ] **CHK-03** GET /items 위조/손상 토큰 → AUTH_40103 (filter 경로)  (auth / 인증 (token & session))
      given JwtAuthenticationFilter가 서명 불일치/구조 손상 토큰을 invalid로 판정. 보안 필터 체인 필요
      when  GET /api/checklist/items (Authorization: Bearer <garbage>)
      then  HTTP 401, code="AUTH_40103", flat ApiResponse. filter가 직접 작성  [AUTH_40103]
- [ ] **CHK-04** GET /items 잘못된 principal 타입 → AUTH_40101  (auth / 인증 (token & session))
      given 인증은 되었으나 principal이 Long(userId)이 아님(예: String). SecurityUtil의 'principal instanceof Long' 분기 false
      when  GET /api/checklist/items (principal=String 으로 SecurityContext stub)
      then  HTTP 401, code="AUTH_40101". SecurityUtil 두 번째 throw 경로(PATH A)  [AUTH_40101]
- [ ] **CHK-05** GET /items 미지원 메서드 → COMMON_405  (validation / 검증 (request shape))
      given /api/checklist/items 는 GET만 매핑됨
      when  PUT /api/checklist/items
      then  HTTP 405, code="COMMON_405", message "Method not allowed: PUT" (PATH B). 인증 통과 가정  [COMMON_405]
- [ ] **CHK-06** GET /items/all 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given getAllItemsForSettings도 SecurityUtil.getCurrentUserId() 선행 호출. 익명 컨텍스트
      when  GET /api/checklist/items/all (인증 없음)
      then  HTTP 401, code="AUTH_40101", flat ApiResponse (PATH A)  [AUTH_40101]
- [ ] **CHK-07** GET /items/all 만료 토큰 → AUTH_40102 (filter)  (auth / 인증 (token & session))
      given 만료 토큰, 보안 필터 체인 등록
      when  GET /api/checklist/items/all (Bearer expired)
      then  HTTP 401, code="AUTH_40102" (PATH C, advice 우회)  [AUTH_40102]
- [ ] **CHK-08** POST /types/{userType} 미지원 enum 문자열 → COMMON_400_TYPE_MISMATCH  (validation / 검증 (request shape))
      given @PathVariable UserType userType — Spring이 문자열을 UserType enum으로 변환 시도. UserType 상수는 BUG_AVOIDER/NOISE_SENSITIVE/CLEAN_FRE
      when  POST /api/checklist/types/UNKNOWN_TYPE (인증 통과)
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message "Invalid value for 'userType'." (PATH B). 서비스에 도달하지 않음  [COMMON_400_TYPE_MISMATCH]
- [ ] **CHK-09** POST /types/{userType} 소문자/대소문자 불일치 → COMMON_400_TYPE_MISMATCH  (validation / 검증 (request shape))
      given enum 변환은 대소문자 정확 일치 필요(valueOf). 'bug_avoider'는 매칭 안 됨
      when  POST /api/checklist/types/bug_avoider
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH" (PATH B). 유효 enum 매핑이 대소문자 민감함을 박제  [COMMON_400_TYPE_MISMATCH]
- [ ] **CHK-10** POST /types/{userType} 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given selectUserType도 SecurityUtil 선행. 단, 컨트롤러는 userType 바인딩(=TYPE_MISMATCH 검사)을 SecurityUtil 호출보다 먼저 수행하므로, 유효한 enum + 무토큰 조합
      when  POST /api/checklist/types/CLEAN_FREAK (인증 없음)
      then  HTTP 401, code="AUTH_40101" (PATH A). 유효 enum을 써야 401이 노출됨(잘못된 enum이면 400이 먼저 터짐)  [AUTH_40101]
- [ ] **CHK-11** DELETE /types/{userType} 미지원 enum → COMMON_400_TYPE_MISMATCH  (validation / 검증 (request shape))
      given deselectUserType의 @PathVariable UserType 변환
      when  DELETE /api/checklist/types/FOO (인증 통과)
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message "Invalid value for 'userType'." (PATH B)  [COMMON_400_TYPE_MISMATCH]
- [ ] **CHK-12** DELETE /types/{userType} 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given 유효 enum + 익명 컨텍스트
      when  DELETE /api/checklist/types/NOISE_SENSITIVE (인증 없음)
      then  HTTP 401, code="AUTH_40101" (PATH A)  [AUTH_40101]
- [ ] **CHK-13** DELETE /types/{userType} 미선택 타입 삭제 → 멱등 200 (에러 아님)  (domain business-rule / 비즈니스 규칙)
      given deselectUserType는 deleteByUserIdAndUserType만 호출 — 존재 여부 검사 없음. 사용자가 선택한 적 없는 타입
      when  DELETE /api/checklist/types/FIRST_TIMER (해당 선택 미존재, 인증 통과)
      then  HTTP 200 (본문 없음). 삭제 0건이어도 에러를 던지지 않는 멱등 동작을 박제(NOT_FOUND 미발생). 현재 동작 고정  []
- [ ] **CHK-14** GET /types 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given getSelectedUserTypes도 SecurityUtil 선행. 익명 컨텍스트
      when  GET /api/checklist/types (인증 없음)
      then  HTTP 401, code="AUTH_40101" (PATH A)  [AUTH_40101]
- [ ] **CHK-15** POST /items/settings 빈/누락 JSON 바디 → COMMON_400_BODY_NOT_READABLE  (validation / 검증 (request shape))
      given @RequestBody ChecklistSettingsRequest. 빈 본문 또는 손상된 JSON은 HttpMessageNotReadableException 유발
      when  POST /api/checklist/items/settings (Content-Type application/json, body 비어있음 또는 '{')
      then  HTTP 400, code="COMMON_400_BODY_NOT_READABLE", message "Malformed JSON request body." (PATH B)  [COMMON_400_BODY_NOT_READABLE]
- [ ] **CHK-16** POST /items/settings disabledItemIds 누락(null) → COMMON_500 (NPE 갭)  (fallthrough / unmapped (catch-all 500))
      given 바디 {} 파싱 성공 → disabledItemIds=null. saveSettings가 disabledItemIds.stream() 호출 전 null 검증 없음 → NullPointerException
      when  POST /api/checklist/items/settings body {} (인증 통과)
      then  HTTP 500, code="COMMON_500", message "Internal server error." (PATH B catch-all). 알려진 결함: null 가드/@NotNull 부재. 400이 되어야   [COMMON_500]
- [ ] **CHK-17** POST /items/settings 타입 불일치 요소(문자열 id) → COMMON_400_BODY_NOT_READABLE  (validation / 검증 (request shape))
      given disabledItemIds는 List<Long>. 배열 요소에 문자열 포함 시 Jackson 역직렬화 실패
      when  POST /api/checklist/items/settings body {"disabledItemIds":["abc"]}
      then  HTTP 400, code="COMMON_400_BODY_NOT_READABLE" (Jackson 변환 실패는 HttpMessageNotReadableException으로 매핑, PATH B)  [COMMON_400_BODY_NOT_READABLE]
- [ ] **CHK-18** POST /items/settings 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given 유효 바디 + 익명 컨텍스트. saveSettings 진입 전 SecurityUtil 선행
      when  POST /api/checklist/items/settings body {"disabledItemIds":[1,2]} (인증 없음)
      then  HTTP 401, code="AUTH_40101" (PATH A)  [AUTH_40101]
- [ ] **CHK-19** POST /items/custom 한도 초과(4번째) → CHECKLIST_400_CUSTOM_LIMIT  (rate / over-limit (count caps))
      given 해당 userId의 CUSTOM 항목이 이미 3개(MAX_CUSTOM_ITEMS=3) 존재. 서비스가 size()>=3 검사
      when  POST /api/checklist/items/custom body {"itemName":"네번째"} (인증 통과)
      then  HTTP 400, code="CHECKLIST_400_CUSTOM_LIMIT", message "나만의 항목은 최대 3개까지만 추가 가능합니다." (PATH A)  [CHECKLIST_400_CUSTOM_LIMIT]
- [ ] **CHK-20** POST /items/custom 경계: 정확히 3개에서 4번째 거부 / 2개→3번째 허용  (rate / over-limit (count caps))
      given 단일 스레드 경계 검증. customItems.size()==2면 통과, ==3이면 거부
      when  (a) 2개 보유 상태 POST 3번째 → 저장; (b) 3개 보유 상태 POST 4번째 → 거부
      then  (a) HTTP 201 저장 1건; (b) HTTP 400 code="CHECKLIST_400_CUSTOM_LIMIT". cap+1 경계 고정  [CHECKLIST_400_CUSTOM_LIMIT]
- [ ] **CHK-21** POST /items/custom 동시 생성 레이스(한도 우회) — 알려진 한계  (concurrency / 동시성)
      given size()>=3 검사가 read-then-write이며 @Version/락/DB 제약 없음(check-then-act). 2개 보유 시 두 요청이 동시에 size()==2를 읽음
      when  동일 userId로 POST /api/checklist/items/custom 2건 동시 요청(각 3번째/4번째)
      then  두 요청 모두 통과해 CUSTOM 4개로 한도 초과 가능 — 깔끔한 에러코드 없이 무결성 위반. 순수 유닛테스트로 재현 불가, 알려진 한계로 문서화. 단일스레드 경계는 CHK-20으로 커버  []
- [ ] **CHK-22** POST /items/custom itemName 누락/null → 검증 부재로 201 저장(결함 박제)  (validation / 검증 (request shape))
      given CustomItemCreateRequest.itemName에 @NotBlank/@Valid 없음. 컨트롤러·서비스 모두 null/blank 검사 없음. 바디 {}면 itemName=null
      when  POST /api/checklist/items/custom body {} (인증 통과, 보유 0~2개)
      then  HTTP 201, itemName=null인 CUSTOM 항목이 그대로 영속화됨. 알려진 결함: 입력 검증 없음 → 마땅히 400(COMMON_400_VALIDATION)이어야 하나 현재 통과. 현재 동작 고정 +   []
- [ ] **CHK-23** POST /items/custom itemName 공백/초장문 → 검증 부재로 201 저장(결함 박제)  (validation / 검증 (request shape))
      given itemName 길이/공백 제약 없음(DTO·엔티티 모두). DB 컬럼 길이 초과 시에만 DataIntegrityViolation 가능
      when  POST /api/checklist/items/custom body {"itemName":"   "} 또는 매우 긴 문자열
      then  공백: HTTP 201로 저장(검증 갭). 컬럼 길이 초과 시: HTTP 409 code="COMMON_409" (PATH B, DataIntegrityViolationException). 두 분기 모두 박제  [COMMON_409]
- [ ] **CHK-24** POST /items/custom 손상 JSON 바디 → COMMON_400_BODY_NOT_READABLE  (validation / 검증 (request shape))
      given @RequestBody CustomItemCreateRequest. 손상/빈 JSON
      when  POST /api/checklist/items/custom body '{"itemName":' (불완전)
      then  HTTP 400, code="COMMON_400_BODY_NOT_READABLE" (PATH B)  [COMMON_400_BODY_NOT_READABLE]
- [ ] **CHK-25** POST /items/custom 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given addCustomItem도 SecurityUtil 선행. 익명 컨텍스트
      when  POST /api/checklist/items/custom body {"itemName":"화장실 곰팡이"} (인증 없음)
      then  HTTP 401, code="AUTH_40101" (PATH A)  [AUTH_40101]
- [ ] **CHK-26** DELETE /items/custom/{id} 비숫자 path → COMMON_400_TYPE_MISMATCH  (validation / 검증 (request shape))
      given @PathVariable Long customItemId — 비숫자는 변환 실패
      when  DELETE /api/checklist/items/custom/abc (인증 통과)
      then  HTTP 400, code="COMMON_400_TYPE_MISMATCH", message "Invalid value for 'customItemId'." (PATH B)  [COMMON_400_TYPE_MISMATCH]
- [ ] **CHK-27** DELETE /items/custom/{id} 존재하지 않는 id → COMMON_500 (404 미적용 결함)  (not-found / 리소스 부재 (null·orElseThrow))
      given deleteCustomItem이 findById(id).orElseThrow(()->new IllegalArgumentException("항목을 찾을 수 없습니다")) — GeneralException(CHECKLI
      when  DELETE /api/checklist/items/custom/999999 (존재하지 않는 id, 인증 통과)
      then  HTTP 500, code="COMMON_500", message "Internal server error." (PATH B catch-all). 알려진 결함: 404 CHECKLIST_404_ITEM이 정의돼 있으  [COMMON_500]
- [ ] **CHK-28** DELETE /items/custom/{id} 타인 소유 항목 삭제 → CHECKLIST_400_FORBIDDEN (403 아닌 400)  (domain business-rule / 비즈니스 규칙)
      given customItemId가 존재하나 ownerUserId != 현재 userId. 서비스가 GeneralException(CUSTOM_ITEM_FORBIDDEN) throw
      when  DELETE /api/checklist/items/custom/{타인 항목 id} (인증 통과)
      then  HTTP 400(주의: 403 아님), code="CHECKLIST_400_FORBIDDEN", message "삭제 권한이 없습니다." (PATH A). 권한 위반을 400으로 매핑하는 현재 동작을 정확히 박제  [CHECKLIST_400_FORBIDDEN]
- [ ] **CHK-29** DELETE /items/custom/{id} 이미 소프트삭제된 항목 재삭제 → 멱등 200(결함 박제)  (not-found / 리소스 부재 (null·orElseThrow))
      given findById는 IsDeletedFalse 필터 없음 → 소프트삭제된 행도 반환. 소유자 일치 시 softDelete() 재호출
      when  DELETE /api/checklist/items/custom/{이미 삭제된 본인 항목 id} (인증 통과)
      then  HTTP 200(에러 없음). 소프트삭제 행을 NOT_FOUND로 거르지 않고 재삭제 허용 — Room/Map의 IsDeletedFalse 패턴과 불일치. 현재 동작 고정 + 일관성 갭 플래그  []
- [ ] **CHK-30** DELETE /items/custom/{id} 무토큰 → AUTH_40101  (auth / 인증 (token & session))
      given 유효 숫자 id + 익명 컨텍스트. SecurityUtil 선행
      when  DELETE /api/checklist/items/custom/10 (인증 없음)
      then  HTTP 401, code="AUTH_40101" (PATH A)  [AUTH_40101]
- [ ] **CHK-31** 전 엔드포인트 보호 라우트 무인증 → AUTH_401 (SecurityConfig entrypoint, advice 우회)  (auth / 인증 (token & session))
      given /api/checklist/** 는 permitAll 목록에 없어 .authenticated() 적용. 보안 필터 체인이 동작하는 통합/시큐리티 슬라이스 필요
      when  GET /api/checklist/items (Authorization 헤더 전혀 없음, 실제 SecurityFilterChain 통과)
      then  HTTP 401, 하드코딩 literal body {success:false, code:"AUTH_401", message:"Unauthorized"} (PATH C, GlobalExceptionHandler 우회)  [AUTH_401]
- [ ] **CHK-32** GUEST 토큰으로 보호 라우트 접근 → AUTH_401  (auth / 인증 (token & session))
      given GUEST 타입 토큰은 필터를 통과하나 authentication을 세팅하지 않음(anonymous-ish). /api/checklist/** 는 authenticated 요구
      when  GET /api/checklist/items (Authorization: Bearer <guest token>)
      then  HTTP 401, code="AUTH_401" (entrypoint, PATH C). GUEST가 체크리스트에 접근 불가함을 박제  [AUTH_401]
- [ ] **CHK-33** 서비스 예외 주입 시 catch-all → COMMON_500  (fallthrough / unmapped (catch-all 500))
      given ChecklistService가 예기치 못한 RuntimeException(예: DB 연결 실패) 발생하도록 mock
      when  GET /api/checklist/items (getCustomizedItems가 RuntimeException throw)
      then  HTTP 500, code="COMMON_500", message "Internal server error." (PATH B catch-all). 미매핑 예외의 싱크를 고정  [COMMON_500]