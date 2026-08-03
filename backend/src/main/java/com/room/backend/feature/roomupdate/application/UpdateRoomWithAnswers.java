package com.room.backend.feature.roomupdate.application;

import com.room.backend.feature.roomupdate.application.port.RoomUpdateStore;
import com.room.backend.feature.roomupdate.domain.RoomUpdateData;
import java.util.Optional;

/** 이관: {@code RoomService.updateRoomWithCheckAnswers}와 {@code updateRoom} → 이 use case. */
public final class UpdateRoomWithAnswers {
    private final RoomUpdateStore store;
    public UpdateRoomWithAnswers(RoomUpdateStore store) { this.store = store; }
    public Optional<RoomUpdateStore.UpdatedRoom> handle(long roomId, long ownerId, RoomUpdateData data) {
        return store.update(roomId, ownerId, data);
    }
}
