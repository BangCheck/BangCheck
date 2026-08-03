package com.room.backend.feature.roomregistration.adapter.web;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import com.room.backend.feature.roomregistration.application.RegisteredRoom;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 방 등록 응답 본문.
 *
 * <p>[계약 보존] 필드 이름과 <b>선언 순서</b>가 legacy {@code RoomCreateResponseDTO}와 정확히 같다.
 * Jackson은 선언 순서로 직렬화하므로 순서가 어긋나면 응답 JSON이 바뀐다.
 * 동등성은 {@code RoomRegistrationResponseTest}가 두 타입의 직렬화 결과를 직접 비교해 검증한다.
 */
public record RoomRegistrationResponse(
        Long id,
        String name,
        String address,
        BigDecimal lat,
        BigDecimal lon,
        RentType rentType,
        Long deposit,
        Integer rent,
        Integer managementFee,
        Boolean isManagementFeeUnknown,
        Boolean hasLoan,
        Long loanAmount,
        Boolean canRegisterAddress,
        LocalDate moveInDate,
        Boolean isMoveInDateNegotiable,
        BuildingType buildingType,
        Integer floor,
        Boolean hasElevator,
        Boolean hasParking,
        SpecialFloor specialFloor,
        Direction direction,
        String memo,
        LocalDateTime createdAt) {

    public static RoomRegistrationResponse from(RegisteredRoom room) {
        return new RoomRegistrationResponse(
                room.id(),
                room.name(),
                room.address(),
                room.latitude(),
                room.longitude(),
                room.rentType(),
                room.deposit(),
                room.monthlyRent(),
                room.managementFee(),
                room.managementFeeUnknown(),
                room.hasLoan(),
                room.loanAmount(),
                room.canRegisterAddress(),
                room.moveInDate(),
                room.moveInDateNegotiable(),
                room.buildingType(),
                room.floor(),
                room.hasElevator(),
                room.hasParking(),
                room.specialFloor(),
                room.direction(),
                room.memo(),
                room.createdAt());
    }
}
