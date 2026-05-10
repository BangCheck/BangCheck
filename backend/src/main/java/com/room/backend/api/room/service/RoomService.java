package com.room.backend.api.room.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import com.room.backend.api.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.api.room.dto.request.RoomUpdateRequestDTO;
import com.room.backend.api.room.dto.request.RoomUpdateWithCheckAnswerRequestDTO;
import com.room.backend.api.room.dto.request.RoomWithCheckAnswerRequestDTO;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.RoomSortType;
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
    private final RoomCheckResultService roomCheckResultService;

    @Transactional
    public Room createRoomWithCheckAnswers(RoomWithCheckAnswerRequestDTO request, Long userId) {
        if(roomRepository.countByUserIdAndIsDeletedFalse(userId) >=6) {
            throw new GeneralException(RoomErrorCode.ROOM_LIMIT_EXCEEDED);
        }

        BigDecimal[] coordinates = geocodingService.getCoordinates(request.getAddress());
        BigDecimal lat = coordinates != null ? coordinates[0] : null;
        BigDecimal lon = coordinates != null ? coordinates[1] : null;

        Room room = Room.create(
                userId,
                request.getName(),
                request.getAddress(),
                lat,
                lon,
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

        Room savedRoom = roomRepository.save(room);

        if (request.getCheckAnswers() != null && !request.getCheckAnswers().isEmpty()) {
            roomCheckResultService.saveCheckResult(savedRoom.getId(), request.getCheckAnswers());
        }

        return savedRoom;
    }

    @Transactional
    public Room createRoom(RoomCreateRequestDTO request, Long userId) {

        if(roomRepository.countByUserIdAndIsDeletedFalse(userId) >=6) {
            throw new GeneralException(RoomErrorCode.ROOM_LIMIT_EXCEEDED);
        }

        BigDecimal[] coordinates = geocodingService.getCoordinates(request.getAddress());
        BigDecimal lat = coordinates != null ? coordinates[0] : null;
        BigDecimal lon = coordinates != null ? coordinates[1] : null;

        Room room = Room.create(
                userId,
                request.getName(),
                request.getAddress(),
                lat,
                lon,
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
    public List<Room> getRooms(Long userId, RentType rentType, RoomSortType sort) {
        List<Room> rooms = roomRepository.findRoomsWithFilter(userId, rentType);

        if (sort == null) return rooms;

        return switch (sort) {
            case DEPOSIT_ASC -> rooms.stream()
                .sorted(Comparator.comparingLong(r -> r.getDeposit() == null ? Long.MAX_VALUE : r.getDeposit()))
                .toList();
            case RENT_ASC -> rooms.stream()
                .sorted(Comparator.comparingInt(r -> r.getMonthlyRent() == null ? Integer.MAX_VALUE : r.getMonthlyRent()))
                .toList();
            case MANAGEMENT_FEE_ASC -> rooms.stream()
                .sorted(Comparator.comparingInt(r -> r.getMaintenanceFee() == null ? Integer.MAX_VALUE : r.getMaintenanceFee()))
                .toList();
        };
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

        BigDecimal lat = null;
        BigDecimal lon = null;
        if (request.getAddress() != null) {
            BigDecimal[] coordinates = geocodingService.getCoordinates(request.getAddress());
            lat = coordinates != null ? coordinates[0] : null;
            lon = coordinates != null ? coordinates[1] : null;
        }

        room.update(request, lat, lon);
        return room;
    }

    @Transactional
    public Room updateRoomWithCheckAnswers(RoomUpdateWithCheckAnswerRequestDTO request, Long roomId, Long userId) {
        Room updatedRoom = updateRoom(request, roomId, userId);

        if (request.getCheckAnswers() != null && !request.getCheckAnswers().isEmpty()) {
            roomCheckResultService.updateCheckResults(roomId, request.getCheckAnswers());
        }

        return updatedRoom;
    }

}
