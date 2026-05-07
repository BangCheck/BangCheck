package com.room.backend.api.room.dto.response;

import java.time.LocalDateTime;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.Direction;

import lombok.Getter;

@Getter
public class RoomListResponseDTO {

    private final Long id;
    private final String name;
    private final String address;
    private final RentType rentType;
    private final Long deposit;
    private final Integer rent;
    private final Integer managementFee;
    private final Integer floor;
    private final Direction direction;
    private final String memo;
    private final BuildingType buildingType;
    private final LocalDateTime createdAt;
    private final RoomIssuesSummaryDTO issues;

    public RoomListResponseDTO(Room room, RoomIssuesSummaryDTO issues) {
        this.id = room.getId();
        this.name = room.getName();
        this.address = room.getAddress();
        this.rentType = room.getRentType();
        this.deposit = room.getDeposit();
        this.rent = room.getMonthlyRent();
        this.managementFee = room.getMaintenanceFee();
        this.floor = room.getFloor();
        this.direction = room.getDirection();
        this.memo = room.getMemo();
        this.buildingType = room.getBuildingType();
        this.createdAt = room.getCreatedAt();
        this.issues = issues;
    }
}
