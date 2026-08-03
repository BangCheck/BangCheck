package com.room.backend.feature.roomlist.domain;

/**
 * 목록에 뱃지로 뜨는 문제 다섯 가지.
 *
 * <p>[계약 보존 · 취약점 노출] 각 주제는 체크리스트 <b>항목 이름 문자열</b>로 시드 데이터와 연결된다.
 * legacy가 {@code issueMap.getOrDefault("곰팡이", false)}처럼 하드코딩하던 것을 그대로 옮겼다.
 * 시드에서 항목 이름이 한 글자라도 바뀌면 해당 뱃지는 조용히 항상 false가 된다.
 * 이 취약성은 결함 BC-LIST-01로 등록했고 이 리팩토링에서 고치지 않는다.
 */
public enum IssueTopic {

    MOLD("곰팡이"),
    LEAK("누수 흔적"),
    BUG("벌레 흔적"),
    DRAIN_SMELL("하수구/곰팡이 냄새"),
    CONDENSATION("습기 / 결로");

    /** legacy가 "문제 없음"으로 취급하는 선택지 값. 이것도 하드코딩 문자열이다. */
    public static final String NO_ISSUE_OPTION_VALUE = "없음";

    private final String seedItemName;

    IssueTopic(String seedItemName) {
        this.seedItemName = seedItemName;
    }

    public String seedItemName() {
        return seedItemName;
    }

    /** 시드 항목 이름으로 주제를 찾는다. 매칭되지 않는 항목은 뱃지에 쓰이지 않는다. */
    public static IssueTopic forSeedItemName(String itemName) {
        for (IssueTopic topic : values()) {
            if (topic.seedItemName.equals(itemName)) {
                return topic;
            }
        }
        return null;
    }
}
