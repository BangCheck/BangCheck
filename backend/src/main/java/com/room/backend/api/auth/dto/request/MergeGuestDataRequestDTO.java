package com.room.backend.api.auth.dto.request;

import com.room.backend.api.room.dto.request.RoomWithCheckAnswerRequestDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
public class MergeGuestDataRequestDTO {
    private List<RoomWithCheckAnswerRequestDTO> rooms = new ArrayList<>();
}
