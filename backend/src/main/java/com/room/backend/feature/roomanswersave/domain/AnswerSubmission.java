package com.room.backend.feature.roomanswersave.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record AnswerSubmission(Long itemId, String valueText, BigDecimal valueNumber, List<Long> optionIds) {
    public AnswerSubmission {
        optionIds = optionIds == null ? List.of() : Collections.unmodifiableList(new ArrayList<>(optionIds));
    }
}
