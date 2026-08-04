package com.room.backend.api.room;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.global.geocoding.service.GeocodingService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 실제 Front가 호출하는 방+체크리스트 등록 계약의 characterization.
 *
 * <p>실제 {@code SecurityFilterChain}과 실제 MySQL 8.0 트랜잭션에서 실행한다. 목적은
 * "옳은가"가 아니라 <b>"구조를 바꾸기 전과 같은가"</b>이며, 현재 결함으로 보이는 동작도 그대로 고정한다.
 *
 * <p>외부 호출은 geocoding 하나뿐이며 stub으로 격리한다. network fallback을 성공으로 간주하지 않는다.
 */
@Testcontainers
@AutoConfigureMockMvc
@SpringBootTest(properties = {
        "spring.jpa.show-sql=false",
        "spring.main.banner-mode=off",
        "jwt.secret-key=" + RoomCreateWithChecklistContractTest.SECRET,
        "jwt.access-token-expiration=3600000",
        "jwt.refresh-token-expiration=1209600000",
        "oauth.naver.client-id=contract", "oauth.naver.client-secret=contract",
        "oauth.naver.redirect-uri=http://localhost/contract/naver",
        "oauth.google.client-id=contract", "oauth.google.client-secret=contract",
        "oauth.google.redirect-uri=http://localhost/contract/google",
        "naver.geocoding.client-id=contract", "naver.geocoding.client-secret=contract",
        "tmap.api.app-key=contract",
        "juso.api.confirm-key=contract"
})
class RoomCreateWithChecklistContractTest {

    static final String SECRET = "atlas-contract-secret-key-at-least-thirty-two-bytes-long";
    private static final String CREATE_PATH = "/api/v1/rooms/check-results";

    private static final long OWNER_ID = 4001L;
    private static final long OTHER_USER_ID = 4002L;

    @Container
    static final MySQLContainer MYSQL = new MySQLContainer("mysql:8.0")
            .withDatabaseName("room")
            .withUsername("room")
            .withPassword("room")
            .withReuse(false);

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired MockMvc mockMvc;
    @Autowired RoomRepository roomRepository;
    @Autowired RoomCheckResultRepository roomCheckResultRepository;
    @Autowired RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository;
    @Autowired ChecklistItemRepository checklistItemRepository;
    @Autowired ChecklistOptionRepository checklistOptionRepository;

    /** 외부 provider를 실제로 호출하지 않는다. legacy와 동일하게 좌표는 그대로 저장된다. */
    @MockBean GeocodingService geocodingService;

    private long itemId;
    private long optionId;
    private long foreignOptionId;

    @BeforeEach
    void setUp() {
        given(geocodingService.getCoordinates(org.mockito.ArgumentMatchers.anyString()))
                .willReturn(new BigDecimal[]{new BigDecimal("37.5551000"), new BigDecimal("126.9368000")});

        List<ChecklistItem> items = checklistItemRepository.findAll();
        assertFalse(items.isEmpty(), "Flyway 시드에 체크리스트 항목이 있어야 한다");

        // 선택지를 가진 항목을 고른다. 시드가 바뀌어 하나도 없으면 조용히 넘어가지 않고 실패시킨다.
        itemId = -1L;
        for (ChecklistItem item : items) {
            List<ChecklistOption> options = checklistOptionRepository.findByChecklistItemId(item.getId());
            if (!options.isEmpty()) {
                itemId = item.getId();
                optionId = options.get(0).getId();
                break;
            }
        }
        assertNotEquals(-1L, itemId, "Flyway 시드에 선택지를 가진 항목이 있어야 한다");

        // 관계 미검증(BC-REG-02)을 재현하려면 다른 항목에 속한 선택지가 필요하다.
        foreignOptionId = -1L;
        for (ChecklistOption option : checklistOptionRepository.findAll()) {
            if (!option.getChecklistItemId().equals(itemId)) {
                foreignOptionId = option.getId();
                break;
            }
        }
        assertNotEquals(-1L, foreignOptionId, "다른 항목에 속한 선택지가 있어야 한다");

        roomCheckSelectedOptionRepository.deleteAll();
        roomCheckResultRepository.deleteAll();
        roomRepository.deleteAll();
    }

    // --- RCWC-01 성공 ------------------------------------------------------

    @Test
    @DisplayName("RCWC-01 인증된 유효 payload → 200 + room·answer 커밋")
    void createsRoomAndAnswersInOneTransaction() throws Exception {
        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadWithOption("살구빌라 302호", itemId, optionId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.code", is("OK")))
                .andExpect(jsonPath("$.data.name", is("살구빌라 302호")))
                .andExpect(jsonPath("$.data.lat", is(37.5551000)));

        assertEquals(1, roomRepository.findAll().size());
        assertEquals(1, roomCheckResultRepository.findAll().size());
        assertEquals(1, roomCheckSelectedOptionRepository.findAll().size());
    }

    // --- RCWC-02~04 PATH C 인증 --------------------------------------------

    @Test
    @DisplayName("RCWC-02 토큰 없음 → 401 AUTH_401, data 필드 자체가 없음, write 0")
    void rejectsMissingToken() throws Exception {
        mockMvc.perform(post(CREATE_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("무토큰", RentType.MONTHLY, itemId)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.code", is("AUTH_401")))
                .andExpect(jsonPath("$.message", is("Unauthorized")))
                // entrypoint는 문자열을 직접 쓰므로 data 키가 아예 없다. filter·advice 응답과 형태가 다르다.
                .andExpect(jsonPath("$.data").doesNotHaveJsonPath());

        assertNoWrites();
    }

    @Test
    @DisplayName("RCWC-03 만료 토큰 → 401 AUTH_40102, data:null, write 0")
    void rejectsExpiredToken() throws Exception {
        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + expiredToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("만료", RentType.MONTHLY, itemId)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("AUTH_40102")))
                .andExpect(jsonPath("$.message", is("Access token has expired. Please re-login.")))
                .andExpect(jsonPath("$.data").value(nullValue()));

        assertNoWrites();
    }

    @Test
    @DisplayName("RCWC-04 위변조 토큰 → 401 AUTH_40103, write 0")
    void rejectsTamperedToken() throws Exception {
        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + tamperedToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("위변조", RentType.MONTHLY, itemId)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("AUTH_40103")))
                .andExpect(jsonPath("$.message", is("Invalid access token.")));

        assertNoWrites();
    }

    // --- RCWC-05·07 검증 ---------------------------------------------------

    @Test
    @DisplayName("RCWC-05 이름 공백 → 400 COMMON_400_VALIDATION, write 0")
    void rejectsBlankName() throws Exception {
        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("", RentType.MONTHLY, itemId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("COMMON_400_VALIDATION")))
                .andExpect(jsonPath("$.message", is("[name] 방 이름은 필수입니다.")))
                .andExpect(jsonPath("$.data").value(nullValue()));

        assertNoWrites();
    }

    @Test
    @DisplayName("RCWC-07 전세인데 보증금 없음 → 400 ROOM_400_JEONSE_DEPOSIT, write 0")
    void rejectsJeonseWithoutDeposit() throws Exception {
        String body = """
                {"name":"전세방","address":"서울시 마포구","rentType":"JEONSE","checkAnswers":[]}
                """;

        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("ROOM_400_JEONSE_DEPOSIT")))
                .andExpect(jsonPath("$.message", is("전세는 보증금이 필수입니다.")));

        assertNoWrites();
    }

    // --- RCWC-10 상한 ------------------------------------------------------

    @Test
    @DisplayName("RCWC-10 활성 방 6개 → 400 ROOM_400_LIMIT, 7번째 저장 안 됨")
    void rejectsSeventhRoom() throws Exception {
        for (int index = 0; index < 6; index++) {
            roomRepository.save(Room.create(OWNER_ID, "기존방" + index, "서울시 마포구",
                    null, null, RentType.MONTHLY, null, 50, null, null,
                    null, null, null, null, null, null, null, null, null, null, null, null));
        }

        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("일곱번째", RentType.MONTHLY, itemId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code", is("ROOM_400_LIMIT")))
                .andExpect(jsonPath("$.message", is("방은 최대 6개까지 등록할 수 있습니다.")));

        assertEquals(6, roomRepository.findAll().size());
    }

    // --- RCWC-12 DB 제약 ---------------------------------------------------

    @Test
    @DisplayName("RCWC-12 미존재 item ID → 409 COMMON_409, 방까지 전부 롤백")
    void rollsBackEverythingWhenItemDoesNotExist() throws Exception {
        mockMvc.perform(post(CREATE_PATH)
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload("FK위반", RentType.MONTHLY, 99_999_999L)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code", is("COMMON_409")))
                .andExpect(jsonPath("$.message", is("Data integrity violation.")))
                .andExpect(jsonPath("$.data").value(nullValue()));

        // 방 저장이 먼저 일어났지만 같은 트랜잭션이므로 함께 사라져야 한다.
        assertNoWrites();
    }

    // --- RCWC-18 고아 operation 보안 drift ---------------------------------

    @Test
    @DisplayName("RCWC-18 [결함 BC-SEC-01] 타인 방에 답변이 저장된다 — 현행 동작 고정")
    void orphanOperationWritesIntoAnotherUsersRoom() throws Exception {
        Room victimRoom = roomRepository.save(Room.create(OTHER_USER_ID, "피해자 방", "서울시 강남구",
                null, null, RentType.MONTHLY, null, 50, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null));

        String answers = """
                [{"itemId":%d,"valueText":"침입","selectedOptionIds":[]}]
                """.formatted(itemId);

        // 공격자는 자기 토큰만 있으면 된다. 소유권 검증이 없다.
        mockMvc.perform(post("/api/v1/rooms/" + victimRoom.getId() + "/check-results")
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(answers))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("OK")));

        assertEquals(1, roomCheckResultRepository.findByRoomId(victimRoom.getId()).size(),
                "현행 결함: 타인 방에 답변 row가 실제로 생성된다");
    }

    // --- RCWC-06·08·09 나머지 검증 ------------------------------------------

    @Test
    @DisplayName("RCWC-06 주소 공백 → 400 COMMON_400_VALIDATION, write 0")
    void rejectsBlankAddress() throws Exception {
        expectFailure("""
                {"name":"주소없음","address":"","rentType":"MONTHLY","rent":50,"checkAnswers":[]}
                """, 400, "COMMON_400_VALIDATION", "[address] 주소는 필수입니다.");
    }

    @Test
    @DisplayName("RCWC-08 월세인데 금액 없음 → 400 ROOM_400_MONTHLY_RENT, write 0")
    void rejectsMonthlyWithoutRent() throws Exception {
        expectFailure("""
                {"name":"월세방","address":"서울시 마포구","rentType":"MONTHLY","checkAnswers":[]}
                """, 400, "ROOM_400_MONTHLY_RENT", "월세는 월세 금액이 필수입니다.");
    }

    @Test
    @DisplayName("RCWC-09 융자 있음인데 금액 없음 → 400 ROOM_400_LOAN_AMOUNT, write 0")
    void rejectsDeclaredLoanWithoutAmount() throws Exception {
        expectFailure("""
                {"name":"융자방","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                 "hasLoan":true,"checkAnswers":[]}
                """, 400, "ROOM_400_LOAN_AMOUNT", "융자가 있는 경우 금액은 필수입니다.");
    }

    // --- RCWC-11·13·15 DB 제약이 거절하는 경우 ------------------------------

    @Test
    @DisplayName("RCWC-11 itemId가 null → 409, 방까지 전부 롤백")
    void rollsBackWhenItemIdIsNull() throws Exception {
        expectFailure("""
                {"name":"널아이템","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                 "checkAnswers":[{"itemId":null,"valueText":"보통","selectedOptionIds":[]}]}
                """, 409, "COMMON_409", "Data integrity violation.");
    }

    @Test
    @DisplayName("RCWC-13 미존재 optionId → 409, 방까지 전부 롤백")
    void rollsBackWhenOptionDoesNotExist() throws Exception {
        expectFailure("""
                {"name":"널옵션","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                 "checkAnswers":[{"itemId":%d,"valueText":"보통","selectedOptionIds":[99999999]}]}
                """.formatted(itemId), 409, "COMMON_409", "Data integrity violation.");
    }

    @Test
    @DisplayName("RCWC-15 같은 item에 답변 2개 → 409 unique 위반, 전부 롤백")
    void rollsBackOnDuplicateItemAnswers() throws Exception {
        expectFailure("""
                {"name":"중복항목","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                 "checkAnswers":[{"itemId":%d,"valueText":"첫번째","selectedOptionIds":[]},
                                 {"itemId":%d,"valueText":"두번째","selectedOptionIds":[]}]}
                """.formatted(itemId, itemId), 409, "COMMON_409",
                "Duplicate value violates unique constraint.");
    }

    // --- RCWC-14·16 현행 gap — 막히지 않고 저장된다 --------------------------

    @Test
    @DisplayName("RCWC-14 [결함 BC-REG-02] 다른 항목의 선택지도 저장된다 — 현행 동작 고정")
    void storesOptionBelongingToAnotherItem() throws Exception {
        mockMvc.perform(authorizedCreate("""
                        {"name":"관계미검증","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                         "checkAnswers":[{"itemId":%d,"valueText":"보통","selectedOptionIds":[%d]}]}
                        """.formatted(itemId, foreignOptionId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("OK")));

        assertEquals(1, roomCheckSelectedOptionRepository.findAll().size(),
                "현행 결함: item에 속하지 않는 option도 그대로 저장된다");
    }

    @Test
    @DisplayName("RCWC-16 [결함 BC-REG-03] 동일 선택지를 두 번 넣으면 행이 2개 생긴다 — 현행 동작 고정")
    void storesDuplicateOptionTwice() throws Exception {
        mockMvc.perform(authorizedCreate("""
                        {"name":"중복옵션","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                         "checkAnswers":[{"itemId":%d,"valueText":"보통","selectedOptionIds":[%d,%d]}]}
                        """.formatted(itemId, optionId, optionId)))
                .andExpect(status().isOk());

        assertEquals(2, roomCheckSelectedOptionRepository.findAll().size(),
                "현행 결함: unique 제약이 없어 같은 option row가 2개 생긴다");
    }

    // --- helpers -----------------------------------------------------------

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder authorizedCreate(String body) {
        return post(CREATE_PATH)
                .header("Authorization", "Bearer " + accessToken(OWNER_ID))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body);
    }

    /** 실패 응답의 status·code·message를 고정하고 세 테이블이 모두 비어 있음을 확인한다. */
    private void expectFailure(String body, int status, String code, String message) throws Exception {
        mockMvc.perform(authorizedCreate(body))
                .andExpect(status().is(status))
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.code", is(code)))
                .andExpect(jsonPath("$.message", is(message)))
                .andExpect(jsonPath("$.data").value(nullValue()));

        assertNoWrites();
    }


    private void assertNoWrites() {
        assertEquals(0, roomRepository.findAll().size(), "room이 저장되면 안 된다");
        assertEquals(0, roomCheckResultRepository.findAll().size(), "answer가 저장되면 안 된다");
        assertEquals(0, roomCheckSelectedOptionRepository.findAll().size(), "option이 저장되면 안 된다");
    }

    private static String payloadWithOption(String name, long checklistItemId, long checklistOptionId) {
        return """
                {"name":"%s","address":"서울시 마포구","rentType":"MONTHLY","rent":50,
                 "checkAnswers":[{"itemId":%d,"valueText":"보통","selectedOptionIds":[%d]}]}
                """.formatted(name, checklistItemId, checklistOptionId);
    }

    private static String payload(String name, RentType rentType, long checklistItemId) {
        return """
                {"name":"%s","address":"서울시 마포구","rentType":"%s","rent":50,
                 "checkAnswers":[{"itemId":%d,"valueText":"보통","selectedOptionIds":[]}]}
                """.formatted(name, rentType.name(), checklistItemId);
    }

    private static String accessToken(long userId) {
        return token(userId, new Date(System.currentTimeMillis() + 600_000), signingKey(SECRET));
    }

    private static String expiredToken(long userId) {
        return token(userId, new Date(System.currentTimeMillis() - 60_000), signingKey(SECRET));
    }

    private static String tamperedToken(long userId) {
        return token(userId, new Date(System.currentTimeMillis() + 600_000),
                signingKey("a-totally-different-signing-key-of-sufficient-length"));
    }

    private static String token(long userId, Date expiry, SecretKey key) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("userId", userId)
                .claim("role", "USER")
                .setIssuedAt(new Date(System.currentTimeMillis() - 1000))
                .setExpiration(expiry)
                .signWith(key)
                .compact();
    }

    private static SecretKey signingKey(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
