package com.room.backend.api.report.dto.response;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RoomCompareItemDTO {
    private Long itemId;
    private String itemName;
    private String itemType;
    private Map<Long, RoomCompareValueDTO> rooms;
}
