package com.room.backend.global.auth.oauth.service;

import com.room.backend.global.auth.jwt.JwtProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthStateService {

    private static final long STATE_TTL_MINUTES = 10;

    private final JwtProperties jwtProperties;

    // BC-AUTH-01: state(JWT) 자체는 서버에 저장되지 않으므로 서명·만료 검증만으로는
    // "1회성"을 보장할 수 없다 — 같은 state를 TTL 안에서 반복 제출해도 계속 통과했다.
    // 여기서는 "이미 소비된 nonce"만 별도로 기억해 재사용을 막는다.
    //
    // 인메모리로 두는 이유: 배포가 EC2 단일 인스턴스(systemctl 서비스)이고 로드밸런서나
    // 다중 인스턴스가 없어 프로세스 간 상태 공유가 필요 없다. 인스턴스를 늘리게 되면
    // (예: D1 마이그레이션 이후) 이 전제가 깨지므로 Redis 등 외부 저장소로 옮겨야 한다.
    private final Map<String, Instant> consumedNonces = new ConcurrentHashMap<>();

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
                    .setAllowedClockSkewSeconds(60)
                    .build()
                    .parseClaimsJws(state)
                    .getBody()
                    .getSubject();

            if (nonce == null || nonce.isBlank()) {
                log.warn("OAuth state validation failed: missing nonce");
                return false;
            }

            // putIfAbsent는 원자적이다 — 동시에 같은 state로 들어온 두 요청 중
            // 하나만 null을 돌려받아 통과하고, 나머지는 기존 값을 보고 거부된다.
            // get() 후 remove()로 나누면 그 사이에 race가 생긴다.
            if (consumedNonces.putIfAbsent(nonce, Instant.now()) != null) {
                log.warn("OAuth state validation failed: nonce already consumed ({})", nonce);
                return false;
            }

            log.debug("OAuth state validated and consumed: {}", nonce);
            return true;
        } catch (Exception e) {
            log.warn("OAuth state validation failed: {}", e.getMessage());
            return false;
        }
    }

    // JWT 자체가 STATE_TTL_MINUTES가 지나면 파싱 단계에서 만료로 걸러지므로,
    // consumedNonces에도 그 이상 오래 남겨둘 이유가 없다. TTL보다 넉넉한 주기로
    // 한 번씩 쓸어내 메모리가 무한정 늘어나는 것만 막는다.
    @Scheduled(fixedRate = 15, timeUnit = java.util.concurrent.TimeUnit.MINUTES)
    void cleanupExpiredNonces() {
        Instant cutoff = Instant.now().minusSeconds(STATE_TTL_MINUTES * 60);
        int before = consumedNonces.size();
        consumedNonces.values().removeIf(consumedAt -> consumedAt.isBefore(cutoff));
        int removed = before - consumedNonces.size();
        if (removed > 0) {
            log.debug("OAuth state cleanup: removed {} expired nonce(s), {} remaining", removed, consumedNonces.size());
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecretKey().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
