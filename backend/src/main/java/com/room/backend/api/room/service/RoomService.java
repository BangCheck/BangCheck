package com.room.backend.api.room.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.room.backend.api.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.api.room.dto.request.RoomUpdateRequestDTO;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.RoomErrorCode;
import com.room.backend.global.geocoding.service.GeocodingService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final GeocodingService geocodingService;

    @Transactional
    public Room createRoom(RoomCreateRequestDTO request, Long userId) {
        BigDecimal[] coordinates = geocodingService.getCoordinates(request.getAddress());

        Room room = Room.create(
                userId,
                request.getName(),
                request.getAddress(),
                coordinates[0],
                coordinates[1],
                request.getRentType(),
                request.getDeposit(),
                request.getRent(),
                request.getIsManagementFeeUnknown(),
                request.getManagementFee(),
                request.getHasLoan(),
                request.getLoanAmount(),
                request.getCanRegisterAddress(),
                request.getMoveInDate(),
                request.getIsMoveInDateNegotiable(),
                request.getBuildingType(),
                request.getFloor(),
                request.getHasElevator(),
                request.getHasParking(),
                request.getSpecialFloor(),
                request.getDirection(),
                request.getMemo()
        );

        return roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public List<Room> getRooms(Long userId) {
        return roomRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Room> getRoom(Long roomId, Long userId) {
        return roomRepository.findByIdAndUserIdAndIsDeletedFalse(roomId, userId);
    }

    @Transactional
    public void deleteRoom(Long roomId, Long userId){
        Room room = roomRepository.findByIdAndUserIdAndIsDeletedFalse(roomId, userId)
                .orElseThrow(() -> new GeneralException(RoomErrorCode.ROOM_NOT_FOUND));
        room.softDelete();
    }

    @Transactional
    public Room updateRoom(RoomUpdateRequestDTO request, Long roomId, Long userId){
        Room room = roomRepository.findByIdAndUserIdAndIsDeletedFalse(roomId, userId)
                .orElseThrow(() -> new GeneralException(RoomErrorCode.ROOM_NOT_FOUND));
        
        room.update(request);
        return room;
    }

}
