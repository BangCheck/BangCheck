package com.room.backend.feature.roomdetail.application;

import com.room.backend.feature.roomdetail.application.port.ChecklistResultDetailsLookup;
import com.room.backend.feature.roomdetail.application.port.RoomDetailsCatalog;
import com.room.backend.feature.roomdetail.domain.ChecklistResultDetails;
import com.room.backend.feature.roomdetail.domain.RoomDetails;
import java.util.List;
import java.util.Optional;

/**
 * 이관: {@code RoomService.getRoom} + {@code RoomCheckResultService.getCheckResults} → 이 use case.
 * 소유자의 활성 방을 찾은 뒤에만 체크리스트 결과를 조회한다.
 */
public final class GetRoomDetails {
    private final RoomDetailsCatalog roomCatalog;
    private final ChecklistResultDetailsLookup checklistResults;

    public GetRoomDetails(RoomDetailsCatalog roomCatalog, ChecklistResultDetailsLookup checklistResults) {
        this.roomCatalog = roomCatalog;
        this.checklistResults = checklistResults;
    }

    public Optional<Result> handle(GetRoomDetailsQuery query) {
        return roomCatalog.findActiveRoom(query.roomId(), query.ownerId())
                .map(room -> new Result(room, checklistResults.findByRoomId(room.id())));
    }

    public record Result(RoomDetails room, List<ChecklistResultDetails> checkResults) {
        public Result { checkResults = List.copyOf(checkResults); }
    }
}
