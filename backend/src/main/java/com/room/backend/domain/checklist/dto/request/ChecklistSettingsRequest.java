package com.room.backend.domain.checklist.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ChecklistSettingsRequest {
    @NotNull(message = "disabledItemIds는 필수입니다. 비활성 항목이 없으면 빈 배열로 보내십시오.")
    private List<Long> disabledItemIds;
}
