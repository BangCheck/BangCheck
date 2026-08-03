package com.room.backend.feature.roomupdate.adapter.web;

import com.room.backend.api.room.dto.request.RoomUpdateWithCheckAnswerRequestDTO;
import com.room.backend.feature.roomupdate.domain.RoomUpdateData;
import com.room.backend.feature.roomupdate.domain.RoomUpdateData.AnswerUpdate;

public final class RoomUpdateDataMapper {
    private RoomUpdateDataMapper() { }
    public static RoomUpdateData from(RoomUpdateWithCheckAnswerRequestDTO request) {
        return new RoomUpdateData(
                request.getName(), request.getAddress(), request.getRentType(), request.getDeposit(), request.getRent(),
                request.getManagementFee(), request.getIsManagementFeeUnknown(), request.getHasLoan(), request.getLoanAmount(),
                request.getCanRegisterAddress(), request.getMoveInDate(), request.getIsMoveInDateNegotiable(),
                request.getBuildingType(), request.getFloor(), request.getHasElevator(), request.getHasParking(),
                request.getSpecialFloor(), request.getDirection(), request.getMemo(),
                request.getCheckAnswers() == null ? java.util.List.of() : request.getCheckAnswers().stream()
                        .map(answer -> new AnswerUpdate(answer.getItemId(), answer.getValueText(),
                                answer.getValueNumber(), answer.getSelectedOptionIds()))
                        .toList());
    }
}
