package com.room.backend.api.report.dto.response;

import com.room.backend.domain.room.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RentInfoDTO {

    private String rentType;
    private Long deposit;
    private Integer monthlyRent;
    private Integer maintenanceFee;

    public static RentInfoDTO from(Room room) {
        return RentInfoDTO.builder()
                .rentType(getRentType(room))
                .deposit(room.getDeposit())
                .monthlyRent(room.getMonthlyRent())
                .maintenanceFee(room.getMaintenanceFee())
                .build();
    }

    private static String getRentType(Room room) {

        if (room.getRentType() == null) return "미상";

        return switch (room.getRentType()) {
            case MONTHLY -> "월세";
            case JEONSE -> "전세";
            case SHORT_TERM -> "단기 임대";
        };
    }
}