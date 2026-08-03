package com.room.backend.feature.shared.checklist;

import com.room.backend.domain.checklist.entity.RoomCheckResult;
import com.room.backend.domain.checklist.entity.RoomCheckSelectedOption;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import java.util.List;

/** 7개 operation 이관 후 등록·추가·수정 3곳의 답변 영속화 중복을 추출한 kernel. */
public final class ChecklistAnswerPersistence {
    private final RoomCheckResultRepository results;
    private final RoomCheckSelectedOptionRepository options;
    public ChecklistAnswerPersistence(RoomCheckResultRepository results, RoomCheckSelectedOptionRepository options) {
        this.results = results; this.options = options;
    }
    public void append(long roomId, List<PersistableChecklistAnswer> answers) {
        for (PersistableChecklistAnswer answer : answers) {
            RoomCheckResult result = results.save(RoomCheckResult.create(
                    roomId, answer.itemId(), answer.valueText(), answer.valueNumber()));
            for (Long optionId : answer.optionIds()) options.save(RoomCheckSelectedOption.create(result.getId(), optionId));
        }
    }
    public void replace(long roomId, List<PersistableChecklistAnswer> answers) {
        for (RoomCheckResult result : results.findByRoomId(roomId)) {
            options.deleteByResultId(result.getId());
            results.delete(result);
        }
        results.flush();
        append(roomId, answers);
    }
}
