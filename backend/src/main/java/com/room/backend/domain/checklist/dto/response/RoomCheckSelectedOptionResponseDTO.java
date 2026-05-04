package com.room.backend.domain.checklist.dto.response;

import com.room.backend.domain.checklist.entity.ChecklistOption;

import lombok.Getter;

@Getter
public class RoomCheckSelectedOptionResponseDTO {
    private final Long optionId;
    private final String optionValue;

    public RoomCheckSelectedOptionResponseDTO(ChecklistOption option) {
        this.optionId = option.getId();
        this.optionValue = option.getOptionValue();
    }

}
