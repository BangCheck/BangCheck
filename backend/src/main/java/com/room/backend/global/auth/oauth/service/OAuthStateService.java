package com.room.backend.global.auth.oauth.service;

import com.room.backend.global.auth.jwt.JwtProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthStateService {

    private static final long STATE_TTL_MINUTES = 5;

    private final JwtProperties jwtProperties;

    public String generateState() {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(STATE_TTL_MINUTES * 60);
        String nonce = UUID.randomUUID().toString();

        String state = Jwts.builder()
                .setSubject(nonce)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiresAt))
                .signWith(getSigningKey())
                .compact();

        log.debug("OAuth state created: {}", nonce);
        return state;
    }

    public boolean validateAndDeleteState(String state) {
        if (state == null || state.isBlank()) {
            log.warn("OAuth state validation failed: empty state");
            return false;
        }

        try {
            String nonce = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(state)
                    .getBody()
                    .getSubject();

            if (nonce == null || nonce.isBlank()) {
                log.warn("OAuth state validation failed: missing nonce");
                return false;
            }

            log.debug("OAuth state validated: {}", nonce);
            return true;
        } catch (Exception e) {
            log.warn("OAuth state validation failed: {}", e.getMessage());
            return false;
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecretKey().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
