package com.room.backend.api.map.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.room.backend.domain.map.entity.MapPoint;

import lombok.Getter;

@Getter
public class MapPointResponseDTO {
    private final Long id;
    private final String name;
    private final String address;
    private final BigDecimal lat;
    private final BigDecimal lon;
    private final LocalDateTime createdAt;

    public MapPointResponseDTO(MapPoint point) {
        this.id = point.getId();
        this.name = point.getName();
        this.address = point.getAddress();
        this.lat = point.getLat();
        this.lon = point.getLon();
        this.createdAt = point.getCreatedAt();
    }
}
