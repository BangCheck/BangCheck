package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum RoomErrorCode implements BaseErrorCode {

    ROOM_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "ROOM_400_LIMIT", "방은 최대 6개까지 등록할 수 있습니다."),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_404", "방을 찾을 수 없습니다."),
    JEONSE_DEPOSIT_REQUIRED(HttpStatus.BAD_REQUEST, "ROOM_400_JEONSE_DEPOSIT", "전세는 보증금이 필수입니다."),
    MONTHLY_RENT_REQUIRED(HttpStatus.BAD_REQUEST, "ROOM_400_MONTHLY_RENT", "월세는 월세 금액이 필수입니다."),
    LOAN_AMOUNT_REQUIRED(HttpStatus.BAD_REQUEST, "ROOM_400_LOAN_AMOUNT", "융자가 있는 경우 금액은 필수입니다.");
    

    private final HttpStatus status;
    private final String code;
    private final String message;

    RoomErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override public HttpStatus getStatus() { return status; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
