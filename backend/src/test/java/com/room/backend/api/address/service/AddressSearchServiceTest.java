package com.room.backend.api.address.service;

import com.room.backend.global.common.exception.AddressSearchErrorCode;
import com.room.backend.global.common.exception.GeneralException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.net.SocketTimeoutException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

@DisplayName("AddressSearchService 에러 매핑 (BC-ADDR-01)")
class AddressSearchServiceTest {

    private RestClient.Builder builder;
    private MockRestServiceServer server;
    private AddressSearchService service;

    @BeforeEach
    void setUp() {
        builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        RestClient client = builder.build();
        service = new AddressSearchService(client, "test-confm-key");
    }

    @Test
    @DisplayName("업스트림 5xx는 502 ADDRESS_PROVIDER로 재매핑된다")
    void mapsUpstreamServerErrorTo502() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("addrLinkApi.do")))
                .andRespond(withServerError().body("boom"));

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getLegitAddress("서울시 어딘가"));

        assertEquals(AddressSearchErrorCode.PROVIDER_ERROR, ex.getErrorCode());
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getErrorCode().getStatus());
    }

    @Test
    @DisplayName("업스트림 4xx(인증 실패)도 502 ADDRESS_PROVIDER로 재매핑된다")
    void mapsUpstreamClientErrorTo502() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("addrLinkApi.do")))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("nope"));

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getLegitAddress("서울시 어딘가"));

        assertEquals(AddressSearchErrorCode.PROVIDER_ERROR, ex.getErrorCode());
    }

    @Test
    @DisplayName("HTTP 200의 제공자 오류 코드도 502 ADDRESS_PROVIDER로 재매핑된다")
    void mapsApplicationErrorTo502() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("addrLinkApi.do")))
                .andRespond(withSuccess("""
                        {
                          "results": {
                            "common": {
                              "errorCode": "E0001",
                              "errorMessage": "승인되지 않은 KEY 입니다."
                            },
                            "juso": null
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getLegitAddress("서울시 어딘가"));

        assertEquals(AddressSearchErrorCode.PROVIDER_ERROR, ex.getErrorCode());
        assertEquals(HttpStatus.BAD_GATEWAY, ex.getErrorCode().getStatus());
    }

    @Test
    @DisplayName("HTTP 200 정상 응답은 주소 목록으로 변환된다")
    void mapsSuccessfulResponse() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("addrLinkApi.do")))
                .andRespond(withSuccess("""
                        {
                          "results": {
                            "common": {
                              "errorCode": "0",
                              "errorMessage": "정상"
                            },
                            "juso": [{
                              "roadAddr": "서울특별시 중구 세종대로 110",
                              "jibunAddr": "서울특별시 중구 태평로1가 31",
                              "zipNo": "04524"
                            }]
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        var addresses = service.getLegitAddress("서울시 어딘가");

        assertEquals(1, addresses.size());
        assertEquals("서울특별시 중구 세종대로 110", addresses.get(0).getRoadAddr());
        assertEquals("서울특별시 중구 태평로1가 31", addresses.get(0).getJibunAddr());
        assertEquals("04524", addresses.get(0).getZipNo());
    }

    @Test
    @DisplayName("I/O 실패(timeout 등)는 503 ADDRESS_UNAVAILABLE로 재매핑된다")
    void mapsIoFailureTo503() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("addrLinkApi.do")))
                .andRespond(request -> { throw new SocketTimeoutException("read timed out"); });

        GeneralException ex = assertThrows(GeneralException.class,
                () -> service.getLegitAddress("서울시 어딘가"));

        assertEquals(AddressSearchErrorCode.PROVIDER_UNAVAILABLE, ex.getErrorCode());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getErrorCode().getStatus());
    }
}
