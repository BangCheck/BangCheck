package com.room.backend.feature.roomdetail.application.port;

import com.room.backend.feature.roomdetail.domain.RoomDetails;
import java.util.Optional;

public interface RoomDetailsCatalog {
    Optional<RoomDetails> findActiveRoom(long roomId, long ownerId);
}
