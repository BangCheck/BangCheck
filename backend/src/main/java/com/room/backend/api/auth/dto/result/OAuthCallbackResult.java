package com.room.backend.api.auth.dto.result;

import com.room.backend.api.auth.dto.response.OAuthCallbackResponseDTO;

public record OAuthCallbackResult(
        boolean isRegistered,
        String accessToken,
        String refreshToken,
        OAuthCallbackResponseDTO response
) {}
