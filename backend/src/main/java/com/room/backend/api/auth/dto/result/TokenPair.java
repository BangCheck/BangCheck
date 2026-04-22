package com.room.backend.api.auth.dto.result;

/**
 * ?좏겙 ?섏뼱 (Access Token + Refresh Token)
 */
public record TokenPair(
        String accessToken,
        String refreshToken
) {}
