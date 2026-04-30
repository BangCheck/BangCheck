package com.room.backend.api.map.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MapService {

    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public List<Room> getRoomsForMap(Long userId, RentType rentType) {
        return roomRepository.findRoomsWithFilter(userId, rentType);
    }
}
