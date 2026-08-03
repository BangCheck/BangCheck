package com.room.backend.feature.roomregistration.domain;

import com.room.backend.domain.room.entity.enums.BuildingType;
import com.room.backend.domain.room.entity.enums.Direction;
import com.room.backend.domain.room.entity.enums.SpecialFloor;

/**
 * 건물·층 관련 서술 정보. 전부 선택 입력이며 불변식이 없다.
 */
public record BuildingProfile(
        BuildingType buildingType,
        Integer floor,
        SpecialFloor specialFloor,
        Direction direction,
        Boolean hasElevator,
        Boolean hasParking) {

    public static BuildingProfile empty() {
        return new BuildingProfile(null, null, null, null, null, null);
    }
}
