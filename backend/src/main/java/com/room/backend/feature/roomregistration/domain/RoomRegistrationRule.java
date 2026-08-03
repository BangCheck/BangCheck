package com.room.backend.feature.roomregistration.domain;

/**
 * 방 등록이 거절되는 이유. HTTP status와 응답 code는 adapter가 소유한다.
 */
public enum RoomRegistrationRule {
    JEONSE_DEPOSIT_REQUIRED,
    MONTHLY_RENT_REQUIRED,
    LOAN_AMOUNT_REQUIRED,
    ACTIVE_ROOM_LIMIT_EXCEEDED
}
