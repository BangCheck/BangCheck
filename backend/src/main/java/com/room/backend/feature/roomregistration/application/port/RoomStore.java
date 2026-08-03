package com.room.backend.feature.roomregistration.application.port;

import com.room.backend.feature.roomregistration.domain.RoomRegistration;

import java.time.LocalDateTime;

/**
 * 방 영속화 side-effect port.
 */
public interface RoomStore {

    /** 소프트 삭제되지 않은 방 개수. 상한 판정의 입력이다. */
    int countActiveRoomsOf(long ownerId);

    StoredRoom save(RoomRegistration registration);

    /** 저장이 확정한 값만 돌려준다. 나머지 필드는 이미 {@link RoomRegistration}이 소유한다. */
    record StoredRoom(long id, LocalDateTime createdAt) {
    }
}
