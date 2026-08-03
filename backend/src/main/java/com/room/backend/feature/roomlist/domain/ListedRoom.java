package com.room.backend.feature.roomlist.domain;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;

import java.time.LocalDateTime;

/**
 * 목록 화면 한 줄. 상세 조회와 달리 필요한 필드만 갖는다.
 *
 * <p>[계약 보존] 필드 집합은 legacy {@code RoomListResponseDTO}가 {@code Room}에서 읽어가던 것과 같다.
 */
public record ListedRoom(
        long id,
        String name,
        String address,
        RentType rentType,
        Long deposit,
        Integer monthlyRent,
        Integer managementFee,
        Integer floor,
        Direction direction,
        String memo,
        BuildingType buildingType,
        LocalDateTime createdAt) {
}
