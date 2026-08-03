package com.room.backend.feature.roomupdate.adapter.persistence;

import com.room.backend.domain.room.repository.RoomRepository;
import com.room.backend.feature.roomupdate.application.port.RoomUpdateStore;
import com.room.backend.feature.roomupdate.domain.RoomUpdateData;
import com.room.backend.feature.shared.checklist.ChecklistAnswerPersistence;
import com.room.backend.feature.shared.checklist.PersistableChecklistAnswer;
import com.room.backend.feature.shared.room.RoomSnapshotMapper;
import com.room.backend.global.geocoding.service.GeocodingService;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.util.Optional;

public final class JpaRoomUpdateStore implements RoomUpdateStore {
    private final RoomRepository rooms;
    private final GeocodingService geocoding;
    private final ChecklistAnswerPersistence checklistAnswers;
    private final TransactionTemplate transactions;
    public JpaRoomUpdateStore(RoomRepository rooms, GeocodingService geocoding,
            ChecklistAnswerPersistence checklistAnswers, TransactionTemplate transactions) {
        this.rooms = rooms; this.geocoding = geocoding; this.checklistAnswers = checklistAnswers;
        this.transactions = transactions;
    }
    @Override public Optional<UpdatedRoom> update(long roomId, long ownerId, RoomUpdateData data) {
        return transactions.execute(ignored -> rooms.findByIdAndUserIdAndIsDeletedFalse(roomId, ownerId).map(room -> {
            BigDecimal lat = null;
            BigDecimal lon = null;
            if (data.address() != null) {
                BigDecimal[] coordinates = geocoding.getCoordinates(data.address());
                lat = coordinates != null ? coordinates[0] : null;
                lon = coordinates != null ? coordinates[1] : null;
            }
            room.update(new com.room.backend.domain.room.entity.Room.UpdateValues(
                    data.name(), data.address(), data.rentType(), data.deposit(), data.rent(),
                    data.managementFeeUnknown(), data.managementFee(), data.hasLoan(), data.loanAmount(),
                    data.canRegisterAddress(), data.moveInDate(), data.moveInDateNegotiable(), data.buildingType(),
                    data.floor(), data.hasElevator(), data.hasParking(), data.specialFloor(), data.direction(), data.memo()),
                    lat, lon);
            if (!data.answers().isEmpty()) {
                checklistAnswers.replace(roomId, data.answers().stream().map(answer ->
                        new PersistableChecklistAnswer(answer.itemId(), answer.valueText(),
                                answer.valueNumber(), answer.optionIds())).toList());
            }
            return new UpdatedRoom(RoomSnapshotMapper.from(room));
        }));
    }
}
