package com.room.backend.api.room.dto.request;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class RoomUpdateRequestDTO {

    private String name;
    private RentType rentType;
    private Long deposit;
    private Integer rent;
    private Integer managementFee;
    private Boolean isManagementFeeUnknown;
    private Boolean hasLoan;
    private Long loanAmount;
    private Boolean canRegisterAddress;
    private LocalDate moveInDate;
    private Boolean isMoveInDateNegotiable;
    private BuildingType buildingType;
    private Integer floor;
    private Boolean hasElevator;
    private Boolean hasParking;
    private String specialFloor;
    private Direction direction;
    private String memo;
}
