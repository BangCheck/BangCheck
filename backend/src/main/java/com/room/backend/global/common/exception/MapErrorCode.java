package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum MapErrorCode implements BaseErrorCode {

    MAP_POINT_NOT_FOUND(HttpStatus.NOT_FOUND, "MAP_404", "기준점을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    MapErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override public HttpStatus getStatus() { return status; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
