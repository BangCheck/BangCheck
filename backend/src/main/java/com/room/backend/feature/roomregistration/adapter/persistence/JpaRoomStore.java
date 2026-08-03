package com.room.backend.feature.roomregistration.adapter.persistence;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomregistration.application.port.RoomStore;
import com.room.backend.feature.roomregistration.domain.BuildingProfile;
import com.room.backend.feature.roomregistration.domain.Coordinates;
import com.room.backend.feature.roomregistration.domain.MaintenanceCost;
import com.room.backend.feature.roomregistration.domain.MoveInTerms;
import com.room.backend.feature.roomregistration.domain.RentTerms;
import com.room.backend.feature.roomregistration.domain.RoomRegistration;

/**
 * 기존 {@link Room} entity와 {@link RoomRepository}에 위임하는 영속화 adapter.
 *
 * <p>[설계] 신규 JPA entity를 만들지 않는다. {@code rooms} 테이블을 두 번 매핑하면 Hibernate가
 * 깨지고, 신규 타입이 legacy entity graph에서 도달 가능해져 격리 조건도 깨진다.
 *
 * <p>[계약 보존] 임대·융자·관리비 값을 {@code Room.create}에 그대로 넘겨 legacy 검증을 다시 태운다.
 * 도메인이 이미 같은 규칙을 통과시켰으므로 결과는 동일하며, 검증 로직이 두 곳에서 갈라질 수 없다.
 */
public final class JpaRoomStore implements RoomStore {

    private final RoomRepository roomRepository;

    public JpaRoomStore(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public int countActiveRoomsOf(long ownerId) {
        return roomRepository.countByUserIdAndIsDeletedFalse(ownerId);
    }

    @Override
    public StoredRoom save(RoomRegistration registration) {
        RentTerms rentTerms = registration.rentTerms();
        MaintenanceCost maintenanceCost = registration.maintenanceCost();
        BuildingProfile building = registration.building();
        MoveInTerms moveIn = registration.moveIn();

        Room room = Room.create(
                registration.ownerId(),
                registration.name(),
                registration.address(),
                registration.coordinates().map(Coordinates::latitude).orElse(null),
                registration.coordinates().map(Coordinates::longitude).orElse(null),
                rentTerms.storedRentType(),
                rentTerms.storedDeposit(),
                rentTerms.storedMonthlyRent(),
                maintenanceCost.unknownFlag(),
                maintenanceCost.storedFee(),
                registration.loanBurden().declared(),
                registration.loanBurden().amount(),
                moveIn.canRegisterAddress(),
                moveIn.availableFrom(),
                moveIn.negotiable(),
                building.buildingType(),
                building.floor(),
                building.hasElevator(),
                building.hasParking(),
                building.specialFloor(),
                building.direction(),
                registration.memo());

        Room saved = roomRepository.save(room);
        return new StoredRoom(saved.getId(), saved.getCreatedAt());
    }
}
