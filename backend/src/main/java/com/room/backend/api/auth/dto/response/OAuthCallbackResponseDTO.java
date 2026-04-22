package com.room.backend.api.auth.dto.response;

import java.time.LocalDateTime;

public record OAuthCallbackResponseDTO(
        OAuthResultType resultType,
        LocalDateTime createdAt
) {
    public static OAuthCallbackResponseDTO registered() {
        return new OAuthCallbackResponseDTO(OAuthResultType.REGISTERED, LocalDateTime.now());
    }

    public static OAuthCallbackResponseDTO login() {
        return new OAuthCallbackResponseDTO(OAuthResultType.LOGIN, LocalDateTime.now());
    }

    public static OAuthCallbackResponseDTO reactivated() {
        return new OAuthCallbackResponseDTO(OAuthResultType.REACTIVATED, LocalDateTime.now());
    }
}
