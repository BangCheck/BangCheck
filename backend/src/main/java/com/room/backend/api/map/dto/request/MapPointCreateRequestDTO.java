package com.room.backend.api.map.dto.request;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MapPointCreateRequestDTO {
    private String name;
    private String address;
    private BigDecimal lat;
    private BigDecimal lon;
    
}
