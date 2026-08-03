package com.room.backend.feature.roomlist.adapter.web;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.feature.roomlist.application.ListMyRooms.ListedRoomWithIssues;
import com.room.backend.feature.roomlist.domain.IssueFlags;
import com.room.backend.feature.roomlist.domain.ListedRoom;

import java.time.LocalDateTime;

/**
 * 방 목록 응답 한 줄.
 *
 * <p>[계약 보존] 필드 이름과 <b>선언 순서</b>가 legacy {@code RoomListResponseDTO}와 정확히 같다.
 * 동등성은 {@code RoomListItemResponseTest}가 두 타입의 직렬화 결과를 직접 비교해 검증한다.
 */
public record RoomListItemResponse(
        Long id,
        String name,
        String address,
        RentType rentType,
        Long deposit,
        Integer rent,
        Integer managementFee,
        Integer floor,
        Direction direction,
        String memo,
        BuildingType buildingType,
        LocalDateTime createdAt,
        Issues issues) {

    /** legacy {@code RoomIssuesSummaryDTO}와 필드 이름·순서가 같다. */
    public record Issues(
            boolean mold,
            boolean leak,
            boolean bug,
            boolean drainSmell,
            boolean condensation) {

        static Issues from(IssueFlags flags) {
            return new Issues(flags.mold(), flags.leak(), flags.bug(),
                    flags.drainSmell(), flags.condensation());
        }
    }

    public static RoomListItemResponse from(ListedRoomWithIssues listed) {
        ListedRoom room = listed.room();
        return new RoomListItemResponse(
                room.id(),
                room.name(),
                room.address(),
                room.rentType(),
                room.deposit(),
                room.monthlyRent(),
                room.managementFee(),
                room.floor(),
                room.direction(),
                room.memo(),
                room.buildingType(),
                room.createdAt(),
                Issues.from(listed.issues()));
    }
}
