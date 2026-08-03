package com.room.backend.feature.roomlist.application;

import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.RoomSortType;

/**
 * 목록 조회 요청의 불변 입력. 두 필터 모두 선택이다.
 */
public record ListMyRoomsQuery(long ownerId, RentType rentType, RoomSortType sortType) {
}
