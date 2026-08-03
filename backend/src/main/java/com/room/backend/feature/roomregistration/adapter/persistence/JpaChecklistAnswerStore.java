package com.room.backend.feature.roomregistration.adapter.persistence;

import com.room.backend.feature.roomregistration.application.port.ChecklistAnswerStore;
import com.room.backend.feature.roomregistration.domain.ChecklistAnswer;
import com.room.backend.feature.shared.checklist.ChecklistAnswerPersistence;
import com.room.backend.feature.shared.checklist.PersistableChecklistAnswer;

import java.util.List;

/**
 * 기존 checklist repository에 위임하는 답변 영속화 adapter.
 *
 * <p>[계약 보존] legacy {@code RoomCheckResultService.saveCheckResult}와 저장 순서·건수가 같다.
 * item/option의 존재나 관계를 선검증하지 않으며, 위반은 DB FK·unique 제약이 판정해
 * {@code DataIntegrityViolationException} → HTTP 409로 이어진다.
 */
public final class JpaChecklistAnswerStore implements ChecklistAnswerStore {

    private final ChecklistAnswerPersistence persistence;

    public JpaChecklistAnswerStore(
            ChecklistAnswerPersistence persistence) {
        this.persistence = persistence;
    }

    @Override
    public void saveAll(long roomId, List<ChecklistAnswer> answers) {
        persistence.append(roomId, answers.stream().map(answer -> new PersistableChecklistAnswer(
                answer.itemId(), answer.valueText(), answer.valueNumber(), answer.selectedOptionIds())).toList());
    }
}
