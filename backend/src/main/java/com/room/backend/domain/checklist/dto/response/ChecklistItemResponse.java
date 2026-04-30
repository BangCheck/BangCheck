package com.room.backend.domain.checklist.dto.response;

import com.room.backend.domain.checklist.entity.ChecklistItem;
import com.room.backend.domain.checklist.entity.ChecklistOption;
import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import com.room.backend.domain.checklist.entity.enums.InputType;
import com.room.backend.domain.checklist.entity.enums.ItemType;
import com.room.backend.domain.checklist.entity.enums.UserType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ChecklistItemResponse {
    private Long id;
    private String itemName;
    private ChecklistCategory category;
    private ItemType itemType;
    private UserType userType;
    private InputType inputType;
    private String description;
    private Integer displayOrder;
    private Boolean isEnabled;
    private List<ChecklistOptionResponse> options;

    public static ChecklistItemResponse of(ChecklistItem item, List<ChecklistOption> options, Boolean isEnabled) {
        return ChecklistItemResponse.builder()
                .id(item.getId())
                .itemName(item.getItemName())
                .category(item.getCategory())
                .itemType(item.getItemType())
                .userType(item.getUserType())
                .inputType(item.getInputType())
                .description(item.getDescription())
                .displayOrder(item.getDisplayOrder())
                .isEnabled(isEnabled)
                .options(options.stream()
                        .map(ChecklistOptionResponse::of)
                        .toList())
                .build();
    }
}
