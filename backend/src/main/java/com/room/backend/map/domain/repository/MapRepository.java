package com.room.backend.map.domain.repository;

import com.room.backend.map.domain.entity.MapPoint;
import com.room.backend.map.domain.entity.RoomPointDistance;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MapRepository extends JpaRepository<MapPoint, Long> {
    
}
