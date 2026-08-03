package com.room.backend.feature.roomregistration.application;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import com.room.backend.feature.roomregistration.domain.ChecklistAnswer;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 방 등록 요청의 불변 입력.
 *
 * <p>필수/공백 검증은 web adapter의 Bean Validation이 소유한다. 이 command에 도달했다는 것은
 * {@code COMMON_400_VALIDATION} 단계를 이미 통과했다는 뜻이다.
 */
public record RegisterRoomCommand(
        long ownerId,
        String name,
        String address,
        RentType rentType,
        Long deposit,
        Integer monthlyRent,
        Boolean managementFeeUnknown,
        Integer managementFee,
        Boolean hasLoan,
        Long loanAmount,
        Boolean canRegisterAddress,
        LocalDate moveInDate,
        Boolean moveInDateNegotiable,
        BuildingType buildingType,
        Integer floor,
        Boolean hasElevator,
        Boolean hasParking,
        SpecialFloor specialFloor,
        Direction direction,
        String memo,
        List<ChecklistAnswer> answers) {

    public RegisterRoomCommand {
        answers = answers == null ? List.of() : List.copyOf(answers);
    }
}
