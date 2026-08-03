package com.room.backend.feature.roomcreate.application.port;

import com.room.backend.feature.roomcreate.domain.RoomCreateData;
import com.room.backend.feature.shared.room.RoomSnapshot;

public interface BasicRoomStore { RoomSnapshot create(long ownerId, RoomCreateData data); }
