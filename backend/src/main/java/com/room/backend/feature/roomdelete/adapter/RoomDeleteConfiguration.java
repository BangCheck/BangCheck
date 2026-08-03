package com.room.backend.feature.roomdelete.adapter;

import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomdelete.adapter.persistence.JpaRoomDeletionStore;
import com.room.backend.feature.roomdelete.application.DeleteRoom;
import com.room.backend.feature.roomdelete.application.port.RoomDeletionStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration(proxyBeanMethods = false)
public class RoomDeleteConfiguration {
    @Bean RoomDeletionStore roomDeletionStore(RoomRepository rooms, PlatformTransactionManager tx) {
        return new JpaRoomDeletionStore(rooms, new TransactionTemplate(tx));
    }
    @Bean DeleteRoom deleteRoom(RoomDeletionStore store) { return new DeleteRoom(store); }
}
