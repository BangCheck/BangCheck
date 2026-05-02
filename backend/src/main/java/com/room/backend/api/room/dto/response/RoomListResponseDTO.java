package com.room.backend.api.room.dto.response;

import java.time.LocalDateTime;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.RentType;

import lombok.Getter;

@Getter
public class RoomListResponseDTO {

    private final Long id;
    private final String name;
    private final String address;
    private final RentType rentType;
    private final Long deposit;
    private final Integer rent;
    private final BuildingType buildingType;
    private final LocalDateTime createdAt;

    public RoomListResponseDTO(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.address = room.getAddress();
        this.rentType = room.getRentType();
        this.deposit = room.getDeposit();
        this.rent = room.getMonthlyRent();
        this.buildingType = room.getBuildingType();
        this.createdAt = room.getCreatedAt();
    }
}
