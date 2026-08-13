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

    // 덮어쓰기 자체는 SameSite와 무관하다 — 브라우저가 기존 쿠키를 교체하는 기준은
    // (name, domain, path) 뿐이다(RFC 6265bis 저장 모델). 그러니 이 테스트는 기능
    // 요건이 아니라 드리프트 방지다. 발급과 만료가 갈라져 있으면 다음에 속성을
    // 바꿀 때 한쪽만 바뀌고, 그 어긋남은 아무 신호 없이 남는다.
    @Test
    @DisplayName("만료 쿠키의 SameSite도 Lax다 — 발급과 갈라지면 이후 변경에서 한쪽만 바뀐다")
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

}
