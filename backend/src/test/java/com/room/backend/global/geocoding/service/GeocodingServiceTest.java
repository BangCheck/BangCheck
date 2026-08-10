package com.room.backend.global.geocoding.service;

import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.GeocodingErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.net.SocketTimeoutException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@DisplayName("GeocodingService 에러 매핑 (BC-REG-04)")
class GeocodingServiceTest {

    private RestClient.Builder builder;
    private MockRestServiceServer server;
    private GeocodingService service;

    @BeforeEach
    void setUp() {
        builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        RestClient client = builder.build();
        service = new GeocodingService(client, "test-id", "test-secret");
    }

    @Test
    @DisplayName("업스트림 5xx는 502 GEOCODING_PROVIDER로 재매핑된다")
    void mapsUpstreamServerErrorTo502() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("map-geocode")))
                .andRespond(withServerError().body("boom"));

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getCoordinates("서울시 어딘가"));

        assertEquals(GeocodingErrorCode.PROVIDER_ERROR, ex.getErrorCode());
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getErrorCode().getStatus());
    }

    @Test
    @DisplayName("업스트림 4xx(인증 실패)도 502 GEOCODING_PROVIDER로 재매핑된다")
    void mapsUpstreamClientErrorTo502() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("map-geocode")))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("nope"));

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getCoordinates("서울시 어딘가"));

        assertEquals(GeocodingErrorCode.PROVIDER_ERROR, ex.getErrorCode());
    }

    @Test
    @DisplayName("I/O 실패(timeout 등)는 503 GEOCODING_UNAVAILABLE로 재매핑된다")
    void mapsIoFailureTo503() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("map-geocode")))
                .andRespond(request -> { throw new SocketTimeoutException("read timed out"); });

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getCoordinates("서울시 어딘가"));

        assertEquals(GeocodingErrorCode.PROVIDER_UNAVAILABLE, ex.getErrorCode());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getErrorCode().getStatus());
    }
}
