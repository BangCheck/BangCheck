package com.room.backend.api.report.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CategoryGroupDTO {
    private String category;
    private String categoryName;
    private List<RoomCompareItemDTO> items;
}
