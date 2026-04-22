package com.room.backend.domain.user.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Provider {

    NAVER("Naver"),
    GOOGLE("Google");

    private final String description;
}
