package com.room.backend.feature.roomregistration.domain;

/**
 * 융자 여부와 금액. legacy는 미신고(null)와 "없음"(false)을 구분해 저장하므로
 * {@code declared}를 Boolean 삼상태로 보존한다.
 */
public record LoanBurden(Boolean declared, Long amount) {

    public static LoanBurden of(Boolean declared, Long amount) {
        if (!Boolean.TRUE.equals(declared)) {
            return new LoanBurden(declared, null);
        }
        if (amount == null) {
            throw new RoomRegistrationRejected(RoomRegistrationRule.LOAN_AMOUNT_REQUIRED);
        }
        return new LoanBurden(Boolean.TRUE, amount);
    }
}
