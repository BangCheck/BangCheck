package com.room.backend.room.service;

import java.math.BigDecimal;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.user.repository.UserRepository;
import com.room.backend.global.geocoding.service.GeocodingService;
import com.room.backend.room.domain.repository.RoomRepository;
import com.room.backend.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.room.dto.response.RoomCreateResponseDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;

    @Transactional
    public RoomCreateResponseDTO createRoom(RoomCreateRequestDTO request, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        BigDecimal[] coordinates = geocodingService.getCoordinates(request.getAddress());

        Room room = Room.create(
                userId,
                request.getAddress(),
                coordinates[0],
                coordinates[1],
                request.getRentType(),
                request.getDeposit(),
                request.getMonthlyRent(),
                request.getMaintenanceStatus(),
                request.getMaintenanceFee(),
                request.getHasLoan(),
                request.getLoanAmount(),
                request.getCanRegisterAddress(),
                request.getAvailableFrom(),
                request.getBuildingType(),
                request.getFloor(),
                request.getHasElevator(),
                request.getDirection(),
                request.getMemo()
        );

        Room savedRoom = roomRepository.save(room);

        return new RoomCreateResponseDTO(savedRoom);
    }
}
