package com.room.backend.global.auth.jwt;

import com.room.backend.domain.user.entity.RefreshToken;
import com.room.backend.domain.user.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public void saveRefreshToken(Long userId, String refreshToken) {
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000);

        refreshTokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        existing -> existing.update(refreshToken, expiresAt),
                        () -> refreshTokenRepository.save(RefreshToken.of(userId, refreshToken, expiresAt))
                );

        log.info("Refresh Token saved - userId: {}", userId);
    }

    @Transactional(readOnly = true)
    public String getRefreshToken(Long userId) {
        return refreshTokenRepository.findByUserId(userId)
                .filter(rt -> !rt.isExpired())
                .map(RefreshToken::getToken)
                .orElse(null);
    }

    @Transactional
    public void deleteRefreshToken(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("Refresh Token deleted - userId: {}", userId);
    }

    @Transactional(readOnly = true)
    public boolean validateRefreshToken(Long userId, String refreshToken) {
        String savedToken = getRefreshToken(userId);
        return savedToken != null && savedToken.equals(refreshToken);
    }
}