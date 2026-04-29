package com.room.backend.api.auth.dto.response;

import java.time.LocalDateTime;

public record GuestTokenResponseDTO(
        String guestId,
        String accessToken,
        LocalDateTime createdAt
) {
    public static GuestTokenResponseDTO of(String guestId, String accessToken) {
        return new GuestTokenResponseDTO(guestId, accessToken, LocalDateTime.now());
    }
}