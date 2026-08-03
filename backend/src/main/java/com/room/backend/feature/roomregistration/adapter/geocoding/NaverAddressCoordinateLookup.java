package com.room.backend.feature.roomregistration.adapter.geocoding;

import com.room.backend.feature.roomregistration.application.port.AddressCoordinateLookup;
import com.room.backend.feature.roomregistration.domain.Coordinates;
import com.room.backend.global.geocoding.service.GeocodingService;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * 기존 {@link GeocodingService}에 위임하는 좌표 조회 adapter.
 *
 * <p>[계약 보존] provider 오류를 잡지 않는다. legacy도 {@code RestClient} 예외를 그대로 흘려보내
 * {@code GlobalExceptionHandler}의 마지막 분기에서 HTTP 500 {@code COMMON_500}이 된다.
 * 이 미래핑은 알려진 P1 결함({@code silent-500-geocoding})이며 이 리팩토링에서 고치지 않는다.
 */
public final class NaverAddressCoordinateLookup implements AddressCoordinateLookup {

    private final GeocodingService geocodingService;

    public NaverAddressCoordinateLookup(GeocodingService geocodingService) {
        this.geocodingService = geocodingService;
    }

    @Override
    public Optional<Coordinates> findFor(String address) {
        BigDecimal[] resolved = geocodingService.getCoordinates(address);
        if (resolved == null) {
            return Optional.empty();
        }
        return Optional.of(new Coordinates(resolved[0], resolved[1]));
    }
}
