package com.room.backend.feature.roomregistration.adapter.web;

import com.room.backend.feature.roomregistration.domain.RoomRegistrationRejected;
import com.room.backend.global.common.exception.BaseErrorCode;
import com.room.backend.global.common.response.ApiResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 도메인 거절을 legacy 오류 계약(PATH A)으로 되돌린다.
 *
 * <p>도메인은 HTTP를 모르므로 {@link RoomRegistrationRejected}를 던진다. 이 advice가 그것을
 * {@link com.room.backend.global.common.exception.RoomErrorCode}로 옮겨 legacy와 동일한
 * status·code·message를 만든다.
 *
 * <p>본문 조립이 {@code GlobalExceptionHandler.handleGeneral}과 두 줄 겹치지만, 예외를 던져
 * advice 체인을 다시 타게 만들 수는 없다. 겹치는 부분은 {@code RoomRegistrationResponseTest}가
 * 아니라 계약 test가 실제 응답으로 지킨다.
 *
 * <p>{@code GlobalExceptionHandler}의 {@code Exception} 포괄 핸들러보다 먼저 평가되어야 한다.
 * 그쪽이 먼저 잡으면 400이 500으로 바뀐다.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class RoomRegistrationExceptionHandler {

    @ExceptionHandler(RoomRegistrationRejected.class)
    public ResponseEntity<ApiResponse<Void>> handle(RoomRegistrationRejected rejected) {
        BaseErrorCode errorCode = RoomRegistrationErrorMapper.toErrorCode(rejected.rule());
        return ResponseEntity.status(errorCode.getStatus())
                .body(ApiResponse.fail(errorCode.getCode(), errorCode.getMessage()));
    }
}
