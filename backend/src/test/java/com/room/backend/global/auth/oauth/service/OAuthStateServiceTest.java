package com.room.backend.global.auth.oauth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.room.backend.global.auth.jwt.JwtProperties;

@DisplayName("OAuthStateService 테스트 — BC-AUTH-01")
class OAuthStateServiceTest {

    // HS256은 최소 256bit(32byte) 키를 요구한다.
    private static final String TEST_SECRET_KEY = "test-secret-key-for-oauth-state-service-1234567890";

    private OAuthStateService oAuthStateService;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setSecretKey(TEST_SECRET_KEY);
        oAuthStateService = new OAuthStateService(jwtProperties);
    }

    @Test
    @DisplayName("생성 직후 최초 검증은 통과한다")
    void validateAndDeleteState_firstUse_returnsTrue() {
        String state = oAuthStateService.generateState();

        assertTrue(oAuthStateService.validateAndDeleteState(state));
    }

    @Test
    @DisplayName("BC-AUTH-01: 같은 state를 두 번째로 제출하면 거부된다 — 재사용 방지")
    void validateAndDeleteState_secondUse_returnsFalse() {
        String state = oAuthStateService.generateState();

        boolean first = oAuthStateService.validateAndDeleteState(state);
        boolean second = oAuthStateService.validateAndDeleteState(state);

        assertTrue(first, "최초 검증은 통과해야 한다");
        assertFalse(second, "동일 state 재사용은 거부되어야 한다");
    }

    @Test
    @DisplayName("null·빈 문자열 state는 거부된다")
    void validateAndDeleteState_blank_returnsFalse() {
        assertFalse(oAuthStateService.validateAndDeleteState(null));
        assertFalse(oAuthStateService.validateAndDeleteState(""));
        assertFalse(oAuthStateService.validateAndDeleteState("   "));
    }

    @Test
    @DisplayName("서명이 다르거나 형식이 깨진 state는 거부된다")
    void validateAndDeleteState_malformed_returnsFalse() {
        assertFalse(oAuthStateService.validateAndDeleteState("not-a-jwt"));
    }

    @Test
    @DisplayName("서로 다른 state는 각각 독립적으로 1회씩 통과한다")
    void validateAndDeleteState_differentStates_eachConsumedIndependently() {
        String stateA = oAuthStateService.generateState();
        String stateB = oAuthStateService.generateState();

        assertTrue(oAuthStateService.validateAndDeleteState(stateA));
        assertTrue(oAuthStateService.validateAndDeleteState(stateB));
        assertFalse(oAuthStateService.validateAndDeleteState(stateA));
        assertFalse(oAuthStateService.validateAndDeleteState(stateB));
    }

    @Test
    @DisplayName("동시 요청 경합에서도 같은 state는 정확히 한 번만 통과한다 — putIfAbsent 원자성 검증")
    void validateAndDeleteState_concurrentSameState_exactlyOneWins() throws InterruptedException {
        String state = oAuthStateService.generateState();
        int threadCount = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch ready = new CountDownLatch(threadCount);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);

        try {
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    ready.countDown();
                    try {
                        start.await();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                    if (oAuthStateService.validateAndDeleteState(state)) {
                        successCount.incrementAndGet();
                    }
                });
            }

            ready.await();
            start.countDown();
            executor.shutdown();
            assertTrue(executor.awaitTermination(5, TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }

        assertEquals(1, successCount.get(), "동시에 50개 요청이 같은 state를 제출해도 정확히 1개만 통과해야 한다");
    }
}
