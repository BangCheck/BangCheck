package com.room.backend.feature.roomdetail.domain;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 방 상세 조회에 필요한 불변 snapshot. JPA entity를 public boundary로 노출하지 않는다. */
public record RoomDetails(
        Long id, String name, String address, BigDecimal lat, BigDecimal lon, RentType rentType,
        Long deposit, Integer rent, Integer managementFee, Boolean isManagementFeeUnknown,
        Boolean hasLoan, Long loanAmount, Boolean canRegisterAddress, LocalDate moveInDate,
        Boolean isMoveInDateNegotiable, BuildingType buildingType, Integer floor,
        Boolean hasElevator, Boolean hasParking, SpecialFloor specialFloor, Direction direction,
        String memo, LocalDateTime createdAt) {
}
