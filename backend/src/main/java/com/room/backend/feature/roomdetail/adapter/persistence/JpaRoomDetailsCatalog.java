package com.room.backend.feature.roomdetail.adapter.persistence;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomdetail.application.port.RoomDetailsCatalog;
import com.room.backend.feature.roomdetail.domain.RoomDetails;
import java.util.Optional;

public final class JpaRoomDetailsCatalog implements RoomDetailsCatalog {
    private final RoomRepository roomRepository;

    public JpaRoomDetailsCatalog(RoomRepository roomRepository) { this.roomRepository = roomRepository; }

    @Override
    public Optional<RoomDetails> findActiveRoom(long roomId, long ownerId) {
        return roomRepository.findByIdAndUserIdAndIsDeletedFalse(roomId, ownerId)
                .map(JpaRoomDetailsCatalog::toDetails);
    }

    private static RoomDetails toDetails(Room room) {
        return new RoomDetails(
                room.getId(), room.getName(), room.getAddress(), room.getLat(), room.getLon(),
                room.getRentType(), room.getDeposit(), room.getMonthlyRent(), room.getMaintenanceFee(),
                room.getIsManagementFeeUnknown(), room.getHasLoan(), room.getLoanAmount(),
                room.getCanRegisterAddress(), room.getAvailableFrom(), room.getIsMoveInDateNegotiable(),
                room.getBuildingType(), room.getFloor(), room.getHasElevator(), room.getHasParking(),
                room.getSpecialFloor(), room.getDirection(), room.getMemo(), room.getCreatedAt());
    }
}
