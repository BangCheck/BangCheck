package com.room.backend.global.geocoding.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.GeocodingErrorCode;
import com.room.backend.global.geocoding.dto.GeocodingResponseDTO;

import java.math.BigDecimal;

@Slf4j
@Service
public class GeocodingService {

    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;

    public GeocodingService(
            RestClient restClient,
            @Value("${naver.geocoding.client-id}") String clientId,
            @Value("${naver.geocoding.client-secret}") String clientSecret
    ) {
        this.restClient = restClient;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public BigDecimal[] getCoordinates(String address) {
        GeocodingResponseDTO response;
        try {
            response = restClient.get()
                    .uri("https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query={address}", address)
                    .header("x-ncp-apigw-api-key-id", clientId)
                    .header("x-ncp-apigw-api-key", clientSecret)
                    .retrieve()
                    .body(GeocodingResponseDTO.class);
        } catch (RestClientResponseException e) {
            // 업스트림 4xx·5xx 를 502 로 재매핑한다. 이전에는 GlobalExceptionHandler
            // 포괄 분기가 COMMON_500 으로 만들어 사용자가 원인을 알 수 없었다.
            log.warn("Geocoding provider returned {}", e.getStatusCode(), e);
            throw new GeneralException(GeocodingErrorCode.PROVIDER_ERROR);
        } catch (ResourceAccessException e) {
            // timeout·connection refused 등 I/O 계열은 503 으로 낸다.
            log.warn("Geocoding provider unreachable", e);
            throw new GeneralException(GeocodingErrorCode.PROVIDER_UNAVAILABLE);
        }

        if (response == null || response.getAddresses().isEmpty()) {
            return null;
        }

        GeocodingResponseDTO.Address result = response.getAddresses().get(0);
        BigDecimal lon = new BigDecimal(result.getX());
        BigDecimal lat = new BigDecimal(result.getY());

        return new BigDecimal[]{lat, lon};
    }
}
