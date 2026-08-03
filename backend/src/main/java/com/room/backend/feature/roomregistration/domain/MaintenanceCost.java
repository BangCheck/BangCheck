package com.room.backend.feature.roomregistration.domain;

/**
 * 관리비 상태. legacy가 {@code maintenanceStatus}를 파생하던 규칙을 타입으로 고정한다.
 */
public sealed interface MaintenanceCost {

    /** 사용자가 "관리비 모름"을 선택함 — 금액을 저장하지 않는다. */
    record Unknown() implements MaintenanceCost {
    }

    /** 금액이 입력됨. */
    record Included(int monthlyFee) implements MaintenanceCost {
    }

    /** 모름도 아니고 금액도 없음. */
    record None() implements MaintenanceCost {
    }

    static MaintenanceCost of(Boolean declaredUnknown, Integer monthlyFee) {
        if (Boolean.TRUE.equals(declaredUnknown)) {
            return new Unknown();
        }
        return monthlyFee != null ? new Included(monthlyFee) : new None();
    }

    /** 저장될 관리비. 모름이면 null. */
    default Integer storedFee() {
        return this instanceof Included included ? included.monthlyFee() : null;
    }

    /** 저장될 "모름" 플래그. legacy는 null을 false로 정규화한다. */
    default boolean unknownFlag() {
        return this instanceof Unknown;
    }
}
