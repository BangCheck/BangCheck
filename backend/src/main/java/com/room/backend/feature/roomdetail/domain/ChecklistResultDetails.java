package com.room.backend.feature.roomdetail.domain;

import java.math.BigDecimal;
import java.util.List;

/** 방 상세 화면에 표시하는 체크리스트 답변 snapshot. */
public record ChecklistResultDetails(
        Long id, Long roomId, Long itemId, String itemName, String valueText,
        BigDecimal valueNumber, List<SelectedOptionDetails> selectedOptions) {
    public ChecklistResultDetails { selectedOptions = List.copyOf(selectedOptions); }
    public record SelectedOptionDetails(Long optionId, String optionValue) { }
}
