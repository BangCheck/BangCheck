package com.room.backend.feature.roomdetail.adapter.web;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import com.room.backend.feature.roomdetail.application.GetRoomDetails.Result;
import com.room.backend.feature.roomdetail.domain.ChecklistResultDetails;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** 기존 RoomDetailResponseDTO와 동일한 JSON field 계약. */
public record RoomDetailsResponse(
        Long id, String name, String address, BigDecimal lat, BigDecimal lon, RentType rentType,
        Long deposit, Integer rent, Integer managementFee, Boolean isManagementFeeUnknown,
        Boolean hasLoan, Long loanAmount, Boolean canRegisterAddress, LocalDate moveInDate,
        Boolean isMoveInDateNegotiable, BuildingType buildingType, Integer floor,
        Boolean hasElevator, Boolean hasParking, SpecialFloor specialFloor,
        List<ChecklistResultResponse> checkResults, Direction direction, String memo,
        LocalDateTime createdAt) {
    public static RoomDetailsResponse from(Result result) {
        var room = result.room();
        return new RoomDetailsResponse(
                room.id(), room.name(), room.address(), room.lat(), room.lon(), room.rentType(),
                room.deposit(), room.rent(), room.managementFee(), room.isManagementFeeUnknown(),
                room.hasLoan(), room.loanAmount(), room.canRegisterAddress(), room.moveInDate(),
                room.isMoveInDateNegotiable(), room.buildingType(), room.floor(), room.hasElevator(),
                room.hasParking(), room.specialFloor(),
                result.checkResults().stream().map(ChecklistResultResponse::from).toList(),
                room.direction(), room.memo(), room.createdAt());
    }

    public record ChecklistResultResponse(
            Long id, Long roomId, Long itemId, String itemName, String valueText,
            BigDecimal valueNumber, List<SelectedOptionResponse> selectedOptions) {
        static ChecklistResultResponse from(ChecklistResultDetails result) {
            return new ChecklistResultResponse(
                    result.id(), result.roomId(), result.itemId(), result.itemName(),
                    result.valueText(), result.valueNumber(),
                    result.selectedOptions().stream().map(SelectedOptionResponse::from).toList());
        }
    }

    public record SelectedOptionResponse(Long optionId, String optionValue) {
        static SelectedOptionResponse from(ChecklistResultDetails.SelectedOptionDetails option) {
            return new SelectedOptionResponse(option.optionId(), option.optionValue());
        }
    }
}
