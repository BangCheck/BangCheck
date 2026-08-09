package com.room.backend.global.common.exception;

import org.springframework.http.HttpStatus;

public enum ChecklistErrorCode implements BaseErrorCode {

    CHECKLIST_OPTION_NOT_FOUND(HttpStatus.NOT_FOUND, "CHECKLIST_404_OPTION", "체크리스트 옵션을 찾을 수 없습니다."),
    CHECKLIST_RESULT_NOT_FOUND(HttpStatus.NOT_FOUND, "CHECKLIST_404_RESULT", "체크리스트 답변을 찾을 수 없습니다."),
    CHECKLIST_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "CHECKLIST_404_ITEM", "체크리스트 항목을 찾을 수 없습니다."),
    CUSTOM_ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "CHECKLIST_404_CUSTOM_ITEM", "나만의 체크리스트 항목을 찾을 수 없습니다."),
    CUSTOM_ITEM_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "CHECKLIST_400_CUSTOM_LIMIT", "나만의 항목은 최대 3개까지만 추가 가능합니다."),
    CUSTOM_ITEM_FORBIDDEN(HttpStatus.FORBIDDEN, "CHECKLIST_403_FORBIDDEN", "삭제 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ChecklistErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override public HttpStatus getStatus() { return status; }
    @Override public String getCode() { return code; }
    @Override public String getMessage() { return message; }
}
