package com.room.backend.global.auth.cookie;

import com.room.backend.global.auth.jwt.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class CookieProvider {

    // refresh_token은 전역 CSRF가 꺼져 있는 상태에서 쿠키만으로 토큰을 회전시키는
    // 유일한 자격증명이다(POST /api/v1/auth/jwt/refresh는 permitAll). 따라서 이 쿠키가
    // 교차 사이트 요청에 실려 나가는 순간 그 엔드포인트는 CSRF에 그대로 노출된다.
    //
    // SameSite=None이었던 이유는 FE가 다른 사이트에 있다는 전제였는데, 실제 배포는
    // FE https://bangcheck.site · API https://api.bangcheck.site 로 등록가능도메인이
    // 같다 — cross-origin이지만 same-site다. SameSite는 origin이 아니라 site 기준이므로
    // Lax로 내려도 정상 refresh는 그대로 동작하고, 교차 사이트 위조 요청에는 쿠키가
    // 실리지 않는다. 운영에서 SameSite=None을 유지할 이유가 없다.
    //
    // 주의: Lax는 쿠키의 "전송"만 제한하고 "저장"은 막지 않는다. OAuth callback이
    // 쿠키를 심는 로그인 CSRF는 이 변경으로 닫히지 않으며, state를 개시 브라우저에
    // 묶어야 한다 — 별도 이슈에서 다룬다.
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final String SAME_SITE = "Lax";

    private final JwtProperties jwtProperties;

    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofMillis(jwtProperties.getRefreshTokenExpiration()))
                .sameSite(SAME_SITE)
                .build();
    }

    public ResponseCookie expireRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite(SAME_SITE)
                .build();
    }
}
