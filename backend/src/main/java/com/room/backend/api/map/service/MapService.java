package com.room.backend.api.map.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.room.backend.api.map.dto.request.MapPointCreateRequestDTO;
import com.room.backend.domain.map.entity.MapPoint;
import com.room.backend.domain.map.repository.MapRepository;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MapService {

    private final RoomRepository roomRepository;
    private final MapRepository mapRepository;

    @Transactional(readOnly = true)
    public List<Room> getRoomsForMap(Long userId, RentType rentType) {
        return roomRepository.findRoomsWithFilter(userId, rentType);
    }

    @Transactional(readOnly = true)
    public List<MapPoint> getAllMapPointsForRooms(Long userId) {
        return mapRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    @Transactional(readOnly = true)
    public Optional<MapPoint> getMapPointById(Long mapId, Long userId) {
        return mapRepository.findByIdAndUserIdAndIsDeletedFalse(mapId, userId);
    }

    @Transactional
    public MapPoint createMapPoint(MapPointCreateRequestDTO request, Long userId) {
        MapPoint mapPoint = MapPoint.create(userId, request.getName(), request.getLat(), request.getLon(), request.getAddress());
        return mapRepository.save(mapPoint);
    }

    @Transactional
    public void deleteMapPoint(Long mapId, Long userId) {
        MapPoint mapPoint = mapRepository.findByIdAndUserIdAndIsDeletedFalse(mapId, userId)
                .orElseThrow(() -> new RuntimeException("지도 기준점을 찾을 수 없습니다."));
        mapPoint.softDelete();
    }

}
