package com.room.backend.domain.room.repository;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUserId(Long userId);
    int countByUserId(Long userId);
    int countByUserIdAndIsDeletedFalse(Long userId);

    @Query("""
        SELECT room FROM Room room
        WHERE room.userId = :userId
        AND (:rentType IS NULL OR room.rentType = :rentType)
        AND room.isDeleted = false
        ORDER BY room.createdAt ASC
        """)
    List<Room> findRoomsWithFilter(@Param("userId") Long userId, @Param("rentType") RentType rentType);

    List<Room> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    Optional<Room> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);
}
