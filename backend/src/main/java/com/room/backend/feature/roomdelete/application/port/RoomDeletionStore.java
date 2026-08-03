package com.room.backend.feature.roomdelete.application.port;

public interface RoomDeletionStore { boolean softDelete(long roomId, long ownerId); }
