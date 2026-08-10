package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum GeocodingErrorCode implements BaseErrorCode {

    ADDRESS_NOT_FOUND(HttpStatus.BAD_REQUEST, "GEOCODING_400", "주소를 찾을 수 없습니다."),
    PROVIDER_ERROR(HttpStatus.BAD_GATEWAY, "GEOCODING_502_PROVIDER", "지오코딩 제공자가 오류를 돌려주었습니다."),
    PROVIDER_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "GEOCODING_503_UNAVAILABLE", "지오코딩 제공자에 접속할 수 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    GeocodingErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override public HttpStatus getStatus() { return status; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
