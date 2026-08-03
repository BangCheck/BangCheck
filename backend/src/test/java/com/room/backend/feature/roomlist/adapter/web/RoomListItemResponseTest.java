package com.room.backend.feature.roomlist.adapter.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.room.backend.api.room.dto.response.RoomIssuesSummaryDTO;
import com.room.backend.api.room.dto.response.RoomListResponseDTO;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.feature.roomlist.application.ListMyRooms.ListedRoomWithIssues;
import com.room.backend.feature.roomlist.domain.IssueFlags;
import com.room.backend.feature.roomlist.domain.ListedRoom;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * 목록 응답 JSON 동등성 characterization.
 *
 * <p>같은 값으로 만든 legacy {@link RoomListResponseDTO}와 신규 {@link RoomListItemResponse}를
 * 같은 {@link ObjectMapper}로 직렬화해 문자열을 비교한다. 중첩된 {@code issues}까지 포함한다.
 */
class RoomListItemResponseTest {

    private static final LocalDateTime CREATED_AT = LocalDateTime.of(2026, 7, 31, 12, 34, 56);
    private static final long ROOM_ID = 88L;

    private final ObjectMapper objectMapper = JsonMapper.builder()
            .addModule(new JavaTimeModule())
            .build();

    @Test
    void serializesIdenticallyWhenFullyPopulated() throws Exception {
        IssueFlags flags = new IssueFlags(true, false, true, false, true);

        assertEquals(
                objectMapper.writeValueAsString(new RoomListResponseDTO(
                        legacyRoom(true), new RoomIssuesSummaryDTO(true, false, true, false, true))),
                objectMapper.writeValueAsString(RoomListItemResponse.from(
                        new ListedRoomWithIssues(listedRoom(true), flags))));
    }

    @Test
    void serializesIdenticallyWhenOptionalFieldsAreNull() throws Exception {
        assertEquals(
                objectMapper.writeValueAsString(new RoomListResponseDTO(
                        legacyRoom(false), new RoomIssuesSummaryDTO(false, false, false, false, false))),
                objectMapper.writeValueAsString(RoomListItemResponse.from(
                        new ListedRoomWithIssues(listedRoom(false), IssueFlags.none()))));
    }

    private static ListedRoom listedRoom(boolean populated) {
        return new ListedRoom(
                ROOM_ID, "살구빌라 302호", "서울시 마포구 어딘가",
                populated ? RentType.MONTHLY : null,
                populated ? Long.valueOf(10_000_000L) : null,
                populated ? Integer.valueOf(55) : null,
                populated ? Integer.valueOf(70_000) : null,
                populated ? Integer.valueOf(3) : null,
                populated ? Direction.SOUTH : null,
                populated ? "남향" : null,
                populated ? BuildingType.VILLA : null,
                CREATED_AT);
    }

    private static Room legacyRoom(boolean populated) throws Exception {
        Room room = Room.create(
                42L, "살구빌라 302호", "서울시 마포구 어딘가", null, null,
                populated ? RentType.MONTHLY : null,
                populated ? Long.valueOf(10_000_000L) : null,
                populated ? Integer.valueOf(55) : null,
                null,
                populated ? Integer.valueOf(70_000) : null,
                null, null, null, null, null,
                populated ? BuildingType.VILLA : null,
                populated ? Integer.valueOf(3) : null,
                null, null, null,
                populated ? Direction.SOUTH : null,
                populated ? "남향" : null);

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
