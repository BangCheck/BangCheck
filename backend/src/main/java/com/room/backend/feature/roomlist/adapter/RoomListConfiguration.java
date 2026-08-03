package com.room.backend.feature.roomlist.adapter;

import com.room.backend.domain.checklist.repository.ChecklistItemRepository;
import com.room.backend.domain.checklist.repository.ChecklistOptionRepository;
import com.room.backend.domain.checklist.repository.RoomCheckResultRepository;
import com.room.backend.domain.checklist.repository.RoomCheckSelectedOptionRepository;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomlist.adapter.persistence.JpaRoomCatalog;
import com.room.backend.feature.roomlist.adapter.persistence.JpaRoomIssueLookup;
import com.room.backend.feature.roomlist.application.ListMyRooms;
import com.room.backend.feature.roomlist.application.port.RoomCatalog;
import com.room.backend.feature.roomlist.application.port.RoomIssueLookup;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 이 slice의 유일한 Spring 등록 지점.
 */
@Configuration(proxyBeanMethods = false)
public class RoomListConfiguration {

    @Bean
    RoomCatalog roomListCatalog(RoomRepository roomRepository) {
        return new JpaRoomCatalog(roomRepository);
    }

    @Bean
    RoomIssueLookup roomListIssueLookup(
            RoomCheckResultRepository roomCheckResultRepository,
            RoomCheckSelectedOptionRepository roomCheckSelectedOptionRepository,
            ChecklistItemRepository checklistItemRepository,
            ChecklistOptionRepository checklistOptionRepository) {
        return new JpaRoomIssueLookup(
                roomCheckResultRepository,
                roomCheckSelectedOptionRepository,
                checklistItemRepository,
                checklistOptionRepository);
    }

    @Bean
    ListMyRooms listMyRooms(RoomCatalog roomCatalog, RoomIssueLookup roomIssueLookup) {
        return new ListMyRooms(roomCatalog, roomIssueLookup);
    }
}
