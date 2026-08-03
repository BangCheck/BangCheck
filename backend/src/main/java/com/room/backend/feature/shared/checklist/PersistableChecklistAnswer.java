package com.room.backend.feature.shared.checklist;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** 세 쓰기 slice가 공유하는 DB 입력. null option ID도 legacy처럼 DB 제약까지 전달한다. */
public record PersistableChecklistAnswer(Long itemId, String valueText, BigDecimal valueNumber, List<Long> optionIds) {
    public PersistableChecklistAnswer {
        optionIds = optionIds == null ? List.of() : Collections.unmodifiableList(new ArrayList<>(optionIds));
    }
}
