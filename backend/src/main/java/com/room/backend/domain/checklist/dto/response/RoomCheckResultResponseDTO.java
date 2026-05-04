package com.room.backend.domain.checklist.dto.response;

import java.math.BigDecimal;
import java.util.List;

import com.room.backend.domain.checklist.entity.RoomCheckResult;

import lombok.Getter;

@Getter
public class RoomCheckResultResponseDTO {
    private final Long id;
    private final Long roomId;
    private final Long itemId;
    private final String itemName;
    private final String valueText;
    private final BigDecimal valueNumber;
    private final List<RoomCheckSelectedOptionResponseDTO> selectedOptions;

    public RoomCheckResultResponseDTO(RoomCheckResult result, String itemName, List<RoomCheckSelectedOptionResponseDTO> selectedOptions) {
        this.id = result.getId();
        this.roomId = result.getRoomId();
        this.itemId = result.getItemId();
        this.itemName = itemName;
        this.valueText = result.getValueText();
        this.valueNumber = result.getValueNumber();
        this.selectedOptions = selectedOptions;
    }
}

