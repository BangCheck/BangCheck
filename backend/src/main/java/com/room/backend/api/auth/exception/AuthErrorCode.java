package com.room.backend.api.auth.exception;

import com.room.backend.global.common.exception.BaseErrorCode;
import org.springframework.http.HttpStatus;

public enum AuthErrorCode implements BaseErrorCode {

    INVALID_PROVIDER(HttpStatus.BAD_REQUEST, "AUTH_40001", "Invalid OAuth provider."),
    INVALID_STATE(HttpStatus.BAD_REQUEST, "AUTH_40002", "Invalid or expired OAuth state."),
    MISSING_REFRESH_TOKEN(HttpStatus.BAD_REQUEST, "AUTH_40004", "Missing refresh token."),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH_40101", "Unauthorized."),
    ACCESS_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "AUTH_40102", "Access token has expired. Please re-login."),
    INVALID_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_40103", "Invalid access token."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_40104", "Invalid refresh token."),
    REFRESH_TOKEN_MISMATCH(HttpStatus.UNAUTHORIZED, "AUTH_40105", "Refresh token mismatch."),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "AUTH_40401", "User not found."),

    OAUTH_USER_DENIED(HttpStatus.BAD_REQUEST, "AUTH_40005", "OAuth login was denied by the user."),
    OAUTH_EMAIL_NOT_PROVIDED(HttpStatus.BAD_REQUEST, "AUTH_40006", "Email is required but was not provided by the OAuth provider."),

    DUPLICATE_EMAIL_DIFFERENT_PROVIDER(HttpStatus.CONFLICT, "AUTH_40901", "An account with this email already exists using a different social provider."),

    OAUTH_TOKEN_REQUEST_FAILED(HttpStatus.BAD_GATEWAY, "AUTH_50201", "OAuth token request failed."),
    OAUTH_USERINFO_REQUEST_FAILED(HttpStatus.BAD_GATEWAY, "AUTH_50202", "OAuth user info request failed.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    AuthErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    @Override
    public HttpStatus getStatus() {
        return status;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
