package com.room.backend.domain.user.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {

    ROLE_ADMIN("ADMIN", "Administrator"),
    ROLE_USER("USER", "User");

    private final String authority;
    private final String description;

    @Override
    public String toString() {
        return description;
    }
}
