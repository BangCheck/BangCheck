package com.room.backend.domain.checklist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CustomItemCreateRequest {
    @NotBlank(message = "itemName은 공백일 수 없습니다.")
    @Size(max = 100, message = "itemName은 최대 100자입니다.")
    private String itemName;
}
