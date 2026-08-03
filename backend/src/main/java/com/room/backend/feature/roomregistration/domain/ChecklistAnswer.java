package com.room.backend.feature.roomregistration.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 체크리스트 항목 하나에 대한 답변.
 *
 * <p>legacy는 item/option의 존재나 관계를 선검증하지 않고 DB FK·unique 제약에 위임한다.
 * 이 타입도 같은 계약을 유지하므로 {@code itemId}가 null이거나 미존재여도 여기서 막지 않는다.
 *
 * <p>[계약 보존] 방어 복사에 {@code List.copyOf}를 쓰지 않는다. {@code List.copyOf}는 null 원소에
 * NPE를 던지고, 그러면 legacy가 DB 제약으로 만들어내던 HTTP 409 {@code COMMON_409}가
 * HTTP 500 {@code COMMON_500}으로 바뀐다. null option ID는 legacy와 동일하게 DB까지 내려보낸다.
 */
public record ChecklistAnswer(
        Long itemId,
        String valueText,
        BigDecimal valueNumber,
        List<Long> selectedOptionIds) {

    public ChecklistAnswer {
        selectedOptionIds = selectedOptionIds == null
                ? List.of()
                : Collections.unmodifiableList(new ArrayList<>(selectedOptionIds));
    }
}
