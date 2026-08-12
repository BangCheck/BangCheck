package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum AddressSearchErrorCode implements BaseErrorCode {

    PROVIDER_ERROR(HttpStatus.BAD_GATEWAY, "ADDRESS_502_PROVIDER", "주소 검색 제공자가 오류를 돌려주었습니다."),
    PROVIDER_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "ADDRESS_503_UNAVAILABLE", "주소 검색 제공자에 접속할 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    AddressSearchErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override public HttpStatus getStatus() { return status; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
