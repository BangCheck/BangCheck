package com.room.backend.feature.shared.room;

import com.room.backend.domain.room.entity.enums.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 등록·수정 결과가 공유하는 불변 출력. JPA entity를 application 밖으로 노출하지 않는다. */
public record RoomSnapshot(
        Long id, String name, String address, BigDecimal lat, BigDecimal lon, RentType rentType,
        Long deposit, Integer rent, Integer managementFee, Boolean managementFeeUnknown,
        Boolean hasLoan, Long loanAmount, Boolean canRegisterAddress, LocalDate moveInDate,
        Boolean moveInDateNegotiable, BuildingType buildingType, Integer floor,
        Boolean hasElevator, Boolean hasParking, SpecialFloor specialFloor, Direction direction,
        String memo, LocalDateTime createdAt) { }
