package com.room.backend.feature.roomregistration.application;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 등록 결과의 불변 출력.
 *
 * <p>필드 집합은 legacy {@code RoomCreateResponseDTO}와 1:1이다. web adapter가 이 record에서
 * 응답 DTO를 만들며 JSON 형태는 바뀌지 않아야 한다.
 */
public record RegisteredRoom(
        long id,
        String name,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        RentType rentType,
        Long deposit,
        Integer monthlyRent,
        Integer managementFee,
        Boolean managementFeeUnknown,
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
        LocalDateTime createdAt) {
}
