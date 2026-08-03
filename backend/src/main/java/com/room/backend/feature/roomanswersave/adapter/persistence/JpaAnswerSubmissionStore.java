package com.room.backend.feature.roomanswersave.adapter.persistence;

import com.room.backend.feature.roomanswersave.application.port.AnswerSubmissionStore;
import com.room.backend.feature.roomanswersave.domain.AnswerSubmission;
import com.room.backend.feature.shared.checklist.ChecklistAnswerPersistence;
import com.room.backend.feature.shared.checklist.PersistableChecklistAnswer;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.List;

public final class JpaAnswerSubmissionStore implements AnswerSubmissionStore {
    private final ChecklistAnswerPersistence persistence;
    private final TransactionTemplate transactions;
    public JpaAnswerSubmissionStore(ChecklistAnswerPersistence persistence, TransactionTemplate transactions) {
        this.persistence = persistence; this.transactions = transactions;
    }
    @Override public void save(long roomId, List<AnswerSubmission> answers) {
        transactions.executeWithoutResult(ignored -> {
            persistence.append(roomId, answers.stream().map(answer -> new PersistableChecklistAnswer(
                    answer.itemId(), answer.valueText(), answer.valueNumber(), answer.optionIds())).toList());
        });
    }
}
