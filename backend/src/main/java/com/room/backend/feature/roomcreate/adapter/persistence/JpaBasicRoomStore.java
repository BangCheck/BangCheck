package com.room.backend.feature.roomcreate.adapter.persistence;

import com.room.backend.domain.room.entity.Room;
import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomcreate.application.port.BasicRoomStore;
import com.room.backend.feature.roomcreate.domain.RoomCreateData;
import com.room.backend.feature.shared.room.RoomSnapshot;
import com.room.backend.feature.shared.room.RoomSnapshotMapper;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.RoomErrorCode;
import com.room.backend.global.geocoding.service.GeocodingService;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;

public final class JpaBasicRoomStore implements BasicRoomStore {
    private final RoomRepository rooms;
    private final GeocodingService geocoding;
    private final TransactionTemplate transactions;
    public JpaBasicRoomStore(RoomRepository rooms, GeocodingService geocoding, TransactionTemplate transactions) {
        this.rooms = rooms; this.geocoding = geocoding; this.transactions = transactions;
    }
    @Override public RoomSnapshot create(long ownerId, RoomCreateData data) {
        return transactions.execute(ignored -> {
            if (rooms.countByUserIdAndIsDeletedFalse(ownerId) >= 6) {
                throw new GeneralException(RoomErrorCode.ROOM_LIMIT_EXCEEDED);
            }
            BigDecimal[] coordinates = geocoding.getCoordinates(data.address());
            BigDecimal lat = coordinates != null ? coordinates[0] : null;
            BigDecimal lon = coordinates != null ? coordinates[1] : null;
            Room saved = rooms.save(Room.create(ownerId, data.name(), data.address(), lat, lon, data.rentType(),
                    data.deposit(), data.rent(), data.managementFeeUnknown(), data.managementFee(), data.hasLoan(),
                    data.loanAmount(), data.canRegisterAddress(), data.moveInDate(), data.moveInDateNegotiable(),
                    data.buildingType(), data.floor(), data.hasElevator(), data.hasParking(), data.specialFloor(),
                    data.direction(), data.memo()));
            return RoomSnapshotMapper.from(saved);
        });
    }
}
