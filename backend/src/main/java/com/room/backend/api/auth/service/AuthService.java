package com.room.backend.api.auth.service;

import com.room.backend.api.auth.dto.response.OAuthCallbackResponseDTO;
import com.room.backend.api.auth.dto.result.OAuthCallbackResult;
import com.room.backend.api.auth.dto.result.TokenPair;
import com.room.backend.api.auth.exception.AuthErrorCode;
import com.room.backend.domain.user.entity.User;
import com.room.backend.domain.user.entity.enums.Provider;
import com.room.backend.domain.user.repository.UserRepository;
import com.room.backend.global.auth.jwt.JwtProvider;
import com.room.backend.global.auth.jwt.JwtService;
import com.room.backend.global.auth.oauth.dto.oauth.OAuthCallbackUserInfoResponseDTO;
import com.room.backend.global.auth.oauth.service.OAuthService;
import com.room.backend.global.common.exception.GeneralException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final JwtService jwtService;
    private final OAuthService oAuthService;

    @Transactional
    public OAuthCallbackResult handleOAuthCallback(String provider, String code, String state) {
        OAuthCallbackUserInfoResponseDTO oauthInfo = oAuthService.handleCallback(provider, code, state);

        if (oauthInfo.email() == null || oauthInfo.email().isBlank()) {
            throw new GeneralException(AuthErrorCode.OAUTH_EMAIL_NOT_PROVIDED);
        }

        Provider providerEnum = Provider.valueOf(oauthInfo.provider().toUpperCase());

        userRepository.findByEmailAndProviderNotAndIsDeletedFalse(oauthInfo.email(), providerEnum)
                .ifPresent(u -> { throw new GeneralException(AuthErrorCode.DUPLICATE_EMAIL_DIFFERENT_PROVIDER); });

        Optional<User> activeUser = userRepository.findByProviderAndProviderIdAndIsDeletedFalse(
                providerEnum,
                oauthInfo.providerUserId()
        );

        if (activeUser.isPresent()) {
            User user = activeUser.get();
            // 최신 프로필 정보로 업데이트
            if (oauthInfo.profileImageUrl() != null && !oauthInfo.profileImageUrl().isBlank()) {
                user.updateProfileImageUrl(oauthInfo.profileImageUrl());
            }
            return issueJwtAndReturn(user, "Existing user login success", false, false);
        }

        Optional<User> deletedUser = userRepository.findByProviderAndProviderIdAndIsDeletedTrue(
                providerEnum,
                oauthInfo.providerUserId()
        );

        if (deletedUser.isPresent()) {
            User user = deletedUser.get();
            user.reactivate();
            // 최신 프로필 정보로 업데이트
            if (oauthInfo.profileImageUrl() != null && !oauthInfo.profileImageUrl().isBlank()) {
                user.updateProfileImageUrl(oauthInfo.profileImageUrl());
            }
            return issueJwtAndReturn(user, "Deleted user reactivated and login success", false, true);
        }

        String nickname = oauthInfo.nickname() != null && !oauthInfo.nickname().isBlank() 
                ? oauthInfo.nickname() 
                : buildDefaultNickname(providerEnum, oauthInfo.providerUserId());
        
        User newUser = User.signUpUser(providerEnum, oauthInfo.providerUserId(), oauthInfo.email(), nickname, oauthInfo.profileImageUrl());
        userRepository.save(newUser);

        return issueJwtAndReturn(newUser, "New social user auto-registered and login success", true, false);
    }

    @Transactional
    public TokenPair refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new GeneralException(AuthErrorCode.MISSING_REFRESH_TOKEN);
        }

        if (!jwtProvider.validateToken(refreshToken)) {
            throw new GeneralException(AuthErrorCode.INVALID_REFRESH_TOKEN);
        }

        Long userId = jwtProvider.getUserIdFromToken(refreshToken);

        if (!jwtService.validateRefreshToken(userId, refreshToken)) {
            throw new GeneralException(AuthErrorCode.REFRESH_TOKEN_MISMATCH);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GeneralException(AuthErrorCode.USER_NOT_FOUND));

        String newAccessToken = jwtProvider.generateAccessToken(user);
        String newRefreshToken = jwtProvider.generateRefreshToken(user);

        jwtService.saveRefreshToken(userId, newRefreshToken);

        return new TokenPair(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(Long userId) {
        jwtService.deleteRefreshToken(userId);
    }

    private OAuthCallbackResult issueJwtAndReturn(User user, String logMessage, boolean isNew, boolean isReactivated) {
        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        jwtService.saveRefreshToken(user.getId(), refreshToken);
        log.info("{} - userId: {}", logMessage, user.getId());

        OAuthCallbackResponseDTO response = isNew
                ? OAuthCallbackResponseDTO.registered(user.getId().toString(), user.getEmail(), user.getNickname(), user.getProfileImageUrl())
                : isReactivated
                        ? OAuthCallbackResponseDTO.reactivated(user.getId().toString(), user.getEmail(), user.getNickname(), user.getProfileImageUrl())
                        : OAuthCallbackResponseDTO.login(user.getId().toString(), user.getEmail(), user.getNickname(), user.getProfileImageUrl());

        return new OAuthCallbackResult(isNew, accessToken, refreshToken, response);
    }

    private String buildDefaultNickname(Provider provider, String providerUserId) {
        String prefix = provider.name().toLowerCase();
        String suffix = providerUserId.length() <= 6
                ? providerUserId
                : providerUserId.substring(providerUserId.length() - 6);
        return (prefix + "_" + suffix).substring(0, Math.min(10, (prefix + "_" + suffix).length()));
    }
}
