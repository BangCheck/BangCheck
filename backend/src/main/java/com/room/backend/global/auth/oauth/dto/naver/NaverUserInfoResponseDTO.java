package com.room.backend.global.auth.oauth.dto.naver;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NaverUserInfoResponseDTO(
        String resultcode,
        String message,
        NaverProfile response
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record NaverProfile(
            String id,
            String email,
            String name
    ) {}
}
