package com.room.backend.feature.roomregistration.domain;

/**
 * 도메인 불변식 위반. 프레임워크 타입을 참조하지 않는다.
 */
public final class RoomRegistrationRejected extends RuntimeException {

    private final transient RoomRegistrationRule rule;

    public RoomRegistrationRejected(RoomRegistrationRule rule) {
        super(rule.name());
        this.rule = rule;
    }

    public RoomRegistrationRule rule() {
        return rule;
    }
}
