package com.room.backend.feature.roomcreate.adapter;

import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomcreate.adapter.persistence.JpaBasicRoomStore;
import com.room.backend.feature.roomcreate.application.CreateRoom;
import com.room.backend.feature.roomcreate.application.port.BasicRoomStore;
import com.room.backend.global.geocoding.service.GeocodingService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
public class RoomCreateConfiguration {
    @Bean BasicRoomStore basicRoomStore(RoomRepository rooms, GeocodingService geocoding,
            PlatformTransactionManager tx) {
        return new JpaBasicRoomStore(rooms, geocoding, new TransactionTemplate(tx));
    }
    @Bean CreateRoom createRoom(BasicRoomStore store) { return new CreateRoom(store); }
}
