package com.room.backend.feature.roomregistration.domain;

import java.math.BigDecimal;

/**
 * 위경도 쌍. 둘 중 하나만 있는 상태를 만들 수 없다.
 */
public record Coordinates(BigDecimal latitude, BigDecimal longitude) {

    public Coordinates {
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Coordinates require both latitude and longitude");
        }
    }
}
