package com.room.backend.api.map.dto.response;

import java.math.BigDecimal;

import com.room.backend.domain.room.entity.Room;
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
    private final Integer distanceM;
    private final Integer walkTimeMin;

    // 기준점 존재 안할때
    public MapRoomResponseDTO(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.address = room.getAddress();
        this.lat = room.getLat();
        this.lon = room.getLon();
        this.rentType = room.getRentType();
        this.deposit = room.getDeposit();
        this.rent = room.getMonthlyRent();
        this.distanceM = null;
        this.walkTimeMin = null;
    }

    // 기준점 존재 할때
    public MapRoomResponseDTO(Room room, int distanceM, int walkTimeMin) {
        this.id = room.getId();
        this.name = room.getName();
        this.address = room.getAddress();
        this.lat = room.getLat();
        this.lon = room.getLon();
        this.rentType = room.getRentType();
        this.deposit = room.getDeposit();
        this.rent = room.getMonthlyRent();
        this.distanceM = distanceM;
        this.walkTimeMin = walkTimeMin;
    }
}
