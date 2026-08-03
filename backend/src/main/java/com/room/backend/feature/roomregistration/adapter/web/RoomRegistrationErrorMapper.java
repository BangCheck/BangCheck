package com.room.backend.feature.roomregistration.adapter.web;

import com.room.backend.feature.roomregistration.domain.RoomRegistrationRejected;
import com.room.backend.feature.roomregistration.domain.RoomRegistrationRule;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.RoomErrorCode;

/**
 * 도메인 거절 사유를 legacy 오류 계약으로 옮긴다.
 *
 * <p>도메인은 HTTP status·응답 code를 모른다. 그 지식은 이 adapter 한 곳에만 둔다.
 *
 * <p>[계약 보존] 아래 매핑은 legacy {@code Room.create}·{@code RoomService}가 던지던
 * {@link RoomErrorCode}와 1:1이다. 응답 status·code·message가 바뀌지 않는다.
 */
public final class RoomRegistrationErrorMapper {

    private RoomRegistrationErrorMapper() {
    }

    /** 도메인 거절을 PATH A 예외로 변환한다. 매핑 누락은 컴파일이 아니라 여기서 즉시 드러난다. */
    public static GeneralException toGeneralException(RoomRegistrationRejected rejected) {
        return new GeneralException(toErrorCode(rejected.rule()));
    }

    static RoomErrorCode toErrorCode(RoomRegistrationRule rule) {
        switch (rule) {
            case JEONSE_DEPOSIT_REQUIRED:
                return RoomErrorCode.JEONSE_DEPOSIT_REQUIRED;
            case MONTHLY_RENT_REQUIRED:
                return RoomErrorCode.MONTHLY_RENT_REQUIRED;
            case LOAN_AMOUNT_REQUIRED:
                return RoomErrorCode.LOAN_AMOUNT_REQUIRED;
            case ACTIVE_ROOM_LIMIT_EXCEEDED:
                return RoomErrorCode.ROOM_LIMIT_EXCEEDED;
            default:
                throw new IllegalStateException("Unmapped room registration rule: " + rule);
        }
    }
}
