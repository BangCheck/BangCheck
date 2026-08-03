package com.room.backend.feature.roomdetail.adapter;

import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomdetail.adapter.persistence.JpaChecklistResultDetailsLookup;
import com.room.backend.feature.roomdetail.adapter.persistence.JpaRoomDetailsCatalog;
import com.room.backend.feature.roomdetail.application.GetRoomDetails;
import com.room.backend.feature.roomdetail.application.port.ChecklistResultDetailsLookup;
import com.room.backend.feature.roomdetail.application.port.RoomDetailsCatalog;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class RoomDetailConfiguration {
    @Bean
    RoomDetailsCatalog roomDetailsCatalog(RoomRepository roomRepository) {
        return new JpaRoomDetailsCatalog(roomRepository);
    }

    @Bean
    ChecklistResultDetailsLookup checklistResultDetailsLookup(
            RoomCheckResultRepository resultRepository,
            RoomCheckSelectedOptionRepository selectedOptionRepository,
            ChecklistItemRepository itemRepository,
            ChecklistOptionRepository optionRepository) {
        return new JpaChecklistResultDetailsLookup(
                resultRepository, selectedOptionRepository, itemRepository, optionRepository);
    }

    @Bean
    GetRoomDetails getRoomDetails(RoomDetailsCatalog roomCatalog, ChecklistResultDetailsLookup results) {
        return new GetRoomDetails(roomCatalog, results);
    }
}
