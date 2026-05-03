package com.room.backend.global.geocoding.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.room.backend.global.common.exception.GeocodingErrorCode;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.geocoding.dto.GeocodingResponseDTO;

import java.math.BigDecimal;

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
        GeocodingResponseDTO response = restClient.get()
                .uri("https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query={address}", address)
                .header("x-ncp-apigw-api-key-id", clientId)
                .header("x-ncp-apigw-api-key", clientSecret)
                .retrieve()
                .body(GeocodingResponseDTO.class);

        if (response == null || response.getAddresses().isEmpty()) {
            throw new GeneralException(GeocodingErrorCode.ADDRESS_NOT_FOUND);
        }

        GeocodingResponseDTO.Address result = response.getAddresses().get(0);
        BigDecimal lon = new BigDecimal(result.getX());
        BigDecimal lat = new BigDecimal(result.getY());

        return new BigDecimal[]{lat, lon};
    }
}
