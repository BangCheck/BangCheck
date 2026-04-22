package com.room.backend.global.auth.oauth.dto.google;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleUserInfoResponseDTO(
        String sub,
        String email
) {}
