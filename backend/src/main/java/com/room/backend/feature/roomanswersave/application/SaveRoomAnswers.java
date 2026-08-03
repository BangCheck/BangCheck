package com.room.backend.feature.roomanswersave.application;

import com.room.backend.feature.roomanswersave.application.port.AnswerSubmissionStore;
import com.room.backend.feature.roomanswersave.domain.AnswerSubmission;
import java.util.List;

/**
 * 이관: {@code RoomCheckResultService.saveCheckResult}의 고아 endpoint 경로 → 이 use case.
 * 현행 소유권 결함은 BC-SEC-01로 별도 추적한다.
 */
public final class SaveRoomAnswers {
    private final AnswerSubmissionStore store;
    public SaveRoomAnswers(AnswerSubmissionStore store) { this.store = store; }
    public void handle(long roomId, List<AnswerSubmission> answers) { store.save(roomId, List.copyOf(answers)); }
}
