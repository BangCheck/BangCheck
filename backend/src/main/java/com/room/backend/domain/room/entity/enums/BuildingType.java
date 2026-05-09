package com.room.backend.domain.room.entity.enums;

import lombok.Getter;

@Getter
public enum BuildingType {
    VILLA("빌라"),
    OFFICETEL("오피스텔"),
    ONE_ROOM("원룸"),
    ONE_POINT_FIVE_ROOM("1.5룸"),
    GOSIWON("고시원"),
    BOARDING_HOUSE("하숙집");

    private final String description;

    BuildingType(String description) {
        this.description = description;
    }

}
