package com.room.backend.api.map.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;

@Getter
public class MapPointResponseDTO {
    private final Long id;
    private final String name;
    private final String address;
    private final BigDecimal lat;
    private final BigDecimal lon;
    private LocalDateTime createdAt;

    public MapPointResponseDTO(Long id, String name, String address, BigDecimal lat, BigDecimal lon, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lon = lon;
        this.createdAt = createdAt;
    }
}
