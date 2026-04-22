package com.room.backend.global.auth.oauth.dto.naver;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "oauth.naver")
public record NaverOAuthProperties(
        String clientId,
        String clientSecret,
        String redirectUri,
        String authorizeUri,
        String tokenUri,
        String userInfoUri
) {}
