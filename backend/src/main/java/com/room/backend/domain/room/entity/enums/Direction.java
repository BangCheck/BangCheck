package com.room.backend.domain.room.entity.enums;

import lombok.Getter;

@Getter
public enum Direction {
    EAST("동향"),
    WEST("서향"),
    SOUTH("남향"),
    NORTH("북향"),
    UNKNOWN("모름");

    private final String description;

    Direction(String description) {
        this.description = description;
    }
}
