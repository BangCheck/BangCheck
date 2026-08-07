package com.room.backend.domain.checklist.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.room.backend.domain.checklist.entity.RoomCheckResult;

public interface RoomCheckResultRepository extends JpaRepository<RoomCheckResult, Long> {
    List<RoomCheckResult> findByRoomId(Long roomId);

    List<RoomCheckResult> findByRoomIdIn(List<Long> roomIds);

    Optional<RoomCheckResult> findByRoomIdAndItemId(Long roomId, Long itemId);

    List<RoomCheckResult> findByRoomIdInAndItemId(List<Long> roomIds, Long itemId);
}
