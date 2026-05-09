package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum RoomErrorCode implements BaseErrorCode {

    ROOM_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "ROOM_400_LIMIT", "방은 최대 6개까지 등록할 수 있습니다."),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "ROOM_404", "방을 찾을 수 없습니다.");
    

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
