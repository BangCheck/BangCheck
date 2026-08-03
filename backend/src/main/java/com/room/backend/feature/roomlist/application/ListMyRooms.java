package com.room.backend.feature.roomlist.application;

import com.room.backend.feature.roomlist.application.port.RoomCatalog;
import com.room.backend.feature.roomlist.application.port.RoomIssueLookup;
import com.room.backend.feature.roomlist.domain.IssueFlags;
import com.room.backend.feature.roomlist.domain.ListedRoom;
import com.room.backend.feature.roomlist.domain.RoomOrdering;

import java.util.ArrayList;
import java.util.List;

/**
 * 이관: {@code RoomService.getRooms}와 {@code RoomController.getRooms}의 조립 → 이 use case.
 *
 * 내 방 목록을 문제 뱃지와 함께 조회한다.
 *
 * <p>legacy {@code RoomController.getRooms}가 하던 조립을 그대로 옮겼다. 순서를 바꾸지 않는다 —
 * 조회 → 정렬 → 방마다 뱃지 조회.
 *
 * <p>[트랜잭션] 읽기 전용이라 명시적 트랜잭션 경계를 두지 않는다. legacy는 {@code readOnly=true}
 * 트랜잭션을 썼지만 그것은 dirty checking을 끄는 최적화이고, 이 경로에는 지연 로딩 연관이 없어
 * 관측 가능한 결과가 같다. 쓰기 slice와 달리 {@code TransactionBoundary} port가 필요 없다.
 */
public final class ListMyRooms {

    private final RoomCatalog roomCatalog;
    private final RoomIssueLookup roomIssueLookup;

    public ListMyRooms(RoomCatalog roomCatalog, RoomIssueLookup roomIssueLookup) {
        this.roomCatalog = roomCatalog;
        this.roomIssueLookup = roomIssueLookup;
    }

    public List<ListedRoomWithIssues> handle(ListMyRoomsQuery query) {
        List<ListedRoom> rooms = roomCatalog.findActiveRoomsOf(query.ownerId(), query.rentType());
        List<ListedRoom> ordered = RoomOrdering.apply(rooms, query.sortType());

        List<ListedRoomWithIssues> result = new ArrayList<>(ordered.size());
        for (ListedRoom room : ordered) {
            result.add(new ListedRoomWithIssues(room, roomIssueLookup.summarize(room.id())));
        }
        return List.copyOf(result);
    }

    /** 목록 한 줄과 그 방의 뱃지. */
    public record ListedRoomWithIssues(ListedRoom room, IssueFlags issues) {
    }
}
