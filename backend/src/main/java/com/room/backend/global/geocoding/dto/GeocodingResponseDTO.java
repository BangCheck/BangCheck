package com.room.backend.global.geocoding.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class GeocodingResponseDTO {

    private List<Address> addresses;
    private String status;
    private String errorMessage;

    @Getter
    @NoArgsConstructor
    public static class Address {
        private String x;           
        private String y;           
        private String roadAddress;
    }
}
