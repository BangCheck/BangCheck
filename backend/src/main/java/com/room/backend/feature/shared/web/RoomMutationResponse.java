package com.room.backend.feature.shared.web;

import com.room.backend.domain.room.entity.enums.*;
import com.room.backend.feature.shared.room.RoomSnapshot;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 기존 RoomCreateResponseDTO와 동일한 JSON field 계약을 등록·수정이 공유한다. */
public record RoomMutationResponse(
        Long id, String name, String address, BigDecimal lat, BigDecimal lon, RentType rentType,
        Long deposit, Integer rent, Integer managementFee, Boolean isManagementFeeUnknown,
        Boolean hasLoan, Long loanAmount, Boolean canRegisterAddress, LocalDate moveInDate,
        Boolean isMoveInDateNegotiable, BuildingType buildingType, Integer floor,
        Boolean hasElevator, Boolean hasParking, SpecialFloor specialFloor, Direction direction,
        String memo, LocalDateTime createdAt) {
    public static RoomMutationResponse from(RoomSnapshot room) {
        return new RoomMutationResponse(
                room.id(), room.name(), room.address(), room.lat(), room.lon(), room.rentType(),
                room.deposit(), room.rent(), room.managementFee(), room.managementFeeUnknown(),
                room.hasLoan(), room.loanAmount(), room.canRegisterAddress(), room.moveInDate(),
                room.moveInDateNegotiable(), room.buildingType(), room.floor(), room.hasElevator(),
                room.hasParking(), room.specialFloor(), room.direction(), room.memo(), room.createdAt());
    }
}
