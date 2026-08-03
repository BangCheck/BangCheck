package com.room.backend.feature.roomlist.application.port;

import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.feature.roomlist.domain.ListedRoom;

import java.util.List;

/**
 * 소유자의 활성 방 목록 조회 side-effect port.
 */
public interface RoomCatalog {

    /**
     * 삭제되지 않은 방을 생성 최신순으로 반환한다.
     *
     * @param rentType null이면 전체를 반환한다
     */
    List<ListedRoom> findActiveRoomsOf(long ownerId, RentType rentType);
}
