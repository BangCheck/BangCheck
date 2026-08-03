package com.room.backend.feature.roomcreate.domain;

import com.room.backend.domain.room.entity.enums.*;
import java.time.LocalDate;

public record RoomCreateData(
        String name, String address, RentType rentType, Long deposit, Integer rent,
        Integer managementFee, Boolean managementFeeUnknown, Boolean hasLoan, Long loanAmount,
        Boolean canRegisterAddress, LocalDate moveInDate, Boolean moveInDateNegotiable,
        BuildingType buildingType, Integer floor, Boolean hasElevator, Boolean hasParking,
        SpecialFloor specialFloor, Direction direction, String memo) { }
