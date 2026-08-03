package com.room.backend.feature.roomanswersave.adapter;

import com.room.backend.feature.roomanswersave.adapter.persistence.JpaAnswerSubmissionStore;
import com.room.backend.feature.roomanswersave.application.SaveRoomAnswers;
import com.room.backend.feature.roomanswersave.application.port.AnswerSubmissionStore;
import com.room.backend.feature.shared.checklist.ChecklistAnswerPersistence;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
public class RoomAnswerSaveConfiguration {
    @Bean AnswerSubmissionStore answerSubmissionStore(ChecklistAnswerPersistence persistence,
            PlatformTransactionManager tx) {
        return new JpaAnswerSubmissionStore(persistence, new TransactionTemplate(tx));
    }
    @Bean SaveRoomAnswers saveRoomAnswers(AnswerSubmissionStore store) { return new SaveRoomAnswers(store); }
}
