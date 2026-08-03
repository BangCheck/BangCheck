package com.room.backend.feature.roomregistration.adapter.web;

import com.room.backend.feature.roomregistration.domain.RoomRegistrationRule;
import com.room.backend.global.common.exception.RoomErrorCode;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * 도메인 규칙 → legacy 오류 계약 매핑이 전수인지 검사한다.
 *
 * <p>매핑이 빠지면 응답이 조용히 HTTP 500으로 바뀌므로, 규칙이 추가되는 순간 이 test가 먼저 깨진다.
 */
class RoomRegistrationErrorMapperTest {

    @Test
    void everyDomainRuleMapsToTheLegacyErrorCode() {
        assertEquals(RoomErrorCode.JEONSE_DEPOSIT_REQUIRED,
                RoomRegistrationErrorMapper.toErrorCode(RoomRegistrationRule.JEONSE_DEPOSIT_REQUIRED));
        assertEquals(RoomErrorCode.MONTHLY_RENT_REQUIRED,
                RoomRegistrationErrorMapper.toErrorCode(RoomRegistrationRule.MONTHLY_RENT_REQUIRED));
        assertEquals(RoomErrorCode.LOAN_AMOUNT_REQUIRED,
                RoomRegistrationErrorMapper.toErrorCode(RoomRegistrationRule.LOAN_AMOUNT_REQUIRED));
        assertEquals(RoomErrorCode.ROOM_LIMIT_EXCEEDED,
                RoomRegistrationErrorMapper.toErrorCode(RoomRegistrationRule.ACTIVE_ROOM_LIMIT_EXCEEDED));
    }

    @Test
    void everyRuleIsCovered() {
        for (RoomRegistrationRule rule : RoomRegistrationRule.values()) {
            RoomRegistrationErrorMapper.toErrorCode(rule);
        }
    }
}
