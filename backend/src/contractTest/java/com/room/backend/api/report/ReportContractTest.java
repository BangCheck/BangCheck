package com.room.backend.api.report;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.repository.RoomRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Date;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 리포트(비교) 계약의 characterization.
 *
 * <p>이 컨트롤러는 다른 곳과 두 가지가 다르다. 둘 다 결함이며 그대로 고정한다.
 * <ul>
 *   <li>응답을 {@code ApiResponse} 봉투에 담지 않고 DTO를 그대로 돌려준다.</li>
 *   <li>{@code compare}는 인증 사용자 ID를 구해놓고 서비스에 넘기지 않는다 — 소유권 검증이 없다.</li>
 * </ul>
 */
@Testcontainers
@AutoConfigureMockMvc
@SpringBootTest(properties = {
        "spring.jpa.show-sql=false",
        "spring.main.banner-mode=off",
        "jwt.secret-key=" + ReportContractTest.SECRET,
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
class ReportContractTest {

    static final String SECRET = "atlas-contract-secret-key-at-least-thirty-two-bytes-long";
    private static final String INFO_PATH = "/api/v1/report/info";
    private static final String COMPARE_PATH = "/api/v1/report/compare";

    private static final long OWNER_ID = 6001L;
    private static final long OTHER_USER_ID = 6002L;

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

    @BeforeEach
    void setUp() {
        roomRepository.deleteAll();
    }

    // --- GET /report/info --------------------------------------------------

    @Test
    @DisplayName("RPT-01 [결함 BC-RPT-01] info 응답에 ApiResponse 봉투가 없다 — 현행 동작 고정")
    void infoReturnsBareDtoWithoutTheCommonEnvelope() throws Exception {
        fullRoom(OWNER_ID, "내 방");

        mockMvc.perform(get(INFO_PATH).header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                // 다른 엔드포인트라면 $.data.rooms 였을 자리다.
                .andExpect(jsonPath("$.success").doesNotHaveJsonPath())
                .andExpect(jsonPath("$.code").doesNotHaveJsonPath())
                .andExpect(jsonPath("$.rooms", hasSize(1)))
                .andExpect(jsonPath("$.rooms[0].name", is("내 방")))
                .andExpect(jsonPath("$.categories", hasSize(8)));
    }

    @Test
    @DisplayName("RPT-02 info 토큰 없음 → 401 AUTH_401")
    void infoRejectsMissingToken() throws Exception {
        mockMvc.perform(get(INFO_PATH))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("AUTH_401")));
    }

    @Test
    @DisplayName("RPT-03 info는 타인 방과 삭제된 방을 제외한다")
    void infoScopesToTheOwner() throws Exception {
        fullRoom(OWNER_ID, "내 방");
        fullRoom(OTHER_USER_ID, "타인 방");
        Room deleted = fullRoom(OWNER_ID, "삭제된 방");
        deleted.softDelete();
        roomRepository.save(deleted);

        mockMvc.perform(get(INFO_PATH).header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rooms", hasSize(1)))
                .andExpect(jsonPath("$.rooms[0].name", is("내 방")));
    }

    // --- POST /report/compare ----------------------------------------------

    @Test
    @DisplayName("RPT-04 compare 정상 → 200, 봉투 없이 compareData")
    void comparesRooms() throws Exception {
        Room first = fullRoom(OWNER_ID, "첫째 방");
        Room second = fullRoom(OWNER_ID, "둘째 방");

        mockMvc.perform(compare(OWNER_ID, """
                        {"roomIds":[%d,%d],"categories":["BASIC_INFO"]}
                        """.formatted(first.getId(), second.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").doesNotHaveJsonPath())
                .andExpect(jsonPath("$.compareData[0].category", is("BASIC_INFO")))
                .andExpect(jsonPath("$.compareData[0].categoryName", is("기본 정보")));
    }

    @Test
    @DisplayName("RPT-05 compare 토큰 없음 → 401 AUTH_401")
    void compareRejectsMissingToken() throws Exception {
        mockMvc.perform(post(COMPARE_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomIds\":[1],\"categories\":[\"BASIC_INFO\"]}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("AUTH_401")));
    }

    @Test
    @DisplayName("RPT-06 [결함 BC-RPT-02] 타인 방도 그대로 비교된다 — IDOR 재현")
    void compareLeaksAnotherOwnersRoom() throws Exception {
        Room victimRoom = fullRoom(OTHER_USER_ID, "피해자 방");

        // 컨트롤러가 userId를 구해놓고 서비스에 넘기지 않는다. 소유권 검증이 없다.
        mockMvc.perform(compare(OWNER_ID, """
                        {"roomIds":[%d],"categories":["BASIC_INFO"]}
                        """.formatted(victimRoom.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compareData[0].items[0].itemName", is("매물명")))
                .andExpect(jsonPath("$.compareData[0].items[0].rooms.%d.valueText"
                        .formatted(victimRoom.getId()), is("피해자 방")));
    }

    @Test
    @DisplayName("RPT-07 [결함 BC-RPT-03] 선택 입력이 비어 있는 방을 비교하면 500이 난다")
    void compareFailsWithFiveHundredWhenOptionalFieldsAreNull() throws Exception {
        // 최소 payload로 만들 수 있는 방이다. 등록 API가 실제로 허용하는 조합이다.
        Room minimal = roomRepository.save(Room.create(
                OWNER_ID, "최소 방", "서울시 마포구", null, null,
                null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null));

        // buildBasicInfoItems가 room.getRentType().name()을 null 가드 없이 호출한다.
        mockMvc.perform(compare(OWNER_ID, """
                        {"roomIds":[%d],"categories":["BASIC_INFO"]}
                        """.formatted(minimal.getId())))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code", is("COMMON_500")))
                .andExpect(jsonPath("$.message", is("Internal server error.")));
    }

    @Test
    @DisplayName("RPT-08 [결함 BC-RPT-04] 알 수 없는 카테고리 이름 → 500")
    void compareFailsWithFiveHundredForUnknownCategory() throws Exception {
        Room room = fullRoom(OWNER_ID, "방");

        // ChecklistCategory.valueOf가 IllegalArgumentException을 던지고 포괄 핸들러가 500으로 만든다.
        mockMvc.perform(compare(OWNER_ID, """
                        {"roomIds":[%d],"categories":["NOT_A_CATEGORY"]}
                        """.formatted(room.getId())))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code", is("COMMON_500")));
    }

    @Test
    @DisplayName("RPT-09 미존재 방 ID는 오류가 아니라 빈 값으로 채워진다")
    void compareTreatsMissingRoomAsEmptyValue() throws Exception {
        Room room = fullRoom(OWNER_ID, "실재 방");

        mockMvc.perform(compare(OWNER_ID, """
                        {"roomIds":[%d,99999999],"categories":["BASIC_INFO"]}
                        """.formatted(room.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.compareData[0].items[0].rooms.99999999.valueText").value((Object) null));
    }

    // --- helpers -----------------------------------------------------------

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder compare(
            long userId, String body) {
        return post(COMPARE_PATH)
                .header("Authorization", "Bearer " + accessToken(userId))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body);
    }

    /** compare가 NPE 없이 통과하려면 선택 입력이 전부 채워져 있어야 한다. 그 자체가 BC-RPT-03의 증상이다. */
    private Room fullRoom(long ownerId, String name) {
        return roomRepository.save(Room.create(
                ownerId, name, "서울시 마포구", null, null,
                RentType.MONTHLY, 10_000_000L, 55, Boolean.FALSE, 70_000,
                Boolean.FALSE, null, Boolean.TRUE,
                LocalDate.of(2026, 9, 1), Boolean.FALSE,
                BuildingType.VILLA, 3, Boolean.TRUE, Boolean.FALSE,
                null, Direction.SOUTH, "메모"));
    }

    private static String accessToken(long userId) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("userId", userId)
                .claim("role", "USER")
                .setIssuedAt(new Date(System.currentTimeMillis() - 1000))
                .setExpiration(new Date(System.currentTimeMillis() + 600_000))
                .signWith(signingKey())
                .compact();
    }

    private static SecretKey signingKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }
}
