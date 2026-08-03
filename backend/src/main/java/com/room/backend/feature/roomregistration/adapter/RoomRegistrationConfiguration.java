package com.room.backend.feature.roomregistration.adapter;

import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomregistration.adapter.geocoding.NaverAddressCoordinateLookup;
import com.room.backend.feature.roomregistration.adapter.persistence.JpaChecklistAnswerStore;
import com.room.backend.feature.roomregistration.adapter.persistence.JpaRoomStore;
import com.room.backend.feature.roomregistration.adapter.transaction.SpringTransactionBoundary;
import com.room.backend.feature.roomregistration.application.RegisterRoomWithChecklist;
import com.room.backend.feature.roomregistration.application.port.AddressCoordinateLookup;
import com.room.backend.feature.roomregistration.application.port.ChecklistAnswerStore;
import com.room.backend.feature.roomregistration.application.port.RoomStore;
import com.room.backend.feature.roomregistration.application.port.TransactionBoundary;
import com.room.backend.feature.shared.checklist.ChecklistAnswerPersistence;
import com.room.backend.global.geocoding.service.GeocodingService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * 이 slice의 유일한 Spring 등록 지점.
 *
 * <p>domain과 application에는 프레임워크 애노테이션이 없다. 조립은 전부 여기서 명시적으로 한다.
 *
 * <p>[경계] 이 configuration은 bean을 만들 뿐 어떤 route도 노출하지 않는다. 기존 컨트롤러가
 * 이 use case로 전환되기 전까지 제품 동작은 변하지 않으며 route oracle도 그대로다.
 */
@Configuration(proxyBeanMethods = false)
public class RoomRegistrationConfiguration {

    @Bean
    TransactionBoundary roomRegistrationTransactionBoundary(PlatformTransactionManager transactionManager) {
        return new SpringTransactionBoundary(new TransactionTemplate(transactionManager));
    }

    @Bean
    RoomStore roomRegistrationRoomStore(RoomRepository roomRepository) {
        return new JpaRoomStore(roomRepository);
    }

    @Bean
    ChecklistAnswerStore roomRegistrationChecklistAnswerStore(ChecklistAnswerPersistence persistence) {
        return new JpaChecklistAnswerStore(persistence);
    }

    @Bean
    AddressCoordinateLookup roomRegistrationAddressCoordinateLookup(GeocodingService geocodingService) {
        return new NaverAddressCoordinateLookup(geocodingService);
    }

    @Bean
    RegisterRoomWithChecklist registerRoomWithChecklist(
            TransactionBoundary transactionBoundary,
            RoomStore roomStore,
            ChecklistAnswerStore checklistAnswerStore,
            AddressCoordinateLookup addressCoordinateLookup) {
        return new RegisterRoomWithChecklist(
                transactionBoundary, roomStore, checklistAnswerStore, addressCoordinateLookup);
    }
}
