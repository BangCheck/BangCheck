package com.room.backend.api.room.dto.response;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.SpecialFloor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class RoomCreateResponseDTO {

    private final Long id;
    private final String name;
    private final String address;
    private final BigDecimal lat;
    private final BigDecimal lon;
    private final RentType rentType;
    private final Long deposit;
    private final Integer rent;
    private final Integer managementFee;
    private final Boolean isManagementFeeUnknown;
    private final Boolean hasLoan;
    private final Long loanAmount;
    private final Boolean canRegisterAddress;
    private final LocalDate moveInDate;
    private final Boolean isMoveInDateNegotiable;
    private final BuildingType buildingType;
    private final Integer floor;
    private final Boolean hasElevator;
    private final Boolean hasParking;
    private final SpecialFloor specialFloor;
    private final Direction direction;
    private final String memo;
    private final LocalDateTime createdAt;

    public RoomCreateResponseDTO(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.address = room.getAddress();
        this.lat = room.getLat();
        this.lon = room.getLon();
        this.rentType = room.getRentType();
        this.deposit = room.getDeposit();
        this.rent = room.getMonthlyRent();
        this.managementFee = room.getMaintenanceFee();
        this.isManagementFeeUnknown = room.getIsManagementFeeUnknown();
        this.hasLoan = room.getHasLoan();
        this.loanAmount = room.getLoanAmount();
        this.canRegisterAddress = room.getCanRegisterAddress();
        this.moveInDate = room.getAvailableFrom();
        this.isMoveInDateNegotiable = room.getIsMoveInDateNegotiable();
        this.buildingType = room.getBuildingType();
        this.floor = room.getFloor();
        this.hasElevator = room.getHasElevator();
        this.hasParking = room.getHasParking();
        this.specialFloor = room.getSpecialFloor();
        this.direction = room.getDirection();
        this.memo = room.getMemo();
        this.createdAt = room.getCreatedAt();
    }
}
