package com.room.backend.api.room.dto.request;

import java.util.List;

import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RoomUpdateWithCheckAnswerRequestDTO extends RoomUpdateRequestDTO {
    private List<RoomCheckAnswerRequestDTO> checkAnswers;
    
}
