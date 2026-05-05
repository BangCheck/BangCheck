package com.room.backend.api.report.dto.response;

import com.room.backend.domain.checklist.entity.enums.ChecklistCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CategoryDTO {
    private String name;
    private String description;
    private Integer order;

    public static CategoryDTO from(ChecklistCategory category) {
        return CategoryDTO.builder()
                .name(category.name())
                .description(category.getDescription())
                .order(category.getOrder())
                .build();
    }
}
