package com.room.backend.feature.roomdelete.application;

import com.room.backend.feature.roomdelete.application.port.RoomDeletionStore;

/** 이관: {@code RoomService.deleteRoom} → 이 use case. */
public final class DeleteRoom {
    private final RoomDeletionStore store;
    public DeleteRoom(RoomDeletionStore store) { this.store = store; }
    public boolean handle(long roomId, long ownerId) { return store.softDelete(roomId, ownerId); }
}
