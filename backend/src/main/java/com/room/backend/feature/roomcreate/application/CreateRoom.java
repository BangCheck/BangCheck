package com.room.backend.feature.roomcreate.application;

import com.room.backend.feature.roomcreate.application.port.BasicRoomStore;
import com.room.backend.feature.roomcreate.domain.RoomCreateData;
import com.room.backend.feature.shared.room.RoomSnapshot;

/** 이관: {@code RoomService.createRoom} → 이 use case. */
public final class CreateRoom {
    private final BasicRoomStore store;
    public CreateRoom(BasicRoomStore store) { this.store = store; }
    public RoomSnapshot handle(long ownerId, RoomCreateData data) { return store.create(ownerId, data); }
}
