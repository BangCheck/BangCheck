package com.room.backend.feature.roomdelete.adapter.persistence;

import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomdelete.application.port.RoomDeletionStore;
import org.springframework.transaction.support.TransactionTemplate;

public final class JpaRoomDeletionStore implements RoomDeletionStore {
    private final RoomRepository rooms;
    private final TransactionTemplate transactions;
    public JpaRoomDeletionStore(RoomRepository rooms, TransactionTemplate transactions) {
        this.rooms = rooms; this.transactions = transactions;
    }
    @Override public boolean softDelete(long roomId, long ownerId) {
        Boolean deleted = transactions.execute(ignored -> rooms
                .findByIdAndUserIdAndIsDeletedFalse(roomId, ownerId)
                .map(room -> { room.softDelete(); return true; })
                .orElse(false));
        return Boolean.TRUE.equals(deleted);
    }
}
