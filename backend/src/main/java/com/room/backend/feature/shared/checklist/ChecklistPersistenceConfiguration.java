package com.room.backend.feature.shared.checklist;

import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ChecklistPersistenceConfiguration {
    @Bean ChecklistAnswerPersistence checklistAnswerPersistence(
            RoomCheckResultRepository results, RoomCheckSelectedOptionRepository options) {
        return new ChecklistAnswerPersistence(results, options);
    }
}
