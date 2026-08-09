package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum ReportErrorCode implements BaseErrorCode {

    UNKNOWN_CATEGORY(HttpStatus.BAD_REQUEST, "REPORT_400_UNKNOWN_CATEGORY", "알 수 없는 카테고리 이름입니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ReportErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override public HttpStatus getStatus() { return status; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
