package com.room.backend.api.map.dto.response;

import java.math.BigDecimal;

import com.room.backend.domain.room.entity.enums.RentType;

import lombok.Getter;

@Getter
public class MapRoomResponseDTO {
    private final Long id;
    private final String address;
    private final BigDecimal lat;
    private final BigDecimal lon;
    private final RentType rentType;
    private final Long deposit;
    private final Integer monthlyRent;

    public MapRoomResponseDTO(Long id, String address, BigDecimal lat,
            BigDecimal lon, RentType rentType, Long deposit, Integer monthlyRent) {
        this.id = id;
        this.address = address;
        this.lat = lat;
        this.lon = lon;
        this.rentType = rentType;
        this.deposit = deposit;
        this.monthlyRent = monthlyRent;
    }
}
