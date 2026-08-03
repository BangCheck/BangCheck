package com.room.backend.feature.roomanswersave.adapter.web;

import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.feature.roomanswersave.domain.AnswerSubmission;
import java.util.List;

public final class AnswerSubmissionMapper {
    private AnswerSubmissionMapper() { }
    public static List<AnswerSubmission> from(List<RoomCheckAnswerRequestDTO> answers) {
        return answers.stream().map(answer -> new AnswerSubmission(
                answer.getItemId(), answer.getValueText(), answer.getValueNumber(), answer.getSelectedOptionIds())).toList();
    }
}
