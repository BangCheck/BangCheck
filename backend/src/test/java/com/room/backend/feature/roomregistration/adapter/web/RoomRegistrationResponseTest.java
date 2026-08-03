package com.room.backend.feature.roomregistration.adapter.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.room.backend.api.room.dto.response.RoomCreateResponseDTO;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import com.room.backend.feature.roomregistration.application.RegisteredRoom;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * 응답 JSON 동등성 characterization.
 *
 * <p>구조를 바꿔도 사용자가 받는 본문은 한 글자도 달라지면 안 된다. 이 test는 같은 값으로 만든
 * legacy {@link RoomCreateResponseDTO}와 신규 {@link RoomRegistrationResponse}를 같은
 * {@link ObjectMapper}로 직렬화해 문자열을 직접 비교한다. 필드 이름·선언 순서·null 표현이
 * 하나라도 어긋나면 여기서 깨진다.
 *
 * <p>DB나 Spring context 없이 돈다. {@code Room.create}가 순수 정적 팩토리이기 때문이다.
 */
class RoomRegistrationResponseTest {

    private static final LocalDateTime CREATED_AT = LocalDateTime.of(2026, 7, 31, 12, 34, 56);
    private static final long ROOM_ID = 77L;

    private final ObjectMapper objectMapper = JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .build();

    @Test
    void serializesIdenticallyToTheLegacyResponseWhenFullyPopulated() throws Exception {
        Room room = legacyRoom(
                RentType.MONTHLY, null, 55, Boolean.FALSE, 70_000,
                Boolean.TRUE, 12_000_000L, "남향 채광 좋음");

        RegisteredRoom registered = new RegisteredRoom(
                ROOM_ID, "테스트 방", "서울시 마포구 어딘가",
                new BigDecimal("37.5551000"), new BigDecimal("126.9368000"),
                RentType.MONTHLY, null, 55, 70_000, Boolean.FALSE,
                Boolean.TRUE, 12_000_000L, Boolean.TRUE,
                LocalDate.of(2026, 9, 1), Boolean.FALSE,
                BuildingType.VILLA, 3, Boolean.TRUE, Boolean.FALSE,
                SpecialFloor.ROOFTOP, Direction.SOUTH, "남향 채광 좋음", CREATED_AT);

        assertEquals(
                objectMapper.writeValueAsString(new RoomCreateResponseDTO(room)),
                objectMapper.writeValueAsString(RoomRegistrationResponse.from(registered)));
    }

    @Test
    void serializesIdenticallyWhenOptionalFieldsAreNull() throws Exception {
        Room room = legacyRoom(null, null, null, null, null, null, null, null);

        RegisteredRoom registered = new RegisteredRoom(
                ROOM_ID, "테스트 방", "서울시 마포구 어딘가", null, null,
                null, null, null, null, Boolean.FALSE,
                null, null, null, null, null,
                null, null, null, null, null, null, null, CREATED_AT);

        assertEquals(
                objectMapper.writeValueAsString(new RoomCreateResponseDTO(room)),
                objectMapper.writeValueAsString(RoomRegistrationResponse.from(registered)));
    }

    @Test
    void serializesIdenticallyForJeonseWhereMonthlyRentIsDiscarded() throws Exception {
        Room room = legacyRoom(
                RentType.JEONSE, 300_000_000L, 99, Boolean.TRUE, 50_000,
                Boolean.FALSE, 9_000L, null);

        // 전세는 월세를 버리고, 관리비 모름은 금액을 버리고, 융자 없음은 금액을 버린다.
        RegisteredRoom registered = new RegisteredRoom(
                ROOM_ID, "테스트 방", "서울시 마포구 어딘가",
                new BigDecimal("37.5551000"), new BigDecimal("126.9368000"),
                RentType.JEONSE, 300_000_000L, null, null, Boolean.TRUE,
                Boolean.FALSE, null, Boolean.TRUE,
                LocalDate.of(2026, 9, 1), Boolean.FALSE,
                BuildingType.VILLA, 3, Boolean.TRUE, Boolean.FALSE,
                SpecialFloor.ROOFTOP, Direction.SOUTH, null, CREATED_AT);

        assertEquals(
                objectMapper.writeValueAsString(new RoomCreateResponseDTO(room)),
                objectMapper.writeValueAsString(RoomRegistrationResponse.from(registered)));
    }

    /** legacy 경로가 실제로 만들어내는 entity. 좌표·부가 정보는 상수로 고정한다. */
    private Room legacyRoom(
            RentType rentType, Long deposit, Integer rent,
            Boolean managementFeeUnknown, Integer managementFee,
            Boolean hasLoan, Long loanAmount, String memo) throws Exception {

        boolean populated = rentType != null;
        Room room = Room.create(
                42L, "테스트 방", "서울시 마포구 어딘가",
                populated ? new BigDecimal("37.5551000") : null,
                populated ? new BigDecimal("126.9368000") : null,
                rentType, deposit, rent,
                managementFeeUnknown, managementFee,
                hasLoan, loanAmount,
                populated ? Boolean.TRUE : null,
                populated ? LocalDate.of(2026, 9, 1) : null,
                populated ? Boolean.FALSE : null,
                populated ? BuildingType.VILLA : null,
                populated ? Integer.valueOf(3) : null,
                populated ? Boolean.TRUE : null,
                populated ? Boolean.FALSE : null,
                populated ? SpecialFloor.ROOFTOP : null,
                populated ? Direction.SOUTH : null,
                memo);

        // id와 createdAt은 JPA가 채우는 값이라 test에서 직접 심는다.
        set(room, Room.class, "id", ROOM_ID);
        set(room, room.getClass().getSuperclass(), "createdAt", CREATED_AT);
        return room;
    }

    private static void set(Object target, Class<?> owner, String fieldName, Object value) throws Exception {
        Field field = owner.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
