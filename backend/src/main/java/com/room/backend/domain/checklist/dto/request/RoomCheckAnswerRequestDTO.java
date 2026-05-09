package com.room.backend.domain.checklist.dto.request;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RoomCheckAnswerRequestDTO {
    
    private Long itemId;
    private String valueText;
    private BigDecimal valueNumber;
    private List<Long> selectedOptionIds = new ArrayList<>();
}
