package com.room.backend.global.auth.oauth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthStateService {

    private static final String STATE_PREFIX = "OAUTH_STATE:";
    private static final long STATE_TTL_MINUTES = 5;

    private final ConcurrentMap<String, Long> stateStore = new ConcurrentHashMap<>();

    public String generateState() {
        String state = UUID.randomUUID().toString();
        String key = STATE_PREFIX + state;

        long expiresAt = Instant.now().plusSeconds(STATE_TTL_MINUTES * 60).toEpochMilli();
        stateStore.put(key, expiresAt);

        log.debug("OAuth state created: {}", state);
        return state;
    }

    public boolean validateAndDeleteState(String state) {
        if (state == null || state.isBlank()) {
            log.warn("OAuth state validation failed: empty state");
            return false;
        }

        String key = STATE_PREFIX + state;
        Long expiresAt = stateStore.remove(key);

        if (expiresAt == null) {
            log.warn("OAuth state validation failed: state not found - {}", state);
            return false;
        }

        if (Instant.now().toEpochMilli() >= expiresAt) {
            log.warn("OAuth state validation failed: expired state - {}", state);
            return false;
        }

        log.debug("OAuth state validated: {}", state);
        return true;
    }
}
