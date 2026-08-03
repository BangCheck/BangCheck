package com.room.backend.feature.roomregistration.domain;

import java.time.LocalDate;

/**
 * 입주 조건. 전부 선택 입력이며 불변식이 없다.
 */
public record MoveInTerms(
        LocalDate availableFrom,
        Boolean negotiable,
        Boolean canRegisterAddress) {

    public static MoveInTerms empty() {
        return new MoveInTerms(null, null, null);
    }
}
