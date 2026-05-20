package com.room.backend.api.map.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.room.backend.api.room.dto.response.RoomIssuesSummaryDTO;
import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.RentType;

import lombok.Getter;

@Getter
public class MapRoomResponseDTO {
    private final Long id;
    private final String name;
    private final String address;
    private final BigDecimal lat;
    private final BigDecimal lon;
    private final RentType rentType;
    private final Long deposit;
    private final Integer rent;
    private final Integer managementFee;
    private final Integer floor;
    private final Direction direction;
    private final BuildingType buildingType;
    private final String memo;
    private final LocalDateTime createdAt;
    private final RoomIssuesSummaryDTO issues;
    private final Integer distanceM;
    private final Integer walkTimeMin;

    // 기준점 없을 때
    public MapRoomResponseDTO(Room room, RoomIssuesSummaryDTO issues) {
        this(room, issues, null, null);
    }

    // 기준점 있을 때
    public MapRoomResponseDTO(Room room, RoomIssuesSummaryDTO issues, Integer distanceM, Integer walkTimeMin) {
        this.id = room.getId();
        this.name = room.getName();
        this.address = room.getAddress();
        this.lat = room.getLat();
        this.lon = room.getLon();
        this.rentType = room.getRentType();
        this.deposit = room.getDeposit();
        this.rent = room.getMonthlyRent();
        this.managementFee = room.getMaintenanceFee();
        this.floor = room.getFloor();
        this.direction = room.getDirection();
        this.buildingType = room.getBuildingType();
        this.memo = room.getMemo();
        this.createdAt = room.getCreatedAt();
        this.issues = issues;
        this.distanceM = distanceM;
        this.walkTimeMin = walkTimeMin;
    }
}
