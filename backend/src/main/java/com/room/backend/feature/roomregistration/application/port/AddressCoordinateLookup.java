package com.room.backend.feature.roomregistration.application.port;

import com.room.backend.feature.roomregistration.domain.Coordinates;

import java.util.Optional;

/**
 * 주소 → 좌표 변환 side-effect port. 외부 provider 호출을 감춘다.
 *
 * <p>결과가 없으면 예외가 아니라 빈 값이다. legacy도 좌표 없이 방을 저장한다.
 */
public interface AddressCoordinateLookup {

    Optional<Coordinates> findFor(String address);
}
