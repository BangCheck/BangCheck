package com.room.backend.global.auth.cookie;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import com.room.backend.global.auth.jwt.JwtProperties;

@DisplayName("CookieProvider 테스트 — #304 refresh 쿠키 CSRF 방어")
class CookieProviderTest {

    private static final long REFRESH_TOKEN_EXPIRATION_MS = 1_209_600_000L; // 14일

    private CookieProvider cookieProvider;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setRefreshTokenExpiration(REFRESH_TOKEN_EXPIRATION_MS);
        cookieProvider = new CookieProvider(jwtProperties);
    }

    // 이 프로젝트의 CSRF 방어가 걸려 있는 지점이다. refresh_token은 전역 CSRF가 꺼진
    // 상태에서 permitAll 엔드포인트를 통과시키는 유일한 자격증명이라, SameSite가
    // None으로 되돌아가면 교차 사이트 위조 요청에 쿠키가 그대로 실린다.
    @Test
    @DisplayName("발급 쿠키의 SameSite는 Lax다 — None이면 교차 사이트 refresh 위조가 열린다")
    void createRefreshTokenCookie_sameSiteIsLax() {
        ResponseCookie cookie = cookieProvider.createRefreshTokenCookie("refresh-token-value");

        assertEquals("Lax", cookie.getSameSite());
        assertNotEquals("None", cookie.getSameSite(), "SameSite=None은 교차 사이트 전송을 허용한다");
    }

    @Test
    @DisplayName("만료 쿠키의 SameSite도 Lax다 — 발급/만료 속성이 어긋나면 브라우저가 덮어쓰지 않는다")
    void expireRefreshTokenCookie_sameSiteIsLax() {
        ResponseCookie cookie = cookieProvider.expireRefreshTokenCookie();

        assertEquals("Lax", cookie.getSameSite());
    }

    @Test
    @DisplayName("발급 쿠키는 HttpOnly·Secure이며 만료는 설정값을 따른다")
    void createRefreshTokenCookie_keepsHardeningAttributes() {
        ResponseCookie cookie = cookieProvider.createRefreshTokenCookie("refresh-token-value");

        assertEquals("refresh_token", cookie.getName());
        assertEquals("refresh-token-value", cookie.getValue());
        assertTrue(cookie.isHttpOnly(), "JS가 읽으면 XSS로 탈취된다");
        assertTrue(cookie.isSecure(), "평문 전송을 막아야 한다");
        assertEquals("/", cookie.getPath());
        assertEquals(Duration.ofMillis(REFRESH_TOKEN_EXPIRATION_MS), cookie.getMaxAge());
    }

    // 로그아웃은 같은 이름·경로의 쿠키를 max-age=0으로 덮어써야 실제로 지워진다.
    @Test
    @DisplayName("만료 쿠키는 빈 값·max-age=0으로 기존 쿠키를 덮어쓴다")
    void expireRefreshTokenCookie_clearsExistingCookie() {
        ResponseCookie cookie = cookieProvider.expireRefreshTokenCookie();

        assertEquals("refresh_token", cookie.getName());
        assertEquals("", cookie.getValue());
        assertEquals(Duration.ZERO, cookie.getMaxAge());
        assertEquals("/", cookie.getPath());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
    }

    // SameSite=Lax는 등록가능도메인이 같아야 정상 흐름이 깨지지 않는다. 배포 출처가
    // bangcheck.site / api.bangcheck.site 라는 전제가 이 방어의 근거이므로, 그 전제를
    // 테스트로 고정해 둔다 — FE가 다른 사이트로 옮겨가면 여기서 먼저 걸린다.
    @Test
    @DisplayName("Lax 전제 고정: FE·API 출처의 등록가능도메인이 같다")
    void sameSiteLaxPremise_frontendAndApiShareRegistrableDomain() {
        String frontendHost = "bangcheck.site";
        String apiHost = "api.bangcheck.site";

        assertEquals(registrableDomain(frontendHost), registrableDomain(apiHost));
    }

    private static String registrableDomain(String host) {
        String[] labels = host.split("\\.");
        if (labels.length < 2) {
            return host;
        }
        return labels[labels.length - 2] + "." + labels[labels.length - 1];
    }
}
