package com.room.backend.domain.checklist.entity.enums;

public enum ChecklistCategory {
    BASIC_INFO("기본 정보", 1),
    BUILDING_INFO("건물 정보", 2),
    OPTION("옵션", 3),
    INTERNAL_STATE("내부 상태", 4),
    PROBLEM("문제 요소", 5),
    SAFETY("안전/보안", 6),
    CONVENIENCE("생활 편의", 7),
    ENVIRONMENT("주변 환경", 8);

    private final String description;
    private final int order;

    ChecklistCategory(String description, int order) {
        this.description = description;
        this.order = order;
    }

    public String getDescription() {
        return description;
    }

    public int getOrder() {
        return order;
    }
}
