package com.room.backend.feature.roomlist;

import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.RoomSortType;
import com.room.backend.feature.roomlist.application.ListMyRooms;
import com.room.backend.feature.roomlist.application.ListMyRoomsQuery;
import com.room.backend.feature.roomlist.application.port.RoomCatalog;
import com.room.backend.feature.roomlist.application.port.RoomIssueLookup;
import com.room.backend.feature.roomlist.domain.IssueFlags;
import com.room.backend.feature.roomlist.domain.ListedRoom;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * legacy {@code RoomController.getRooms} + {@code RoomService.getRooms} 조립의 characterization.
 *
 * <p>정렬은 in-memory이고 null 처리와 안정성에 미묘한 규칙이 있다. 그 규칙을 그대로 고정한다.
 */
class ListMyRoomsTest {

    private final FakeRoomCatalog catalog = new FakeRoomCatalog();
    private final FakeIssueLookup issues = new FakeIssueLookup();
    private final ListMyRooms useCase = new ListMyRooms(catalog, issues);

    @Test
    void keepsRepositoryOrderWhenNoSortRequested() {
        catalog.rooms = List.of(room(1, 300L, 90, 30_000), room(2, 100L, 50, 10_000));

        assertEquals(List.of(1L, 2L), idsOf(null));
    }

    @Test
    void sortsByDepositAscending() {
        catalog.rooms = List.of(room(1, 300L, 0, 0), room(2, 100L, 0, 0), room(3, 200L, 0, 0));

        assertEquals(List.of(2L, 3L, 1L), idsOf(RoomSortType.DEPOSIT_ASC));
    }

    /** [계약 보존] legacy가 null을 타입 최대값으로 치환하므로 값 없는 방은 맨 뒤로 간다. */
    @Test
    void putsRoomsWithoutValueLast() {
        catalog.rooms = List.of(room(1, null, null, null), room(2, 100L, 50, 10_000));

        assertEquals(List.of(2L, 1L), idsOf(RoomSortType.DEPOSIT_ASC));
        assertEquals(List.of(2L, 1L), idsOf(RoomSortType.RENT_ASC));
        assertEquals(List.of(2L, 1L), idsOf(RoomSortType.MANAGEMENT_FEE_ASC));
    }

    /** [계약 보존] 안정 정렬이므로 동점은 조회 순서(생성 최신순)를 유지한다. */
    @Test
    void keepsRepositoryOrderForTies() {
        catalog.rooms = List.of(room(1, 100L, 0, 0), room(2, 100L, 0, 0), room(3, 100L, 0, 0));

        assertEquals(List.of(1L, 2L, 3L), idsOf(RoomSortType.DEPOSIT_ASC));
    }

    @Test
    void attachesIssuesPerRoomInResultOrder() {
        catalog.rooms = List.of(room(1, 300L, 0, 0), room(2, 100L, 0, 0));
        issues.byRoomId = Map.of(2L, new IssueFlags(true, false, false, false, false));

        List<ListMyRooms.ListedRoomWithIssues> result =
                useCase.handle(new ListMyRoomsQuery(7L, null, RoomSortType.DEPOSIT_ASC));

        assertEquals(2L, result.get(0).room().id());
        assertTrue(result.get(0).issues().mold());
        assertEquals(1L, result.get(1).room().id());
        assertEquals(IssueFlags.none(), result.get(1).issues());
        assertEquals(List.of(2L, 1L), issues.queried, "뱃지 조회는 결과 순서대로 방마다 한 번씩 일어난다");
    }

    @Test
    void passesRentTypeFilterToTheCatalog() {
        catalog.rooms = List.of();

        useCase.handle(new ListMyRoomsQuery(7L, RentType.JEONSE, null));

        assertEquals(7L, catalog.requestedOwnerId);
        assertEquals(RentType.JEONSE, catalog.requestedRentType);
    }

    // --- helpers -----------------------------------------------------------

    private List<Long> idsOf(RoomSortType sortType) {
        issues.queried.clear();
        return useCase.handle(new ListMyRoomsQuery(7L, null, sortType)).stream()
                .map(listed -> listed.room().id())
                .toList();
    }

    private static ListedRoom room(long id, Long deposit, Integer rent, Integer managementFee) {
        return new ListedRoom(id, "방" + id, "주소", RentType.MONTHLY, deposit, rent, managementFee,
                null, null, null, null, LocalDateTime.of(2026, 7, 31, 12, 0));
    }

    private static final class FakeRoomCatalog implements RoomCatalog {
        private List<ListedRoom> rooms = List.of();
        private long requestedOwnerId;
        private RentType requestedRentType;

        @Override
        public List<ListedRoom> findActiveRoomsOf(long ownerId, RentType rentType) {
            requestedOwnerId = ownerId;
            requestedRentType = rentType;
            return rooms;
        }
    }

    private static final class FakeIssueLookup implements RoomIssueLookup {
        private Map<Long, IssueFlags> byRoomId = Map.of();
        private final List<Long> queried = new ArrayList<>();

        @Override
        public IssueFlags summarize(long roomId) {
            queried.add(roomId);
            return byRoomId.getOrDefault(roomId, IssueFlags.none());
        }
    }
}
