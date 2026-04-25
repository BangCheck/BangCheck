package com.room.backend.api.auth.dto.response;

import java.time.LocalDateTime;

public record OAuthCallbackResponseDTO(
        OAuthResultType resultType,
        String id,
        String email,
        String nickname,
        String profileImageUrl,
        LocalDateTime createdAt
) {
    public static OAuthCallbackResponseDTO registered(String id, String email, String nickname, String profileImageUrl) {
        return new OAuthCallbackResponseDTO(OAuthResultType.REGISTERED, id, email, nickname, profileImageUrl, LocalDateTime.now());
    }

    public static OAuthCallbackResponseDTO login(String id, String email, String nickname, String profileImageUrl) {
        return new OAuthCallbackResponseDTO(OAuthResultType.LOGIN, id, email, nickname, profileImageUrl, LocalDateTime.now());
    }

    public static OAuthCallbackResponseDTO reactivated(String id, String email, String nickname, String profileImageUrl) {
        return new OAuthCallbackResponseDTO(OAuthResultType.REACTIVATED, id, email, nickname, profileImageUrl, LocalDateTime.now());
    }
}
