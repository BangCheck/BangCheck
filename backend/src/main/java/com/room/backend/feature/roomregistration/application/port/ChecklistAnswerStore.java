package com.room.backend.feature.roomregistration.application.port;

import com.room.backend.feature.roomregistration.domain.ChecklistAnswer;

import java.util.List;

/**
 * 체크리스트 답변 영속화 side-effect port.
 */
public interface ChecklistAnswerStore {

    void saveAll(long roomId, List<ChecklistAnswer> answers);
}
