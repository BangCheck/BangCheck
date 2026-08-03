package com.room.backend.feature.roomlist.adapter.persistence;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomlist.application.port.RoomCatalog;
import com.room.backend.feature.roomlist.domain.ListedRoom;

import java.util.List;

/**
 * 기존 {@link RoomRepository}에 위임하는 목록 조회 adapter.
 *
 * <p>[계약 보존] {@code findRoomsWithFilter}를 그대로 쓴다. 이 쿼리가 소유자 일치, rentType null이면
 * 전체, soft-delete 제외, 생성 최신순 정렬을 모두 담고 있다.
 */
public final class JpaRoomCatalog implements RoomCatalog {

    private final RoomRepository roomRepository;

    public JpaRoomCatalog(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public List<ListedRoom> findActiveRoomsOf(long ownerId, RentType rentType) {
        return roomRepository.findRoomsWithFilter(ownerId, rentType).stream()
                .map(JpaRoomCatalog::toListedRoom)
                .toList();
    }

    private static ListedRoom toListedRoom(Room room) {
        return new ListedRoom(
                room.getId(),
                room.getName(),
                room.getAddress(),
                room.getRentType(),
                room.getDeposit(),
                room.getMonthlyRent(),
                room.getMaintenanceFee(),
                room.getFloor(),
                room.getDirection(),
                room.getMemo(),
                room.getBuildingType(),
                room.getCreatedAt());
    }
}
