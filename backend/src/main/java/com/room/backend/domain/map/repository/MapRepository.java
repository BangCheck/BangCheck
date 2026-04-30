package com.room.backend.domain.map.repository;

import com.room.backend.domain.map.entity.MapPoint;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MapRepository extends JpaRepository<MapPoint, Long> {
}
