package com.room.backend.room.domain.repository;

import com.room.backend.domain.room.entity.Room;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUserId(Long userId);
    int countByUserId(Long userId);
    
    
}
