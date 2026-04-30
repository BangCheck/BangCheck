package com.room.backend.global.auth.oauth.service;

import com.room.backend.api.auth.exception.AuthErrorCode;
import com.room.backend.global.auth.oauth.client.OAuthTokenClient;
import com.room.backend.global.auth.oauth.client.OAuthUserInfoClient;
import com.room.backend.global.auth.oauth.dto.google.GoogleOAuthProperties;
import com.room.backend.global.auth.oauth.dto.google.GoogleUserInfoResponseDTO;
import com.room.backend.global.auth.oauth.dto.naver.NaverOAuthProperties;
import com.room.backend.global.auth.oauth.dto.naver.NaverUserInfoResponseDTO;
import com.room.backend.global.auth.oauth.dto.oauth.OAuthAuthorizeResponseDTO;
import com.room.backend.global.auth.oauth.dto.oauth.OAuthCallbackUserInfoResponseDTO;
import com.room.backend.global.auth.oauth.dto.oauth.OAuthTokenResponseDTO;
import com.room.backend.global.common.exception.GeneralException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthService {

    private final NaverOAuthProperties naverProps;
    private final GoogleOAuthProperties googleProps;

    private final OAuthTokenClient tokenClient;
    private final OAuthUserInfoClient userInfoClient;

    private final OAuthStateService oAuthStateService;


    public OAuthAuthorizeResponseDTO buildAuthorizeUrl(String provider) {
        String state = oAuthStateService.generateState();

        String url = switch (provider) {
            case "naver" -> UriComponentsBuilder
                .fromUriString(naverProps.authorizeUri())
                .queryParam("client_id", naverProps.clientId())
                .queryParam("redirect_uri", naverProps.redirectUri())
                    .queryParam("response_type", "code")
                    .queryParam("state", state)
                    .build()
                    .toUriString();

            case "google" -> UriComponentsBuilder
                    .fromUriString(googleProps.authorizeUri())
                    .queryParam("client_id", googleProps.clientId())
                    .queryParam("redirect_uri", googleProps.redirectUri())
                    .queryParam("response_type", "code")
                    .queryParam("scope", googleProps.scope())
                    .queryParam("access_type", "offline")
                    .queryParam("prompt", "consent")
                    .queryParam("state", state)
                    .build()
                    .encode()
                    .toUriString();

            default -> throw new GeneralException(AuthErrorCode.INVALID_PROVIDER);
        };

        return new OAuthAuthorizeResponseDTO(url, LocalDateTime.now());
    }

    
    public void validateState(String state) {
        if (!oAuthStateService.validateAndDeleteState(state)) {
            throw new GeneralException(AuthErrorCode.INVALID_STATE);
        }
    }

  
    public OAuthCallbackUserInfoResponseDTO handleCallback(String provider, String code, String state) {
        if ("naver".equals(provider)) {
            return handleNaverCallback(code, state);
        }

        if ("google".equals(provider)) {
            return handleGoogleCallback(code);
        }

        throw new GeneralException(AuthErrorCode.INVALID_PROVIDER);
    }

    private OAuthCallbackUserInfoResponseDTO handleNaverCallback(String code, String state) {
        OAuthTokenResponseDTO token;
        try {
            token = tokenClient.exchangeNaverCodeForToken(code, state);
        } catch (Exception e) {
            throw new GeneralException(AuthErrorCode.OAUTH_TOKEN_REQUEST_FAILED);
        }

        NaverUserInfoResponseDTO userInfo;
        try {
            userInfo = userInfoClient.fetchNaverUserInfo(token.accessToken());
        } catch (Exception e) {
            throw new GeneralException(AuthErrorCode.OAUTH_USERINFO_REQUEST_FAILED);
        }

        if (userInfo.response() == null || userInfo.response().id() == null) {
            throw new GeneralException(AuthErrorCode.OAUTH_USERINFO_REQUEST_FAILED);
        }

        return new OAuthCallbackUserInfoResponseDTO(
                "naver",
                userInfo.response().id(),
                userInfo.response().email(),
                LocalDateTime.now()
        );
    }

    private OAuthCallbackUserInfoResponseDTO handleGoogleCallback(String code) {
        OAuthTokenResponseDTO token;
        try {
            token = tokenClient.exchangeGoogleCodeForToken(code);
        } catch (Exception e) {
            log.error("[OAuth] Google token exchange failed: {}", e.getMessage(), e);
            throw new GeneralException(AuthErrorCode.OAUTH_TOKEN_REQUEST_FAILED);
        }

        GoogleUserInfoResponseDTO userInfo;
        try {
            userInfo = userInfoClient.fetchGoogleUserInfo(token.accessToken());
        } catch (Exception e) {
            log.error("[OAuth] Google userinfo request failed: {}", e.getMessage(), e);
            throw new GeneralException(AuthErrorCode.OAUTH_USERINFO_REQUEST_FAILED);
        }

        return new OAuthCallbackUserInfoResponseDTO(
                "google",
                userInfo.sub(),
                userInfo.email(),
                LocalDateTime.now()
        );
    }
}
