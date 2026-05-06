package com.room.backend.domain.checklist.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ChecklistSettingsRequest {
    private List<Long> disabledItemIds;
}
