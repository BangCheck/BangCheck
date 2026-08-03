package com.room.backend.api.room;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomlist.domain.IssueTopic;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 방 목록 조회 계약의 characterization.
 *
 * <p>실제 {@code SecurityFilterChain}과 MySQL에서 소유자 격리, 필터, 정렬, 문제 뱃지를 고정한다.
 */
@Testcontainers
@AutoConfigureMockMvc
@SpringBootTest(properties = {
        "spring.jpa.show-sql=false",
        "spring.main.banner-mode=off",
        "jwt.secret-key=" + RoomListContractTest.SECRET,
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
class RoomListContractTest {

    static final String SECRET = "atlas-contract-secret-key-at-least-thirty-two-bytes-long";
    private static final String LIST_PATH = "/api/v1/rooms";

    private static final long OWNER_ID = 5001L;
    private static final long OTHER_USER_ID = 5002L;

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

    @BeforeEach
    void setUp() {
        roomCheckSelectedOptionRepository.deleteAll();
        roomCheckResultRepository.deleteAll();
        roomRepository.deleteAll();
    }

    @Test
    @DisplayName("RLST-01 인증된 조회 → 200 + 생성 최신순")
    void listsOwnRoomsNewestFirst() throws Exception {
        saveRoom(OWNER_ID, "먼저 만든 방", RentType.MONTHLY, null, 50, 30_000);
        saveRoom(OWNER_ID, "나중 만든 방", RentType.MONTHLY, null, 40, 20_000);

        mockMvc.perform(get(LIST_PATH).header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", is("OK")))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].name", is("나중 만든 방")))
                .andExpect(jsonPath("$.data[1].name", is("먼저 만든 방")))
                .andExpect(jsonPath("$.data[0].issues.mold", is(false)));
    }

    @Test
    @DisplayName("RLST-02 토큰 없음 → 401 AUTH_401")
    void rejectsMissingToken() throws Exception {
        mockMvc.perform(get(LIST_PATH))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("AUTH_401")));
    }

    @Test
    @DisplayName("RLST-03 타인 방과 삭제된 방은 보이지 않는다")
    void hidesOtherOwnersAndDeletedRooms() throws Exception {
        saveRoom(OWNER_ID, "내 방", RentType.MONTHLY, null, 50, 10_000);
        saveRoom(OTHER_USER_ID, "타인 방", RentType.MONTHLY, null, 50, 10_000);

        Room deleted = saveRoom(OWNER_ID, "삭제된 방", RentType.MONTHLY, null, 50, 10_000);
        deleted.softDelete();
        roomRepository.save(deleted);

        mockMvc.perform(get(LIST_PATH).header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("내 방")));
    }

    @Test
    @DisplayName("RLST-04 rentType 필터")
    void filtersByRentType() throws Exception {
        saveRoom(OWNER_ID, "월세방", RentType.MONTHLY, null, 50, 10_000);
        saveRoom(OWNER_ID, "전세방", RentType.JEONSE, 200_000_000L, null, 10_000);

        mockMvc.perform(get(LIST_PATH).param("rentType", "JEONSE")
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("전세방")));
    }

    @Test
    @DisplayName("RLST-05 보증금 오름차순 — 값 없는 방은 맨 뒤")
    void sortsByDepositWithNullsLast() throws Exception {
        saveRoom(OWNER_ID, "보증금없음", RentType.MONTHLY, null, 50, 10_000);
        saveRoom(OWNER_ID, "보증금높음", RentType.JEONSE, 300_000_000L, null, 10_000);
        saveRoom(OWNER_ID, "보증금낮음", RentType.JEONSE, 100_000_000L, null, 10_000);

        mockMvc.perform(get(LIST_PATH).param("sort", "DEPOSIT_ASC")
                        .header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name", is("보증금낮음")))
                .andExpect(jsonPath("$.data[1].name", is("보증금높음")))
                .andExpect(jsonPath("$.data[2].name", is("보증금없음")));
    }

    @Test
    @DisplayName("RLST-06 [결함 BC-LIST-01] 뱃지는 항목 이름 문자열로만 연결된다")
    void raisesIssueBadgeOnlyWhenSeedItemNameMatches() throws Exception {
        ChecklistItem moldItem = checklistItemRepository.findAll().stream()
                .filter(item -> item.getCategory() == ChecklistCategory.PROBLEM)
                .filter(item -> IssueTopic.MOLD.seedItemName().equals(item.getItemName()))
                .findFirst()
                .orElse(null);
        Assumptions.assumeTrue(moldItem != null,
                "시드에 PROBLEM 카테고리의 '" + IssueTopic.MOLD.seedItemName() + "' 항목이 없다");

        List<ChecklistOption> options = checklistOptionRepository.findByChecklistItemId(moldItem.getId());
        ChecklistOption issueOption = options.stream()
                .filter(option -> !IssueTopic.NO_ISSUE_OPTION_VALUE.equals(option.getOptionValue()))
                .findFirst()
                .orElse(null);
        Assumptions.assumeTrue(issueOption != null, "'없음'이 아닌 선택지가 있어야 한다");

        Room room = saveRoom(OWNER_ID, "곰팡이방", RentType.MONTHLY, null, 50, 10_000);
        RoomCheckResult result = roomCheckResultRepository.save(
                RoomCheckResult.create(room.getId(), moldItem.getId(), null, null));
        roomCheckSelectedOptionRepository.save(
                RoomCheckSelectedOption.create(result.getId(), issueOption.getId()));

        mockMvc.perform(get(LIST_PATH).header("Authorization", "Bearer " + accessToken(OWNER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].issues.mold", is(true)))
                .andExpect(jsonPath("$.data[0].issues.leak", is(false)));
    }

    // --- helpers -----------------------------------------------------------

    private Room saveRoom(long ownerId, String name, RentType rentType,
                          Long deposit, Integer rent, Integer managementFee) {
        return roomRepository.save(Room.create(ownerId, name, "서울시 마포구", null, null,
                rentType, deposit, rent, null, managementFee,
                null, null, null, null, null, null, null, null, null, null, null, null));
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
