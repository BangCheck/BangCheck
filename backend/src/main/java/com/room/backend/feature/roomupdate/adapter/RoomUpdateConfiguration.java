package com.room.backend.feature.roomupdate.adapter;

import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomupdate.adapter.persistence.JpaRoomUpdateStore;
import com.room.backend.feature.roomupdate.application.UpdateRoomWithAnswers;
import com.room.backend.feature.roomupdate.application.port.RoomUpdateStore;
import com.room.backend.feature.shared.checklist.ChecklistAnswerPersistence;
import com.room.backend.global.geocoding.service.GeocodingService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
public class RoomUpdateConfiguration {
    @Bean RoomUpdateStore roomUpdateStore(RoomRepository rooms, GeocodingService geocoding,
            ChecklistAnswerPersistence checklistAnswers, PlatformTransactionManager tx) {
        return new JpaRoomUpdateStore(rooms, geocoding, checklistAnswers, new TransactionTemplate(tx));
    }
    @Bean UpdateRoomWithAnswers updateRoomWithAnswers(RoomUpdateStore store) { return new UpdateRoomWithAnswers(store); }
}
