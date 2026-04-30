package com.room.backend.room.dto.request;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.MaintenanceStatus;
import com.room.backend.domain.room.entity.enums.RentType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class RoomCreateRequestDTO {

    private String address;
    private RentType rentType;
    private Long deposit;
    private Integer monthlyRent;
    private MaintenanceStatus maintenanceStatus;
    private Integer maintenanceFee;
    private Boolean hasLoan;
    private Long loanAmount;
    private Boolean canRegisterAddress;
    private LocalDate availableFrom;
    private BuildingType buildingType;
    private Integer floor;
    private Boolean hasElevator;
    private Direction direction;
    private String memo;
}
