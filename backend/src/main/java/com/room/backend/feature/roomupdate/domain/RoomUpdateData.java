package com.room.backend.feature.roomupdate.domain;

import com.room.backend.domain.room.entity.enums.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record RoomUpdateData(
        String name, String address, RentType rentType, Long deposit, Integer rent,
        Integer managementFee, Boolean managementFeeUnknown, Boolean hasLoan, Long loanAmount,
        Boolean canRegisterAddress, LocalDate moveInDate, Boolean moveInDateNegotiable,
        BuildingType buildingType, Integer floor, Boolean hasElevator, Boolean hasParking,
        SpecialFloor specialFloor, Direction direction, String memo, List<AnswerUpdate> answers) {
    public RoomUpdateData { answers = answers == null ? List.of() : List.copyOf(answers); }
    public record AnswerUpdate(Long itemId, String valueText, BigDecimal valueNumber, List<Long> optionIds) {
        public AnswerUpdate {
            optionIds = optionIds == null ? List.of() : Collections.unmodifiableList(new ArrayList<>(optionIds));
        }
    }
}
