package com.room.backend.domain.checklist.dto.response;

import com.room.backend.domain.checklist.entity.ChecklistOption;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChecklistOptionResponse {
    private Long id;
    private String optionValue;
    private Integer displayOrder;

    public static ChecklistOptionResponse of(ChecklistOption option) {
        return ChecklistOptionResponse.builder()
                .id(option.getId())
                .optionValue(option.getOptionValue())
                .displayOrder(option.getDisplayOrder())
                .build();
    }
}
