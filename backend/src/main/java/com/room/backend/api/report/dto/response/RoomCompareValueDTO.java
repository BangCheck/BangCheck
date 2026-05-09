package com.room.backend.api.report.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RoomCompareValueDTO {
    private String valueText;
    private BigDecimal valueNumber;
    private List<SelectedOptionDTO> selectedOptions;
}
