package com.room.backend.feature.roomupdate.application.port;

import com.room.backend.feature.roomupdate.domain.RoomUpdateData;
import java.util.Optional;
import com.room.backend.feature.shared.room.RoomSnapshot;

public interface RoomUpdateStore {
    Optional<UpdatedRoom> update(long roomId, long ownerId, RoomUpdateData data);
    record UpdatedRoom(RoomSnapshot room) { }
}
