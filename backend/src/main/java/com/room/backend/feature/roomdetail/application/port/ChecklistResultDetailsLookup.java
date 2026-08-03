package com.room.backend.feature.roomdetail.application.port;

import com.room.backend.feature.roomdetail.domain.ChecklistResultDetails;
import java.util.List;

public interface ChecklistResultDetailsLookup {
    List<ChecklistResultDetails> findByRoomId(long roomId);
}
