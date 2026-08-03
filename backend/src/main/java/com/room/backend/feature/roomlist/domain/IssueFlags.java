package com.room.backend.feature.roomlist.domain;

import java.util.Map;

/**
 * 방 하나의 문제 뱃지 상태.
 *
 * <p>[계약 보존] 답변이 없거나 항목을 못 찾은 주제는 legacy와 동일하게 {@code false}다.
 * "확인 안 함"과 "문제 없음"을 구분하지 않는 현행 동작이며 결함 BC-LIST-02로 등록했다.
 */
public record IssueFlags(
        boolean mold,
        boolean leak,
        boolean bug,
        boolean drainSmell,
        boolean condensation) {

    public static IssueFlags none() {
        return new IssueFlags(false, false, false, false, false);
    }

    /**
     * 체크리스트 <b>항목 이름</b>으로 키가 잡힌 맵에서 뱃지를 만든다.
     *
     * <p>legacy가 {@code issueMap.getOrDefault("곰팡이", false)}로 읽던 것과 동일하다.
     * 맵 의미(같은 이름이 두 번 들어오면 나중 값이 이긴다)까지 그대로 유지하려고 Set이 아니라
     * 맵을 받는다.
     */
    public static IssueFlags fromItemNameFlags(Map<String, Boolean> flagsByItemName) {
        return new IssueFlags(
                flag(flagsByItemName, IssueTopic.MOLD),
                flag(flagsByItemName, IssueTopic.LEAK),
                flag(flagsByItemName, IssueTopic.BUG),
                flag(flagsByItemName, IssueTopic.DRAIN_SMELL),
                flag(flagsByItemName, IssueTopic.CONDENSATION));
    }

    private static boolean flag(Map<String, Boolean> flagsByItemName, IssueTopic topic) {
        return flagsByItemName.getOrDefault(topic.seedItemName(), false);
    }
}
