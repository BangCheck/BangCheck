package com.room.backend.feature.roomcreate.adapter.web;

import com.room.backend.api.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.feature.roomcreate.domain.RoomCreateData;

public final class RoomCreateDataMapper {
    private RoomCreateDataMapper() { }
    public static RoomCreateData from(RoomCreateRequestDTO request) {
        return new RoomCreateData(
                request.getName(), request.getAddress(), request.getRentType(), request.getDeposit(), request.getRent(),
                request.getManagementFee(), request.getIsManagementFeeUnknown(), request.getHasLoan(), request.getLoanAmount(),
                request.getCanRegisterAddress(), request.getMoveInDate(), request.getIsMoveInDateNegotiable(),
                request.getBuildingType(), request.getFloor(), request.getHasElevator(), request.getHasParking(),
                request.getSpecialFloor(), request.getDirection(), request.getMemo());
    }
}
