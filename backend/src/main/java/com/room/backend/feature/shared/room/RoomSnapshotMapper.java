package com.room.backend.feature.shared.room;

import com.room.backend.domain.room.entity.Room;

/** JPA entity → 불변 출력 변환은 adapter/shared 경계 한 곳에서만 수행한다. */
public final class RoomSnapshotMapper {
    private RoomSnapshotMapper() { }
    public static RoomSnapshot from(Room room) {
        return new RoomSnapshot(
                room.getId(), room.getName(), room.getAddress(), room.getLat(), room.getLon(),
                room.getRentType(), room.getDeposit(), room.getMonthlyRent(), room.getMaintenanceFee(),
                room.getIsManagementFeeUnknown(), room.getHasLoan(), room.getLoanAmount(),
                room.getCanRegisterAddress(), room.getAvailableFrom(), room.getIsMoveInDateNegotiable(),
                room.getBuildingType(), room.getFloor(), room.getHasElevator(), room.getHasParking(),
                room.getSpecialFloor(), room.getDirection(), room.getMemo(), room.getCreatedAt());
    }
}
