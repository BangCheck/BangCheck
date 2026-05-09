package com.room.backend.api.room.dto.request;

import java.util.ArrayList;
import java.util.List;

import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RoomUpdateWithCheckAnswerRequestDTO extends RoomUpdateRequestDTO {
    private List<RoomCheckAnswerRequestDTO> checkAnswers = new ArrayList<>();

}
