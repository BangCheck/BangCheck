package com.room.backend.api.report.dto.response;

import com.room.backend.domain.room.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RoomSummaryDTO {
    private Long roomId;
    private String name;
    private String address;

    private String buildingType;
    private Integer floor;
    private String direction;

    private String floorType;

    private RentInfoDTO rentInfo;

    public static RoomSummaryDTO from(Room room) {
        return RoomSummaryDTO.builder()
                .roomId(room.getId())
                .name(room.getName())
                .address(room.getAddress())
                .buildingType(getBuildingType(room))
                .floor(room.getFloor())
                .direction(getDirection(room))
                .floorType(getFloorType(room))
                .rentInfo(RentInfoDTO.from(room))
                .build();
    }

    private static String getBuildingType(Room room) {
        return room.getBuildingType() != null
                ? room.getBuildingType().getDescription()
                : "정보 없음";
    }

    private static String getDirection(Room room) {
        return room.getDirection() != null
                ? room.getDirection().getDescription()
                : "정보 없음";
    }

    private static String getFloorType(Room room) {
        if (room.getSpecialFloor() == null) {
            return "일반";
        }

        return switch (room.getSpecialFloor()) {
            case SEMI_BASEMENT -> "반지하";
            case ROOFTOP -> "옥탑";
            case NONE -> "일반";
        };
    }
}
