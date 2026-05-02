package com.room.backend.domain.map.repository;

import com.room.backend.domain.map.entity.MapPoint;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MapRepository extends JpaRepository<MapPoint, Long> {
    List<MapPoint> findByUserIdAndIsDeletedFalse(Long userId);
    Optional<MapPoint> findByIdAndUserId(Long id, Long userId);

}
