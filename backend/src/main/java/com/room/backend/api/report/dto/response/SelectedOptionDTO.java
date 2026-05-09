package com.room.backend.api.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SelectedOptionDTO {
    private Long optionId;
    private String optionValue;
    private Integer optionScore;
}
